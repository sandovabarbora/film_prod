from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count
from django.utils import timezone
from datetime import timedelta

from .models import (
    NotificationChannel, Notification, NotificationRecipient,
    LiveStatusUpdate, WeatherAlert
)
from .serializers import (
    NotificationChannelSerializer, NotificationListSerializer,
    NotificationDetailSerializer, NotificationRecipientSerializer,
    LiveStatusUpdateSerializer, WeatherAlertSerializer
)

class NotificationChannelViewSet(viewsets.ModelViewSet):
    """Notification channels management"""
    queryset = NotificationChannel.objects.select_related('production', 'department')
    serializer_class = NotificationChannelSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by production
        production_id = self.request.query_params.get('production')
        if production_id:
            queryset = queryset.filter(production_id=production_id)
        
        # Only active channels by default
        include_inactive = self.request.query_params.get('include_inactive', 'false').lower() == 'true'
        if not include_inactive:
            queryset = queryset.filter(is_active=True)
        
        return queryset.order_by('name')

class NotificationViewSet(viewsets.ModelViewSet):
    """Notifications management"""
    queryset = Notification.objects.select_related(
        'production', 'channel', 'sender', 'shooting_day'
    ).prefetch_related('recipients')
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return NotificationListSerializer
        return NotificationDetailSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by production
        production_id = self.request.query_params.get('production')
        if production_id:
            queryset = queryset.filter(production_id=production_id)
        
        # Filter by channel
        channel_id = self.request.query_params.get('channel')
        if channel_id:
            queryset = queryset.filter(channel_id=channel_id)
        
        # Filter by type
        notification_type = self.request.query_params.get('type')
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)
        
        # Filter by priority
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
        
        # Recent notifications only
        hours_back = self.request.query_params.get('hours_back', 24)
        time_threshold = timezone.now() - timedelta(hours=int(hours_back))
        queryset = queryset.filter(sent_at__gte=time_threshold)
        
        return queryset.order_by('-sent_at')
    
    @action(detail=False, methods=['post'])
    def broadcast(self, request):
        """Send notification to multiple recipients"""
        data = request.data
        channel_id = data.get('channel_id')
        recipient_ids = data.get('recipient_ids', [])
        
        if not channel_id:
            return Response({'error': 'channel_id required'}, status=400)
        
        # Create notification
        notification_data = {
            'channel_id': channel_id,
            'sender': request.user.crew_member,  # Assuming user has crew_member relation
            'title': data.get('title'),
            'message': data.get('message'),
            'notification_type': data.get('notification_type', 'message'),
            'priority': data.get('priority', 'normal'),
        }
        
        serializer = NotificationDetailSerializer(data=notification_data)
        if serializer.is_valid():
            notification = serializer.save()
            
            # Create recipients
            for recipient_id in recipient_ids:
                NotificationRecipient.objects.create(
                    notification=notification,
                    crew_member_id=recipient_id
                )
            
            return Response({
                'notification': NotificationDetailSerializer(notification).data,
                'recipients_count': len(recipient_ids)
            })
        
        return Response(serializer.errors, status=400)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark notification as read for current user"""
        notification = self.get_object()
        
        # Find recipient record
        try:
            recipient = notification.recipients.get(
                crew_member__user=request.user
            )
            recipient.read_at = timezone.now()
            recipient.save()
            
            return Response({'message': 'Marked as read'})
        except NotificationRecipient.DoesNotExist:
            return Response({'error': 'Not a recipient'}, status=400)

class LiveStatusUpdateViewSet(viewsets.ModelViewSet):
    """Live status updates for dashboard"""
    queryset = LiveStatusUpdate.objects.select_related(
        'production', 'shooting_day', 'updated_by'
    )
    serializer_class = LiveStatusUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by production
        production_id = self.request.query_params.get('production')
        if production_id:
            queryset = queryset.filter(production_id=production_id)
        
        # Filter by shooting day
        shooting_day_id = self.request.query_params.get('shooting_day')
        if shooting_day_id:
            queryset = queryset.filter(shooting_day_id=shooting_day_id)
        
        # Recent updates only
        hours_back = self.request.query_params.get('hours_back', 12)
        time_threshold = timezone.now() - timedelta(hours=int(hours_back))
        queryset = queryset.filter(timestamp__gte=time_threshold)
        
        return queryset.order_by('-timestamp')
    
    @action(detail=False, methods=['get'])
    def latest(self, request):
        """Get latest status update for production"""
        production_id = request.query_params.get('production')
        if not production_id:
            return Response({'error': 'production_id required'}, status=400)
        
        latest_update = self.get_queryset().filter(
            production_id=production_id
        ).first()
        
        if latest_update:
            serializer = LiveStatusUpdateSerializer(latest_update)
            return Response(serializer.data)
        
        return Response({'message': 'No recent updates'})

class WeatherAlertViewSet(viewsets.ModelViewSet):
    """Weather alerts management"""
    queryset = WeatherAlert.objects.select_related('production', 'shooting_day')
    serializer_class = WeatherAlertSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by production
        production_id = self.request.query_params.get('production')
        if production_id:
            queryset = queryset.filter(production_id=production_id)
        
        # Active alerts only by default
        active_only = self.request.query_params.get('active_only', 'true').lower() == 'true'
        if active_only:
            now = timezone.now()
            queryset = queryset.filter(
                valid_from__lte=now,
                valid_until__gte=now
            )
        
        return queryset.order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def current_alerts(self, request):
        """Get current active weather alerts"""
        production_id = request.query_params.get('production')
        if not production_id:
            return Response({'error': 'production_id required'}, status=400)
        
        now = timezone.now()
        alerts = self.get_queryset().filter(
            production_id=production_id,
            valid_from__lte=now,
            valid_until__gte=now
        )
        
        serializer = WeatherAlertSerializer(alerts, many=True)
        return Response(serializer.data)