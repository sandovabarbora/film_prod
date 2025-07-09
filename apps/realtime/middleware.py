# apps/realtime/middleware.py
from urllib.parse import parse_qs
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser, User
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import get_user_model
import jwt
from django.conf import settings

User = get_user_model()

class WebSocketAuthMiddleware(BaseMiddleware):
    """Custom auth middleware for WebSocket connections"""
    
    async def __call__(self, scope, receive, send):
        # Extract token from query string or headers
        token = await self.get_token_from_scope(scope)
        
        if token:
            user = await self.get_user_from_token(token)
            scope['user'] = user
        else:
            scope['user'] = AnonymousUser()
        
        return await super().__call__(scope, receive, send)
    
    async def get_token_from_scope(self, scope):
        """Extract token from WebSocket connection"""
        # Try query string first
        query_string = scope.get('query_string', b'').decode()
        if query_string:
            query_params = parse_qs(query_string)
            if 'token' in query_params:
                return query_params['token'][0]
        
        # Try headers (Authorization: Bearer <token>)
        headers = dict(scope.get('headers', []))
        auth_header = headers.get(b'authorization', b'').decode()
        if auth_header.startswith('Bearer '):
            return auth_header.split(' ')[1]
        
        # Try subprotocol (for some clients)
        subprotocols = scope.get('subprotocols', [])
        for protocol in subprotocols:
            if protocol.startswith('access_token.'):
                return protocol.split('.', 1)[1]
        
        return None
    
    @database_sync_to_async
    def get_user_from_token(self, token):
        """Validate JWT token and return user"""
        try:
            # Validate token using SimpleJWT
            UntypedToken(token)
            
            # Decode token to get user info
            decoded_token = jwt.decode(
                token, 
                settings.SECRET_KEY, 
                algorithms=["HS256"]
            )
            
            user_id = decoded_token.get('user_id')
            if user_id:
                user = User.objects.get(id=user_id)
                return user
                
        except (InvalidToken, TokenError, jwt.ExpiredSignatureError, 
                jwt.InvalidTokenError, User.DoesNotExist):
            pass
        
        return AnonymousUser()

class WebSocketRateLimitMiddleware(BaseMiddleware):
    """Rate limiting middleware for WebSocket connections"""
    
    def __init__(self, inner):
        super().__init__(inner)
        self.connections = {}  # Track connections per IP
        self.max_connections_per_ip = 10
        self.max_messages_per_minute = 60
    
    async def __call__(self, scope, receive, send):
        client_ip = self.get_client_ip(scope)
        
        # Check connection limit
        if not await self.check_connection_limit(client_ip):
            await send({
                'type': 'websocket.close',
                'code': 4008,  # Policy violation
            })
            return
        
        # Wrap receive to count messages
        wrapped_receive = self.wrap_receive(receive, client_ip)
        
        return await super().__call__(scope, wrapped_receive, send)
    
    def get_client_ip(self, scope):
        """Extract client IP from scope"""
        client = scope.get('client', ['unknown', 0])
        return client[0] if client else 'unknown'
    
    async def check_connection_limit(self, client_ip):
        """Check if IP has too many connections"""
        current_connections = self.connections.get(client_ip, 0)
        if current_connections >= self.max_connections_per_ip:
            return False
        
        self.connections[client_ip] = current_connections + 1
        return True
    
    def wrap_receive(self, receive, client_ip):
        """Wrap receive to implement rate limiting"""
        async def wrapped():
            message = await receive()
            
            # Rate limit only websocket.receive messages
            if message['type'] == 'websocket.receive':
                if not await self.check_message_rate(client_ip):
                    # Drop message if rate limited
                    return {'type': 'websocket.disconnect', 'code': 4008}
            
            return message
        
        return wrapped
    
    async def check_message_rate(self, client_ip):
        """Simple in-memory rate limiting (production should use Redis)"""
        import time
        
        now = time.time()
        key = f"msg_rate_{client_ip}"
        
        if not hasattr(self, 'message_timestamps'):
            self.message_timestamps = {}
        
        if key not in self.message_timestamps:
            self.message_timestamps[key] = []
        
        # Clean old timestamps
        self.message_timestamps[key] = [
            ts for ts in self.message_timestamps[key] 
            if now - ts < 60  # Last minute
        ]
        
        # Check rate
        if len(self.message_timestamps[key]) >= self.max_messages_per_minute:
            return False
        
        self.message_timestamps[key].append(now)
        return True

# Combined middleware stack
def get_websocket_middleware_stack():
    """Get the complete WebSocket middleware stack"""
    from channels.auth import AuthMiddlewareStack
    
    return WebSocketRateLimitMiddleware(
        WebSocketAuthMiddleware(
            AuthMiddlewareStack(
                # Base middleware will be added here
            )
        )
    )