# apps/realtime/serializers.py
from rest_framework import serializers
from .models import WebSocketConnection, RealtimeEvent, ChatRoom, ChatMessage
from apps.crew.serializers import CrewMemberListSerializer

class WebSocketConnectionSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    production_title = serializers.CharField(source='production.title', read_only=True)
    
    class Meta:
        model = WebSocketConnection
        fields = [
            'id', 'user_name', 'production_title', 'connected_at',
            'last_ping', 'ip_address'
        ]

class RealtimeEventSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = RealtimeEvent
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'delivered_to', 'delivery_count']

class ChatRoomListSerializer(serializers.ModelSerializer):
    production_title = serializers.CharField(source='production.title', read_only=True)
    message_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = [
            'id', 'name', 'description', 'room_type', 'is_public',
            'production_title', 'message_count', 'last_message', 'created_at'
        ]
    
    def get_message_count(self, obj):
        return obj.messages.filter(is_deleted=False).count()
    
    def get_last_message(self, obj):
        last = obj.messages.filter(is_deleted=False).order_by('-created_at').first()
        if last:
            return {
                'text': last.text[:50],
                'user': last.user.get_full_name() if last.user else 'System',
                'created_at': last.created_at
            }
        return None

class ChatRoomDetailSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    allowed_users = serializers.PrimaryKeyRelatedField(
        many=True,
        read_only=True
    )
    
    class Meta:
        model = ChatRoom
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'created_by']

class ChatMessageSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    crew_member = CrewMemberListSerializer(read_only=True)
    
    class Meta:
        model = ChatMessage
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'edited_at', 'user']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class RealtimeDashboardSerializer(serializers.Serializer):
    """Dashboard data for realtime monitoring"""
    
    # Current status
    production_status = serializers.CharField()
    current_scene = serializers.DictField(required=False)
    current_shot = serializers.DictField(required=False)
    
    # Progress
    scenes_completed_today = serializers.IntegerField()
    shots_completed_today = serializers.IntegerField()
    takes_recorded_today = serializers.IntegerField()
    pages_shot_today = serializers.DecimalField(max_digits=5, decimal_places=2)
    
    # Active connections
    connected_users = serializers.ListField(
        child=serializers.DictField()
    )
    
    # Recent events
    recent_events = serializers.ListField(
        child=serializers.DictField()
    )
    
    # Live metrics
    current_setup_time = serializers.DurationField(required=False)
    estimated_wrap_time = serializers.TimeField(required=False)
    
    # Weather
    weather_conditions = serializers.CharField(required=False)
    temperature = serializers.IntegerField(required=False)

class BroadcastMessageSerializer(serializers.Serializer):
    """Broadcast message to production team"""
    
    message_type = serializers.ChoiceField(choices=[
        ('info', 'Information'),
        ('warning', 'Warning'),
        ('alert', 'Alert'),
        ('emergency', 'Emergency')
    ])
    
    title = serializers.CharField(max_length=200)
    message = serializers.CharField()
    
    # Target audience
    target = serializers.ChoiceField(choices=[
        ('all', 'All Crew'),
        ('department', 'Department'),
        ('role', 'Specific Role'),
        ('custom', 'Custom Selection')
    ], default='all')
    
    target_ids = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    
    # Options
    persist = serializers.BooleanField(
        default=True,
        help_text="Save message to database"
    )
    
    send_push = serializers.BooleanField(
        default=False,
        help_text="Send push notification"
    )
    
    expires_in_minutes = serializers.IntegerField(
        default=60,
        help_text="Message expiration time"
    )