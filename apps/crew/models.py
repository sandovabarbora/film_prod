# apps/crew/models.py
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator
from apps.production.models import Production, Scene
import uuid

phone_regex = RegexValidator(
    regex=r'^\+?1?\d{9,15}$',
    message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
)

class Department(models.Model):
    """Production departments"""
    name = models.CharField(max_length=50, unique=True)
    abbreviation = models.CharField(max_length=10)
    color_code = models.CharField(max_length=7, default='#000000')  # For UI
    sort_order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['sort_order', 'name']
    
    def __str__(self):
        return self.name

class Position(models.Model):
    """Crew positions/roles"""
    title = models.CharField(max_length=100)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='positions')
    level = models.CharField(max_length=20, choices=[
        ('hod', 'Head of Department'),
        ('key', 'Key'),
        ('assistant', 'Assistant'),
        ('trainee', 'Trainee'),
        ('other', 'Other')
    ], default='other')
    daily_rate_min = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    daily_rate_max = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    requires_certification = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['department', 'level', 'title']
        unique_together = ['title', 'department']
    
    def __str__(self):
        return f"{self.title} ({self.department.abbreviation})"

class CrewMember(models.Model):
    """Individual crew members"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    
    # Personal info
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    preferred_name = models.CharField(max_length=50, blank=True)
    email = models.EmailField(unique=True)
    phone_primary = models.CharField(validators=[phone_regex], max_length=17)
    phone_secondary = models.CharField(validators=[phone_regex], max_length=17, blank=True)
    emergency_contact_name = models.CharField(max_length=100)
    emergency_contact_phone = models.CharField(validators=[phone_regex], max_length=17)
    
    # Professional info
    primary_position = models.ForeignKey(Position, on_delete=models.SET_NULL, null=True, related_name='primary_crew')
    secondary_positions = models.ManyToManyField(Position, blank=True, related_name='secondary_crew')
    union_member = models.BooleanField(default=False)
    union_number = models.CharField(max_length=50, blank=True)
    daily_rate = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    
    # Logistics
    has_vehicle = models.BooleanField(default=True)
    dietary_restrictions = models.TextField(blank=True)
    shirt_size = models.CharField(max_length=10, blank=True, choices=[
        ('XS', 'Extra Small'),
        ('S', 'Small'),
        ('M', 'Medium'),
        ('L', 'Large'),
        ('XL', 'Extra Large'),
        ('XXL', '2XL'),
        ('XXXL', '3XL'),
    ])
    
    # Status
    status = models.CharField(max_length=20, choices=[
        ('active', 'Active'),
        ('on_hold', 'On Hold'),
        ('unavailable', 'Unavailable'),
        ('blacklisted', 'Blacklisted')
    ], default='active')
    
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['last_name', 'first_name']
    
    def __str__(self):
        return f"{self.display_name} - {self.primary_position}"
    
    @property
    def display_name(self):
        if self.preferred_name:
            return self.preferred_name
        return f"{self.first_name} {self.last_name}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

class CrewAssignment(models.Model):
    """Assignment of crew to productions"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    production = models.ForeignKey(Production, on_delete=models.CASCADE, related_name='crew_assignments')
    crew_member = models.ForeignKey(CrewMember, on_delete=models.CASCADE, related_name='assignments')
    position = models.ForeignKey(Position, on_delete=models.CASCADE)
    
    # Contract details
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    daily_rate = models.DecimalField(max_digits=7, decimal_places=2)
    guaranteed_days = models.IntegerField(default=0)
    
    # Status
    status = models.CharField(max_length=20, choices=[
        ('confirmed', 'Confirmed'),
        ('pending', 'Pending'),
        ('tentative', 'Tentative'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed')
    ], default='pending')
    
    # Permissions
    can_view_schedule = models.BooleanField(default=True)
    can_view_script = models.BooleanField(default=False)
    can_view_budget = models.BooleanField(default=False)
    is_department_head = models.BooleanField(default=False)
    
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['production', 'position__department', 'position']
        unique_together = ['production', 'crew_member', 'position']
    
    def __str__(self):
        return f"{self.crew_member.display_name} as {self.position} on {self.production}"

class CallSheet(models.Model):
    """Daily call sheets"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    production = models.ForeignKey(Production, on_delete=models.CASCADE, related_name='call_sheets')
    shooting_day = models.IntegerField()
    date = models.DateField()
    
    # General info
    general_call_time = models.TimeField()
    shooting_call = models.TimeField()
    wrap_time = models.TimeField(null=True, blank=True)
    
    # Location info
    base_camp_location = models.TextField()
    nearest_hospital = models.TextField()
    parking_instructions = models.TextField(blank=True)
    
    # Schedule
    schedule_notes = models.TextField(blank=True)
    safety_notes = models.TextField(blank=True)
    special_instructions = models.TextField(blank=True)
    
    # Weather
    weather_forecast = models.CharField(max_length=200, blank=True)
    sunrise = models.TimeField(null=True, blank=True)
    sunset = models.TimeField(null=True, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=[
        ('draft', 'Draft'),
        ('preliminary', 'Preliminary'),
        ('final', 'Final'),
        ('revised', 'Revised')
    ], default='draft')
    
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['date']
        unique_together = ['production', 'date']
    
    def __str__(self):
        return f"Call Sheet - Day {self.shooting_day} - {self.date}"

class CrewCall(models.Model):
    """Individual crew call times"""
    call_sheet = models.ForeignKey(CallSheet, on_delete=models.CASCADE, related_name='crew_calls')
    crew_member = models.ForeignKey(CrewMember, on_delete=models.CASCADE, related_name='calls')
    
    # Times
    call_time = models.TimeField()
    wrap_time = models.TimeField(null=True, blank=True)
    meal_time = models.TimeField(null=True, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=[
        ('working', 'Working'),
        ('on_call', 'On Call'),
        ('weather_cover', 'Weather Cover'),
        ('day_off', 'Day Off'),
        ('travel', 'Travel Day')
    ], default='working')
    
    # Location
    report_to = models.CharField(max_length=100, default='Base Camp')
    transport_provided = models.BooleanField(default=False)
    
    special_instructions = models.TextField(blank=True)
    confirmed = models.BooleanField(default=False)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['call_time', 'crew_member__last_name']
        unique_together = ['call_sheet', 'crew_member']
    
    def __str__(self):
        return f"{self.crew_member.display_name} - {self.call_time}"

class Character(models.Model):
    """Characters in the production"""
    production = models.ForeignKey(Production, on_delete=models.CASCADE, related_name='characters')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    # Cast info
    actor = models.ForeignKey(CrewMember, on_delete=models.SET_NULL, null=True, blank=True, related_name='characters')
    is_principal = models.BooleanField(default=False)
    is_supporting = models.BooleanField(default=False)
    is_background = models.BooleanField(default=False)
    
    # Appearance tracking
    first_scene = models.ForeignKey(Scene, on_delete=models.SET_NULL, null=True, blank=True, related_name='+')
    last_scene = models.ForeignKey(Scene, on_delete=models.SET_NULL, null=True, blank=True, related_name='+')
    total_scenes = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        unique_together = ['production', 'name']
    
    def __str__(self):
        if self.actor:
            return f"{self.name} ({self.actor.display_name})"
        return self.name