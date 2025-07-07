from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from apps.production.models import Production, Scene
from datetime import datetime, timedelta
import uuid

class ShootingDay(models.Model):
    """Individual shooting days"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    production = models.ForeignKey(Production, on_delete=models.CASCADE, related_name='shooting_days')
    
    # Day info
    shoot_date = models.DateField()
    day_number = models.IntegerField()  # Day 1, Day 2, etc.
    
    # Times
    general_call = models.TimeField()
    shooting_call = models.TimeField()
    estimated_wrap = models.TimeField(null=True, blank=True)
    actual_wrap = models.TimeField(null=True, blank=True)
    
    # Location
    primary_location = models.ForeignKey('production.Location', on_delete=models.SET_NULL, null=True)
    
    # Weather
    weather_forecast = models.CharField(max_length=200, blank=True)
    sunrise = models.TimeField(null=True, blank=True)
    sunset = models.TimeField(null=True, blank=True)
    
    # Notes
    notes = models.TextField(blank=True)
    special_requirements = models.TextField(blank=True)
    
    # Status
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('postponed', 'Postponed'),
    ]
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='scheduled')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['shoot_date', 'day_number']
        unique_together = ['production', 'day_number']
    
    def __str__(self):
        return f"Day {self.day_number} - {self.shoot_date}"
    
    @property
    def total_scenes(self):
        return self.scene_schedules.count()
    
    @property
    def total_pages(self):
        return sum(ss.scene.estimated_pages or 0 for ss in self.scene_schedules.all())

class SceneSchedule(models.Model):
    """Scenes scheduled for specific shooting day"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shooting_day = models.ForeignKey(ShootingDay, on_delete=models.CASCADE, related_name='scene_schedules')
    scene = models.ForeignKey(Scene, on_delete=models.CASCADE, related_name='schedule_entries')
    
    # Scheduling
    day_order = models.IntegerField()  # Order within the day
    estimated_start = models.TimeField()
    estimated_duration = models.DurationField()
    
    # Actual timing
    actual_start = models.TimeField(null=True, blank=True)
    actual_end = models.TimeField(null=True, blank=True)
    
    # Status
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('setup', 'Setting Up'),
        ('rehearsal', 'Rehearsing'),
        ('shooting', 'Shooting'),
        ('completed', 'Completed'),
        ('postponed', 'Postponed'),
        ('cancelled', 'Cancelled'),
    ]
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='scheduled')
    
    # Notes
    setup_notes = models.TextField(blank=True)
    completion_notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['shooting_day', 'day_order']
        unique_together = ['shooting_day', 'scene']
    
    def __str__(self):
        return f"Scene {self.scene.scene_number} - Day {self.shooting_day.day_number}"
    
    @property
    def estimated_end(self):
        if self.estimated_start and self.estimated_duration:
            dt = datetime.combine(datetime.today(), self.estimated_start)
            return (dt + self.estimated_duration).time()
        return None

class DayBreak(models.Model):
    """Meal breaks and other breaks during shooting day"""
    shooting_day = models.ForeignKey(ShootingDay, on_delete=models.CASCADE, related_name='breaks')
    break_type = models.CharField(max_length=20, choices=[
        ('meal', 'Meal Break'),
        ('rest', 'Rest Break'),
        ('company_move', 'Company Move'),
        ('other', 'Other')
    ])
    scheduled_start = models.TimeField()
    scheduled_duration = models.DurationField()
    actual_start = models.TimeField(null=True, blank=True)
    actual_duration = models.DurationField(null=True, blank=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['scheduled_start']
    
    def __str__(self):
        return f"{self.get_break_type_display()} at {self.scheduled_start}"

class StatusUpdate(models.Model):
    """Real-time status updates during shooting"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    production = models.ForeignKey(Production, on_delete=models.CASCADE, related_name='schedule_status_updates')
    shooting_day = models.ForeignKey(ShootingDay, on_delete=models.CASCADE, related_name='status_updates')
    
    # What's happening
    update_type = models.CharField(max_length=30, choices=[
        ('day_start', 'Day Started'),
        ('first_shot', 'First Shot'),
        ('scene_complete', 'Scene Complete'),
        ('meal_break', 'Meal Break'),
        ('back_from_meal', 'Back from Meal'),
        ('company_move', 'Company Move'),
        ('weather_hold', 'Weather Hold'),
        ('wrap', 'That\'s a Wrap'),
        ('general', 'General Update')
    ])
    
    # Current status
    current_scene = models.ForeignKey(Scene, on_delete=models.SET_NULL, null=True, blank=True)
    message = models.TextField()
    
    # Timing
    timestamp = models.DateTimeField(default=timezone.now)
    
    # Progress
    scenes_completed = models.IntegerField(default=0)
    setups_completed = models.IntegerField(default=0)
    pages_shot = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Who posted
    posted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.get_update_type_display()} - {self.timestamp}"

class ProductionCalendar(models.Model):
    """Overall production calendar and phases"""
    production = models.OneToOneField(Production, on_delete=models.CASCADE, related_name='calendar')
    
    # Key dates
    prep_start = models.DateField()
    prep_end = models.DateField()
    principal_start = models.DateField()
    principal_end = models.DateField()
    wrap_date = models.DateField()
    
    # Work week
    monday = models.BooleanField(default=True)
    tuesday = models.BooleanField(default=True)
    wednesday = models.BooleanField(default=True)
    thursday = models.BooleanField(default=True)
    friday = models.BooleanField(default=True)
    saturday = models.BooleanField(default=False)
    sunday = models.BooleanField(default=False)
    
    # Holidays and blackout dates
    holidays = models.JSONField(default=list, blank=True)
    blackout_dates = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Calendar for {self.production.title}"
    
    @property
    def work_days(self):
        days = []
        if self.monday: days.append(0)
        if self.tuesday: days.append(1)
        if self.wednesday: days.append(2)
        if self.thursday: days.append(3)
        if self.friday: days.append(4)
        if self.saturday: days.append(5)
        if self.sunday: days.append(6)
        return days
    
    def is_work_day(self, date):
        """Check if date is a work day"""
        if date.weekday() not in self.work_days:
            return False
        if str(date) in self.holidays:
            return False
        if str(date) in self.blackout_dates:
            return False
        return True

class ScheduleChange(models.Model):
    """Track all schedule changes for audit trail"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    production = models.ForeignKey(Production, on_delete=models.CASCADE, related_name='schedule_changes')
    
    # What changed
    change_type = models.CharField(max_length=30, choices=[
        ('scene_moved', 'Scene Moved'),
        ('scene_added', 'Scene Added'),
        ('scene_removed', 'Scene Removed'),
        ('time_changed', 'Time Changed'),
        ('location_changed', 'Location Changed'),
        ('day_cancelled', 'Day Cancelled'),
        ('day_added', 'Day Added'),
    ])
    
    # Target objects
    shooting_day = models.ForeignKey(ShootingDay, on_delete=models.CASCADE, null=True, blank=True)
    scene = models.ForeignKey(Scene, on_delete=models.CASCADE, null=True, blank=True)
    
    # Change details
    old_value = models.TextField(blank=True)
    new_value = models.TextField(blank=True)
    reason = models.TextField()
    
    # Metadata
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    changed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-changed_at']
    
    def __str__(self):
        return f"{self.get_change_type_display()} - {self.changed_at}"