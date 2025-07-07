from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from apps.production.models import Production
from apps.crew.models import CrewMember
import uuid

class WebSocketConnection(models.Model):
    """Track active WebSocket connections"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='websocket_connections')
    production = models.ForeignKey(Production, on_delete=models.CASCADE, related_name='active_connections')
    
    # Connection details
    channel_name = models.CharField(max_length=100, unique=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    
    # Status
    connected_at = models.DateTimeField(auto_now_add=True)
    last_ping = models.DateTimeField(auto_now=True)
    disconnected_at = models.DateTimeField(null=True, blank=True)
    
    # Permissions
    can_broadcast = models.BooleanField(default=False)
    can_moderate = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-connected_at']
        indexes = [
            models.Index(fields=['production', 'connected_at']),
            models.Index(fields=['user', 'production']),
        ]
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.production.title}"
    
    @property
    def is_active(self):
        """Check if connection is still active (within last 30 seconds)"""
        return (
            self.disconnected_at is None and 
            (timezone.now() - self.last_ping).total_seconds() < 30
        )

class RealtimeEvent(models.Model):
    """Real-time events that need to be broadcast"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    production = models.ForeignKey(Production, on_delete=models.CASCADE, related_name='realtime_events')
    
    EVENT_TYPES = [
        ('status_update', 'Status Update'),
        ('scene_started', 'Scene Started'),
        ('scene_completed', 'Scene Completed'),
        ('shot_started', 'Shot Started'),
        ('shot_completed', 'Shot Completed'),
        ('take_recorded', 'Take Recorded'),
        ('break_started', 'Break Started'),
        ('break_ended', 'Break Ended'),
        ('crew_checkin', 'Crew Check-in'),
        ('equipment_issue', 'Equipment Issue'),
        ('weather_update', 'Weather Update'),
        ('emergency', 'Emergency'),
        ('wrap_called', 'Wrap Called'),
        ('custom', 'Custom Event'),
    ]
    
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='triggered_events')
    
    # Event data
    title = models.CharField(max_length=200)
    message = models.TextField()
    data = models.JSONField(default=dict, blank=True)  # Additional structured data
    
    # Targeting
    target_all = models.BooleanField(default=True)
    target_departments = models.JSONField(default=list, blank=True)  # List of department IDs
    target_users = models.JSONField(default=list, blank=True)  # List of user IDs
    
    # Priority and delivery
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('normal', 'Normal'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normal')
    
    # Status tracking
    created_at = models.DateTimeField(auto_now_add=True)
    delivered_to = models.JSONField(default=list, blank=True)  # List of user IDs who received it
    delivery_count = models.IntegerField(default=0)
    acknowledged_by = models.JSONField(default=list, blank=True)  # List of user IDs who acknowledged
    
    # Expiration
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['production', 'event_type', 'created_at']),
            models.Index(fields=['priority', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.event_type}) - {self.created_at}"
    
    @property
    def is_expired(self):
        """Check if event has expired"""
        return self.expires_at and timezone.now() > self.expires_at

