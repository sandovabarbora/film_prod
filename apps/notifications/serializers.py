from rest_framework import serializers
from .models import (
    NotificationChannel, Notification, NotificationRecipient,
    LiveStatusUpdate, WeatherAlert
)

class NotificationChannelSerializer(serializers.ModelSerializer):
    """Notification channel serializer"""
    production_title = serializers.CharField(source='production.title', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = NotificationChannel
        fields = '__all__'
        read_only_fields = ['id', 'created_at']

class NotificationRecipientSerializer(serializers.ModelSerializer):
    """Notification recipient serializer"""
    crew_member_name = serializers.CharField(source='crew_member.display_name', read_only=True)
    crew_member_position = serializers.CharField(source='crew_member.primary_position.title', read_only=True)
    
    class Meta:
        model = NotificationRecipient
        fields = '__all__'

class NotificationListSerializer(serializers.ModelSerializer):
    """Notification list serializer"""
    sender_name = serializers.CharField(source='sender.display_name', read_only=True)
    channel_name = serializers.CharField(source='channel.name', read_only=True)
    recipients_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'priority', 'title', 'message',
            'sender_name', 'channel_name', 'sent_at', 'expires_at',
            'recipients_count', 'is_auto_generated'
        ]
    
    def get_recipients_count(self, obj):
        return obj.recipients.count()

class NotificationDetailSerializer(serializers.ModelSerializer):
    """Notification detail serializer"""
    sender_name = serializers.CharField(source='sender.display_name', read_only=True)
    channel_name = serializers.CharField(source='channel.name', read_only=True)
    production_title = serializers.CharField(source='production.title', read_only=True)
    recipients = NotificationRecipientSerializer(many=True, read_only=True)
    
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['id', 'sent_at']

class LiveStatusUpdateSerializer(serializers.ModelSerializer):
    """Live status update serializer"""
    updated_by_name = serializers.CharField(source='updated_by.display_name', read_only=True)
    production_title = serializers.CharField(source='production.title', read_only=True)
    shooting_day_number = serializers.IntegerField(source='shooting_day.day_number', read_only=True)
    
    class Meta:
        model = LiveStatusUpdate
        fields = '__all__'
        read_only_fields = ['id', 'timestamp']

class WeatherAlertSerializer(serializers.ModelSerializer):
    """Weather alert serializer"""
    production_title = serializers.CharField(source='production.title', read_only=True)
    shooting_day_number = serializers.IntegerField(source='shooting_day.day_number', read_only=True)
    is_active = serializers.SerializerMethodField()
    
    class Meta:
        model = WeatherAlert
        fields = '__all__'
        read_only_fields = ['id', 'created_at']
    
    def get_is_active(self, obj):
        from django.utils import timezone
        now = timezone.now()
        return obj.valid_from <= now <= obj.valid_until