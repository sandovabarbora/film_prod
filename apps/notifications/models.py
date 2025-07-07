from django.db import models
from django.contrib.auth.models import User
from apps.production.models import Production
from apps.crew.models import CrewMember, Department
from apps.schedule.models import ShootingDay

class NotificationChannel(models.Model):
    """Komunikační kanály - jako walkie kanály nebo skupiny"""
    production = models.ForeignKey(Production, on_delete=models.CASCADE, related_name='channels')
    name = models.CharField(max_length=50)  # "Channel 1", "Directors", "Camera Dept"
    description = models.CharField(max_length=200, blank=True)
    
    # Channel settings
    is_public = models.BooleanField(default=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Priority levels
    PRIORITY_CHOICES = [
        ('low', 'Low Priority'),
        ('normal', 'Normal'),
        ('high', 'High Priority'),
        ('urgent', 'URGENT'),
    ]
    default_priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normal')
    
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['name']
        unique_together = ['production', 'name']
    
    def __str__(self):
        return f"{self.production.title} - {self.name}"

class Notification(models.Model):
    """Jednotlivé notifikace/zprávy"""
    production = models.ForeignKey(Production, on_delete=models.CASCADE, related_name='notifications')
    channel = models.ForeignKey(NotificationChannel, on_delete=models.CASCADE, related_name='notifications')
    
    sender = models.ForeignKey(CrewMember, on_delete=models.CASCADE, related_name='sent_notifications')
    
    TYPE_CHOICES = [
        ('message', 'General Message'),
        ('status_update', 'Status Update'),
        ('delay', 'Delay Notice'),
        ('emergency', 'Emergency'),
        ('meal', 'Meal Call'),
        ('wrap', 'Wrap Notice'),
        ('weather', 'Weather Update'),
        ('equipment', 'Equipment Issue'),
        ('cast_ready', 'Cast Ready'),
        ('moving_on', 'Moving On'),
        ('lunch', 'Lunch Break'),
    ]
    notification_type = models.CharField(max_length=15, choices=TYPE_CHOICES, default='message')
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('normal', 'Normal'),
        ('high', 'High'),
        ('urgent', 'URGENT'),
    ]
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normal')
    
    title = models.CharField(max_length=200)
    message = models.TextField()
    
    # Metadata
    shooting_day = models.ForeignKey(ShootingDay, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')
    related_scene = models.CharField(max_length=10, blank=True)  # Scene number
    
    # Delivery tracking
    sent_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)  # Pro dočasné zprávy
    
    # Auto-generated notifications
    is_auto_generated = models.BooleanField(default=False)
    auto_trigger = models.CharField(max_length=50, blank=True)  # "shot_completed", "delay_detected" atd.
    
    class Meta:
        ordering = ['-sent_at']
    
    def __str__(self):
        return f"{self.title} ({self.priority}) - {self.sent_at.strftime('%H:%M')}"

class NotificationRecipient(models.Model):
    """Příjemci notifikací s delivery tracking"""
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, related_name='recipients')
    crew_member = models.ForeignKey(CrewMember, on_delete=models.CASCADE)
    
    # Delivery status
    delivered_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    acknowledged_at = models.DateTimeField(null=True, blank=True)  # Pro důležité zprávy
    
    # Delivery method
    METHOD_CHOICES = [
        ('app', 'In-App'),
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('walkie', 'Walkie-Talkie'),
        ('runner', 'Physical Runner'),
    ]
    delivery_method = models.CharField(max_length=10, choices=METHOD_CHOICES, default='app')
    
    class Meta:
        unique_together = ['notification', 'crew_member']
    
    def __str__(self):
        status = "Read" if self.read_at else "Delivered" if self.delivered_at else "Pending"
        return f"{self.crew_member.full_name} - {status}"

class LiveStatusUpdate(models.Model):
    """Real-time status updates pro dashboard (přejmenováno z StatusUpdate)"""
    production = models.ForeignKey(Production, on_delete=models.CASCADE, related_name='live_status_updates')
    shooting_day = models.ForeignKey(ShootingDay, on_delete=models.CASCADE, related_name='live_status_updates')
    
    updated_by = models.ForeignKey(CrewMember, on_delete=models.CASCADE)
    
    # Current status
    current_scene = models.CharField(max_length=10, blank=True)
    current_shot = models.CharField(max_length=10, blank=True)
    
    STATUS_CHOICES = [
        ('prep', 'Preparing'),
        ('rehearsal', 'Rehearsing'),
        ('lighting', 'Lighting'),
        ('rolling', 'Rolling'),
        ('reset', 'Resetting'),
        ('moving_on', 'Moving On'),
        ('meal_break', 'Meal Break'),
        ('weather_hold', 'Weather Hold'),
        ('equipment_issue', 'Equipment Issue'),
        ('wrapped', 'Wrapped'),
    ]
    current_status = models.CharField(max_length=15, choices=STATUS_CHOICES)
    
    estimated_next_shot = models.TimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    
    # Behind schedule tracking
    minutes_behind = models.IntegerField(default=0)  # Positive = behind, negative = ahead
    
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.current_status} - Scene {self.current_scene} ({self.timestamp.strftime('%H:%M')})"

class WeatherAlert(models.Model):
    """Automatické weather alerts"""
    production = models.ForeignKey(Production, on_delete=models.CASCADE, related_name='weather_alerts')
    shooting_day = models.ForeignKey(ShootingDay, on_delete=models.CASCADE, related_name='weather_alerts')
    
    ALERT_TYPE_CHOICES = [
        ('rain', 'Rain Warning'),
        ('wind', 'High Wind'),
        ('temperature', 'Extreme Temperature'),
        ('storm', 'Storm Warning'),
        ('fog', 'Fog/Visibility'),
    ]
    alert_type = models.CharField(max_length=12, choices=ALERT_TYPE_CHOICES)
    
    severity = models.CharField(max_length=10, choices=Notification.PRIORITY_CHOICES, default='normal')
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    # Weather data
    temperature = models.IntegerField(null=True, blank=True)
    humidity = models.IntegerField(null=True, blank=True)
    wind_speed = models.IntegerField(null=True, blank=True)  # km/h
    precipitation_chance = models.IntegerField(null=True, blank=True)  # %
    
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()
    
    auto_notification_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.alert_type.title()} Alert - {self.shooting_day.date}"