class ChatRoom(models.Model):
    """Chat rooms for production communication"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    production = models.ForeignKey(Production, on_delete=models.CASCADE, related_name='chat_rooms')
    
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    ROOM_TYPES = [
        ('general', 'General Chat'),
        ('department', 'Department Channel'),
        ('location', 'Location Channel'),
        ('emergency', 'Emergency Channel'),
        ('directors', 'Directors Only'),
        ('producers', 'Producers Only'),
        ('private', 'Private Chat'),
    ]
    room_type = models.CharField(max_length=15, choices=ROOM_TYPES, default='general')
    
    # Permissions
    is_public = models.BooleanField(default=True)
    allowed_departments = models.JSONField(default=list, blank=True)  # Department IDs
    allowed_users = models.JSONField(default=list, blank=True)  # User IDs
    moderators = models.JSONField(default=list, blank=True)  # User IDs with mod powers
    
    # Settings
    is_archived = models.BooleanField(default=False)
    max_messages = models.IntegerField(default=1000)  # Auto-cleanup old messages
    
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        ordering = ['name']
        unique_together = ['production', 'name']
        indexes = [
            models.Index(fields=['production', 'room_type']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.production.title})"
    
    def can_user_access(self, user):
        """Check if user can access this chat room"""
        if not self.is_public:
            if user.id not in self.allowed_users:
                return False
        
        # Check department access
        if self.allowed_departments:
            try:
                crew_member = user.crew_member
                if crew_member.primary_position.department.id not in self.allowed_departments:
                    return False
            except:
                return False
        
        return True

class ChatMessage(models.Model):
    """Individual chat messages"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_messages')
    
    # Message content
    message = models.TextField()
    message_type = models.CharField(max_length=20, choices=[
        ('text', 'Text Message'),
        ('image', 'Image'),
        ('file', 'File'),
        ('location', 'Location Share'),
        ('status', 'Status Update'),
        ('system', 'System Message'),
    ], default='text')
    
    # Attachments
    attachment = models.FileField(upload_to='chat_attachments/', null=True, blank=True)
    
    # Reply threading
    reply_to = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    
    # Status
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    # Read receipts
    read_by = models.JSONField(default=list, blank=True)  # List of user IDs who read it
    
    # Reactions
    reactions = models.JSONField(default=dict, blank=True)  # {"👍": [user_id1, user_id2], "❤️": [user_id3]}
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['room', 'created_at']),
            models.Index(fields=['user', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.get_full_name()}: {self.message[:50]}..."
    
    def add_reaction(self, emoji, user_id):
        """Add reaction to message"""
        if emoji not in self.reactions:
            self.reactions[emoji] = []
        if user_id not in self.reactions[emoji]:
            self.reactions[emoji].append(user_id)
        self.save()
    
    def remove_reaction(self, emoji, user_id):
        """Remove reaction from message"""
        if emoji in self.reactions and user_id in self.reactions[emoji]:
            self.reactions[emoji].remove(user_id)
            if not self.reactions[emoji]:
                del self.reactions[emoji]
            self.save()

class LiveDashboardData(models.Model):
    """Live dashboard data cache"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    production = models.ForeignKey(Production, on_delete=models.CASCADE, related_name='live_dashboard_data')
    
    # Current state
    current_scene = models.CharField(max_length=10, blank=True)
    current_shot = models.CharField(max_length=10, blank=True)
    current_take = models.IntegerField(default=1)
    
    # Status
    STATUS_CHOICES = [
        ('prep', 'Preparing'),
        ('rehearsal', 'Rehearsing'),
        ('lighting', 'Lighting'),
        ('rolling', 'Rolling'),
        ('reset', 'Resetting'),
        ('moving_on', 'Moving On'),
        ('meal_break', 'Meal Break'),
        ('weather_hold', 'Weather Hold'),
        ('technical_hold', 'Technical Hold'),
        ('wrapped', 'Wrapped'),
    ]
    current_status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='prep')
    
    # Progress tracking
    scenes_completed_today = models.IntegerField(default=0)
    pages_shot_today = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    takes_completed_today = models.IntegerField(default=0)
    setups_completed_today = models.IntegerField(default=0)
    
    # Time tracking
    day_start_time = models.TimeField(null=True, blank=True)
    current_scene_start_time = models.TimeField(null=True, blank=True)
    last_shot_time = models.TimeField(null=True, blank=True)
    estimated_wrap_time = models.TimeField(null=True, blank=True)
    
    # Issues and delays
    weather_delay_minutes = models.IntegerField(default=0)
    technical_delay_minutes = models.IntegerField(default=0)
    other_delay_minutes = models.IntegerField(default=0)
    active_issues = models.JSONField(default=list, blank=True)  # List of current issues
    
    # Crew status
    crew_checked_in = models.IntegerField(default=0)
    crew_total = models.IntegerField(default=0)
    crew_on_break = models.IntegerField(default=0)
    
    # Last updates
    last_update = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        ordering = ['-last_update']
        indexes = [
            models.Index(fields=['production', 'last_update']),
        ]
    
    def __str__(self):
        return f"Dashboard - {self.production.title} ({self.current_status})"
    
    @property
    def total_delay_minutes(self):
        """Calculate total delay minutes"""
        return self.weather_delay_minutes + self.technical_delay_minutes + self.other_delay_minutes
    
    @property
    def schedule_variance_minutes(self):
        """Calculate schedule variance (simplified)"""
        # This would compare actual progress vs planned
        # For now, just return total delays
        return self.total_delay_minutes

class RealtimeNotification(models.Model):
    """Notifications that need real-time delivery"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    production = models.ForeignKey(Production, on_delete=models.CASCADE, related_name='realtime_notifications')
    
    # Notification details
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=[
        ('info', 'Information'),
        ('warning', 'Warning'),
        ('alert', 'Alert'),
        ('emergency', 'Emergency'),
        ('success', 'Success'),
    ], default='info')
    
    # Targeting
    target_users = models.JSONField(default=list, blank=True)  # User IDs
    target_departments = models.JSONField(default=list, blank=True)  # Department IDs
    send_to_all = models.BooleanField(default=False)
    
    # Delivery tracking
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    delivered_to = models.JSONField(default=list, blank=True)  # User IDs
    read_by = models.JSONField(default=list, blank=True)  # User IDs
    
    # Auto-dismiss
    auto_dismiss_seconds = models.IntegerField(default=10)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['production', 'created_at']),
            models.Index(fields=['notification_type', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.notification_type})"