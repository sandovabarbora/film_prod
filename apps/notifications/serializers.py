# apps/notifications/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils import timezone
from .models import (
    NotificationTemplate, Notification, NotificationPreference,
    BulkNotification, NotificationLog, SMSProvider, PushProvider
)

class NotificationTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationTemplate
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

class NotificationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationLog
        fields = '__all__'
        read_only_fields = ['timestamp']

class NotificationListSerializer(serializers.ModelSerializer):
    recipient_name = serializers.CharField(source='get_recipient_name', read_only=True)
    production_title = serializers.CharField(source='production.title', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'recipient_name', 'subject', 'notification_type', 
            'priority', 'status', 'created_at', 'read_at', 
            'action_required', 'production_title'
        ]

class NotificationDetailSerializer(serializers.ModelSerializer):
    recipient_name = serializers.CharField(source='get_recipient_name', read_only=True)
    logs = NotificationLogSerializer(many=True, read_only=True)
    
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'sent_at', 'read_at']

class NotificationCreateSerializer(serializers.ModelSerializer):
    recipient_users = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    recipient_crew_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )
    use_template = serializers.IntegerField(write_only=True, required=False)
    template_variables = serializers.DictField(write_only=True, required=False)
    
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'sent_at', 'read_at', 'status']
    
    def create(self, validated_data):
        # Extract custom fields
        recipient_users = validated_data.pop('recipient_users', [])
        recipient_crew_ids = validated_data.pop('recipient_crew_ids', [])
        template_id = validated_data.pop('use_template', None)
        template_vars = validated_data.pop('template_variables', {})
        
        notifications = []
        
        # Apply template if specified
        if template_id:
            template = NotificationTemplate.objects.get(id=template_id)
            validated_data['subject'] = template.subject.format(**template_vars)
            validated_data['body'] = template.body.format(**template_vars)
            validated_data['channels'] = []
            if template.send_email:
                validated_data['channels'].append('email')
            if template.send_sms:
                validated_data['channels'].append('sms')
            if template.send_push:
                validated_data['channels'].append('push')
            if template.send_in_app:
                validated_data['channels'].append('in_app')
        
        # Create notifications for each recipient
        for user_id in recipient_users:
            notification = Notification.objects.create(
                recipient_user_id=user_id,
                **validated_data
            )
            notifications.append(notification)
        
        for crew_id in recipient_crew_ids:
            notification = Notification.objects.create(
                recipient_crew_id=crew_id,
                **validated_data
            )
            notifications.append(notification)
        
        # If single recipient was specified directly
        if not recipient_users and not recipient_crew_ids:
            notification = Notification.objects.create(**validated_data)
            notifications.append(notification)
        
        # Return first notification (or handle multiple)
        return notifications[0] if notifications else None

class NotificationPreferenceSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = NotificationPreference
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']

class BulkNotificationSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    production_title = serializers.CharField(source='production.title', read_only=True)
    
    class Meta:
        model = BulkNotification
        fields = '__all__'
        read_only_fields = [
            'id', 'recipient_count', 'sent_count', 'failed_count',
            'created_at', 'sent_at', 'created_by'
        ]

class BulkNotificationCreateSerializer(serializers.ModelSerializer):
    preview = serializers.BooleanField(write_only=True, default=False)
    test_recipients = serializers.ListField(
        child=serializers.EmailField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = BulkNotification
        fields = '__all__'
        read_only_fields = [
            'id', 'recipient_count', 'sent_count', 'failed_count',
            'created_at', 'sent_at', 'status'
        ]
    
    def validate(self, data):
        # Validate recipient filters
        if data.get('recipient_type') == 'department':
            if 'department_ids' not in data.get('recipient_filters', {}):
                raise serializers.ValidationError(
                    "department_ids required in recipient_filters"
                )
        elif data.get('recipient_type') == 'position':
            if 'position_ids' not in data.get('recipient_filters', {}):
                raise serializers.ValidationError(
                    "position_ids required in recipient_filters"
                )
        
        return data

class NotificationStatsSerializer(serializers.Serializer):
    """Statistics for notifications"""
    total = serializers.IntegerField()
    unread = serializers.IntegerField()
    action_required = serializers.IntegerField()
    
    by_type = serializers.DictField(child=serializers.IntegerField())
    by_priority = serializers.DictField(child=serializers.IntegerField())
    by_status = serializers.DictField(child=serializers.IntegerField())
    
    today = serializers.IntegerField()
    this_week = serializers.IntegerField()
    this_month = serializers.IntegerField()

class MarkAsReadSerializer(serializers.Serializer):
    notification_ids = serializers.ListField(
        child=serializers.UUIDField(),
        allow_empty=False
    )

class SendTestNotificationSerializer(serializers.Serializer):
    """Send test notification"""
    template_id = serializers.IntegerField(required=False)
    recipient_email = serializers.EmailField()
    subject = serializers.CharField(max_length=200)
    body = serializers.CharField()
    channels = serializers.ListField(
        child=serializers.ChoiceField(choices=['email', 'sms', 'push']),
        default=['email']
    )

class SMSProviderSerializer(serializers.ModelSerializer):
    # Mask sensitive data in responses
    api_key_masked = serializers.SerializerMethodField()
    api_secret_masked = serializers.SerializerMethodField()
    
    class Meta:
        model = SMSProvider
        fields = '__all__'
        extra_kwargs = {
            'api_key': {'write_only': True},
            'api_secret': {'write_only': True}
        }
    
    def get_api_key_masked(self, obj):
        if obj.api_key:
            return f"****{obj.api_key[-4:]}"
        return None
    
    def get_api_secret_masked(self, obj):
        if obj.api_secret:
            return f"****{obj.api_secret[-4:]}"
        return None

class PushProviderSerializer(serializers.ModelSerializer):
    class Meta:
        model = PushProvider
        fields = '__all__'
        extra_kwargs = {
            'config': {'write_only': True}
        }

class NotificationChannelStatusSerializer(serializers.Serializer):
    """Check channel delivery status"""
    email = serializers.DictField(required=False)
    sms = serializers.DictField(required=False)
    push = serializers.DictField(required=False)
    in_app = serializers.DictField(required=False)

class ScheduleDigestSerializer(serializers.Serializer):
    """Schedule digest notifications"""
    production_id = serializers.UUIDField()
    digest_type = serializers.ChoiceField(choices=[
        ('daily', 'Daily'),
        ('weekly', 'Weekly')
    ])
    send_time = serializers.TimeField()
    include_stats = serializers.BooleanField(default=True)
    include_tomorrow = serializers.BooleanField(default=True)

class UnsubscribeSerializer(serializers.Serializer):
    """Handle unsubscribe requests"""
    token = serializers.CharField()
    reason = serializers.CharField(required=False)
    feedback = serializers.CharField(required=False)
