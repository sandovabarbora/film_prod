# apps/schedule/models.py
from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils import timezone
from apps.production.models import Production, Scene, Location
from apps.crew.models import CrewMember, CallSheet
import uuid
from datetime import timedelta, datetime

class ShootingDay(models.Model):
    """Represents a single shooting day"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    production = models.ForeignKey(Production, on_delete=models.CASCADE, related_name='shooting_days')
    day_number = models.IntegerField()
    date = models.DateField()
    
    # Status
    status = models.CharField(max_length=20, choices=[
        ('scheduled', 'Scheduled'),
        ('prep', 'Prep Day'),
        ('shooting', 'Shooting'),
        ('wrap', 'Wrapped'),
        ('cancelled', 'Cancelled'),
        ('weather_hold', 'Weather Hold')
    ], default='scheduled')
    
    # Times
    crew_call = models.TimeField(help_text="General crew call time")
    shooting_call = models.TimeField(help_text="Camera rolls")
    estimated_wrap = models.TimeField()
    actual_wrap = models.TimeField(null=True, blank=True)
    
    # Locations
    primary_location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, related_name='primary_days')
    
    # Day type
    day_type = models.CharField(max_length=20, choices=[
        ('principal', 'Principal Photography'),
        ('second_unit', 'Second Unit'),
        ('splinter', 'Splinter Unit'),
        ('rehearsal', 'Rehearsal'),
        ('travel', 'Travel'),
        ('off', 'Day Off')
    ], default='principal')
    
    # Notes
    notes = models.TextField(blank=True)
    weather_conditions = models.CharField(max_length=100, blank=True)
    
    # Tracking
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_days')
    
    class Meta:
        ordering = ['date']
        unique_together = ['production', 'date']
    
    def __str__(self):
        return f"Day {self.day_number} - {self.date}"
    
    @property
    def total_pages(self):
        return sum(s.scene.estimated_pages for s in self.scheduled_scenes.all())
    
    @property
    def scenes_count(self):
        return self.scheduled_scenes.count()
    
    def clean(self):
        if self.shooting_call < self.crew_call:
            raise ValidationError("Shooting call cannot be before crew call")
        if self.estimated_wrap < self.shooting_call:
            raise ValidationError("Wrap time must be after shooting call")

class SceneSchedule(models.Model):
    """Links scenes to shooting days with scheduling details"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shooting_day = models.ForeignKey(ShootingDay, on_delete=models.CASCADE, related_name='scheduled_scenes')
    scene = models.ForeignKey(Scene, on_delete=models.CASCADE, related_name='schedule_entries')
    
    # Timing
    estimated_start = models.TimeField()
    estimated_duration = models.DurationField()
    actual_start = models.TimeField(null=True, blank=True)
    actual_duration = models.DurationField(null=True, blank=True)
    
    # Order
    day_order = models.IntegerField(help_text="Order within the shooting day")
    
    # Status
    status = models.CharField(max_length=20, choices=[
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('pushed', 'Pushed'),
        ('cancelled', 'Cancelled')
    ], default='scheduled')
    
    # Requirements
    crew_requirements = models.JSONField(default=dict, blank=True)
    equipment_requirements = models.JSONField(default=dict, blank=True)
    special_requirements = models.TextField(blank=True)
    
    # Notes
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['shooting_day__date', 'day_order']
        unique_together = ['shooting_day', 'scene']
    
    def __str__(self):
        return f"{self.scene.scene_number} on {self.shooting_day}"
    
    @property
    def estimated_end(self):
        if self.estimated_start and self.estimated_duration:
            # Convert time to datetime for calculation
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
    production = models.ForeignKey(Production, on_delete=models.CASCADE, related_name='status_updates')
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
        ('scene_added', 'Scene Added'),
        ('scene_removed', 'Scene Removed'),
        ('scene_moved', 'Scene Moved'),
        ('day_added', 'Day Added'),
        ('day_cancelled', 'Day Cancelled'),
        ('time_changed', 'Time Changed'),
        ('location_changed', 'Location Changed')
    ])
    
    # Details
    shooting_day = models.ForeignKey(ShootingDay, on_delete=models.SET_NULL, null=True, blank=True)
    scene = models.ForeignKey(Scene, on_delete=models.SET_NULL, null=True, blank=True)
    old_value = models.JSONField(null=True, blank=True)
    new_value = models.JSONField(null=True, blank=True)
    reason = models.TextField()
    
    # Who and when
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    changed_at = models.DateTimeField(auto_now_add=True)
    
    # Notifications
    notify_crew = models.BooleanField(default=True)
    notified_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-changed_at']
    
    def __str__(self):
        return f"{self.get_change_type_display()} - {self.changed_at}"

class ScheduleTemplate(models.Model):
    """Reusable schedule templates"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    # Template data
    day_length_hours = models.IntegerField(default=12)
    meal_break_after_hours = models.IntegerField(default=6)
    meal_break_duration_minutes = models.IntegerField(default=30)
    
    # Default times
    default_crew_call = models.TimeField(default='07:00')
    default_shooting_call = models.TimeField(default='08:00')
    
    # Scene ordering preferences
    prioritize_locations = models.BooleanField(default=True, help_text="Group scenes by location")
    prioritize_cast = models.BooleanField(default=False, help_text="Group scenes by cast")
    prioritize_time_of_day = models.BooleanField(default=True, help_text="Shoot day scenes during day")
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name