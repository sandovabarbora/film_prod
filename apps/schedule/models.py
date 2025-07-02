from django.db import models
from django.utils import timezone
from apps.production.models import Production, Scene, Location
from apps.crew.models import CrewMember
import datetime

class ShootingDay(models.Model):
    """Den natáčení"""
    production = models.ForeignKey(Production, on_delete=models.CASCADE, related_name='shooting_days')
    date = models.DateField()
    day_number = models.IntegerField()  # Day 1, Day 2 of production
    
    primary_location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='primary_days')
    backup_location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, blank=True, 
                                       related_name='backup_days')
    
    # Weather considerations
    weather_dependent = models.BooleanField(default=False)
    weather_backup_plan = models.TextField(blank=True)
    
    # Timing
    crew_call = models.TimeField()
    wrap_time = models.TimeField(null=True, blank=True)
    estimated_wrap = models.TimeField()
    
    # Meals
    breakfast_time = models.TimeField(null=True, blank=True)
    lunch_time = models.TimeField(null=True, blank=True)
    dinner_time = models.TimeField(null=True, blank=True)
    
    # Special requirements
    special_equipment = models.TextField(blank=True)
    special_notes = models.TextField(blank=True)
    
    STATUS_CHOICES = [
        ('planned', 'Planned'),
        ('confirmed', 'Confirmed'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('postponed', 'Postponed'),
    ]
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default='planned')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['date']
        unique_together = ['production', 'date']
    
    def __str__(self):
        return f"Day {self.day_number} - {self.date} ({self.primary_location.name})"
    
    @property
    def total_scenes(self):
        return self.scheduled_scenes.count()
    
    @property
    def estimated_pages(self):
        return sum(scene.scene.estimated_pages for scene in self.scheduled_scenes.all())

class ScheduledScene(models.Model):
    """Scéna naplánovaná na konkrétní den"""
    shooting_day = models.ForeignKey(ShootingDay, on_delete=models.CASCADE, related_name='scheduled_scenes')
    scene = models.ForeignKey(Scene, on_delete=models.CASCADE, related_name='scheduled_days')
    
    estimated_start_time = models.TimeField()
    estimated_duration = models.DurationField()
    
    actual_start_time = models.TimeField(null=True, blank=True)
    actual_end_time = models.TimeField(null=True, blank=True)
    
    order = models.IntegerField()  # Pořadí ve dnu
    
    setup_notes = models.TextField(blank=True)
    completion_notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['order']
        unique_together = ['shooting_day', 'scene']
    
    def __str__(self):
        return f"{self.shooting_day.date} - Scene {self.scene.scene_number}"
    
    @property
    def is_running_late(self):
        if not self.actual_start_time or not self.estimated_start_time:
            return False
        return self.actual_start_time > self.estimated_start_time

class CallSheet(models.Model):
    """Call sheet pro konkrétní den"""
    shooting_day = models.OneToOneField(ShootingDay, on_delete=models.CASCADE, related_name='call_sheet')
    
    version = models.CharField(max_length=10, default='1.0')
    
    # Weather info
    sunrise_time = models.TimeField(null=True, blank=True)
    sunset_time = models.TimeField(null=True, blank=True)
    weather_forecast = models.CharField(max_length=200, blank=True)
    temperature_high = models.IntegerField(null=True, blank=True)
    temperature_low = models.IntegerField(null=True, blank=True)
    
    # Emergency contacts
    nearest_hospital = models.CharField(max_length=200, blank=True)
    hospital_phone = models.CharField(max_length=20, blank=True)
    
    # Distribution
    distributed_at = models.DateTimeField(null=True, blank=True)
    distributed_by = models.ForeignKey(CrewMember, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Approvals
    approved_by_director = models.BooleanField(default=False)
    approved_by_producer = models.BooleanField(default=False)
    approved_at = models.DateTimeField(null=True, blank=True)
    
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Call Sheet - {self.shooting_day.date} v{self.version}"
    
    def save(self, *args, **kwargs):
        if self.distributed_at is None and self.approved_by_director and self.approved_by_producer:
            self.distributed_at = timezone.now()
        super().save(*args, **kwargs)

class CrewCall(models.Model):
    """Individuální call time pro člena štábu"""
    call_sheet = models.ForeignKey(CallSheet, on_delete=models.CASCADE, related_name='crew_calls')
    crew_member = models.ForeignKey(CrewMember, on_delete=models.CASCADE)
    
    call_time = models.TimeField()
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    
    # Wardrobe/Makeup specific
    wardrobe_time = models.TimeField(null=True, blank=True)
    makeup_time = models.TimeField(null=True, blank=True)
    
    special_instructions = models.TextField(blank=True)
    
    # Tracking
    confirmed_at = models.DateTimeField(null=True, blank=True)
    arrived_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['call_sheet', 'crew_member']
        ordering = ['call_time', 'crew_member__last_name']
    
    def __str__(self):
        return f"{self.crew_member.full_name} - {self.call_time}"
    
    @property
    def is_late(self):
        if not self.arrived_at:
            return timezone.now().time() > self.call_time if timezone.now().date() == self.call_sheet.shooting_day.date else False
        return self.arrived_at.time() > self.call_time

class ProductionReport(models.Model):
    """Denní produkční report"""
    shooting_day = models.OneToOneField(ShootingDay, on_delete=models.CASCADE, related_name='production_report')
    
    # Timing actuals
    first_shot = models.TimeField(null=True, blank=True)
    lunch_in = models.TimeField(null=True, blank=True)
    lunch_out = models.TimeField(null=True, blank=True)
    wrap_time = models.TimeField(null=True, blank=True)
    
    # Statistics
    total_setups = models.IntegerField(default=0)
    pages_shot = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    scenes_completed = models.IntegerField(default=0)
    
    # Issues and notes
    delays = models.TextField(blank=True)
    equipment_issues = models.TextField(blank=True)
    weather_impact = models.TextField(blank=True)
    
    # Next day prep
    tomorrow_prep_notes = models.TextField(blank=True)
    
    submitted_by = models.ForeignKey(CrewMember, on_delete=models.SET_NULL, null=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Production Report - {self.shooting_day.date}"