# apps/realtime/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser

class ProductionConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.production_id = self.scope['url_route']['kwargs']['production_id']
        self.production_group_name = f'production_{self.production_id}'
        
        # Join production group
        await self.channel_layer.group_add(
            self.production_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send initial production state
        await self.send_production_state()
    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.production_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data['type']
        
        if message_type == 'status_update':
            await self.handle_status_update(data)
        elif message_type == 'shot_progress':
            await self.handle_shot_progress(data)
        elif message_type == 'crew_checkin':
            await self.handle_crew_checkin(data)
    
    async def handle_status_update(self, data):
        """Handle real-time status updates"""
        await self.save_status_update(data)
        
        # Broadcast to all clients in production
        await self.channel_layer.group_send(
            self.production_group_name,
            {
                'type': 'status_broadcast',
                'data': data
            }
        )
    
    async def status_broadcast(self, event):
        await self.send(text_data=json.dumps({
            'type': 'status_update',
            'data': event['data']
        }))
    
    @database_sync_to_async
    def save_status_update(self, data):
        from apps.notifications.models import StatusUpdate
        from apps.production.models import Production
        from apps.schedule.models import ShootingDay
        from apps.crew.models import CrewMember
        
        production = Production.objects.get(id=self.production_id)
        shooting_day = ShootingDay.objects.filter(
            production=production,
            date=timezone.now().date()
        ).first()
        
        if shooting_day:
            StatusUpdate.objects.create(
                production=production,
                shooting_day=shooting_day,
                updated_by=CrewMember.objects.first(),  # TODO: Get from auth
                current_scene=data.get('current_scene', ''),
                current_shot=data.get('current_shot', ''),
                current_status=data.get('current_status', 'prep'),
                notes=data.get('notes', '')
            )

# apps/realtime/routing.py
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/production/(?P<production_id>\w+)/$', consumers.ProductionConsumer.as_asgi()),
]

# apps/realtime/middleware.py
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser

class WebSocketAuthMiddleware(BaseMiddleware):
    """Custom auth middleware for WebSocket connections"""
    
    async def __call__(self, scope, receive, send):
        # Simple token-based auth for WebSocket
        query_string = scope.get('query_string', b'').decode()
        
        if 'token=' in query_string:
            token = query_string.split('token=')[1].split('&')[0]
            # Validate token and set user
            scope['user'] = await self.get_user_from_token(token)
        else:
            scope['user'] = AnonymousUser()
        
        return await super().__call__(scope, receive, send)
    
    @database_sync_to_async
    def get_user_from_token(self, token):
        # Implement token validation
        return AnonymousUser()