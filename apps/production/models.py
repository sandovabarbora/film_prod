from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse
import uuid

class Production(models.Model):
    """Hlavní produkce/film"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    director = models.CharField(max_length=100)
    producer = models.CharField(max_length=100)
    
    STATUS_CHOICES = [
        ('prep', 'Pre-production'),
        ('shoot', 'Principal Photography'),
        ('post', 'Post-production'),
        ('wrap', 'Wrapped'),
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='prep')
    
    start_date = models.DateField()
    end_date = models.DateField()
    budget = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    script_version = models.CharField(max_length=20, default='1.0')
    script_file = models.FileField(upload_to='scripts/', null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} ({self.status})"

class Location(models.Model):
    """Lokace natáčení"""
    production = models.ForeignKey(Production, on_delete=models.CASCADE, related_name='locations')
    name = models.CharField(max_length=200)
    address = models.TextField()
    contact_person = models.CharField(max_length=100, blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    
    # GPS koordináty pro optimalizaci tras
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return self.name

class Scene(models.Model):
    """Scéna ze scénáře"""
    production = models.ForeignKey(Production, on_delete=models.CASCADE, related_name='scenes')
    scene_number = models.CharField(max_length=10)  # "5A", "12B" atd.
    script_page = models.CharField(max_length=10, blank=True)
    
    INTERIOR_EXTERIOR_CHOICES = [
        ('INT', 'Interior'),
        ('EXT', 'Exterior'),
    ]
    int_ext = models.CharField(max_length=3, choices=INTERIOR_EXTERIOR_CHOICES)
    
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='scenes')
    location_detail = models.CharField(max_length=100)  # "Kitchen", "Bedroom" atd.
    
    TIME_CHOICES = [
        ('DAY', 'Day'),
        ('NIGHT', 'Night'),
        ('DAWN', 'Dawn'),
        ('DUSK', 'Dusk'),
        ('MORNING', 'Morning'),
        ('AFTERNOON', 'Afternoon'),
        ('EVENING', 'Evening'),
    ]
    time_of_day = models.CharField(max_length=10, choices=TIME_CHOICES)
    
    estimated_pages = models.DecimalField(max_digits=4, decimal_places=2, default=1.0)
    description = models.TextField()
    
    # Characters in scene
    characters = models.ManyToManyField('crew.Character', blank=True)
    
    STATUS_CHOICES = [
        ('not_shot', 'Not Shot'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('pickup', 'Pickup Required'),
    ]
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='not_shot')
    
    class Meta:
        ordering = ['scene_number']
        unique_together = ['production', 'scene_number']
    
    def __str__(self):
        return f"Scene {self.scene_number} - {self.int_ext}. {self.location_detail} - {self.time_of_day}"

class Shot(models.Model):
    """Jednotlivý shot/záběr"""
    scene = models.ForeignKey(Scene, on_delete=models.CASCADE, related_name='shots')
    shot_number = models.CharField(max_length=10)  # "1A", "2B", "Master" atd.
    
    SHOT_TYPE_CHOICES = [
        ('MASTER', 'Master Shot'),
        ('CU', 'Close Up'),
        ('MCU', 'Medium Close Up'),
        ('MS', 'Medium Shot'),
        ('WS', 'Wide Shot'),
        ('OTS', 'Over The Shoulder'),
        ('POV', 'Point of View'),
        ('INSERT', 'Insert'),
    ]
    shot_type = models.CharField(max_length=10, choices=SHOT_TYPE_CHOICES)
    
    description = models.TextField()
    camera_notes = models.TextField(blank=True)
    lens = models.CharField(max_length=50, blank=True)
    
    STATUS_CHOICES = [
        ('setup', 'Setting Up'),
        ('rehearsal', 'Rehearsal'),
        ('rolling', 'Rolling'),
        ('cut', 'Cut'),
        ('moving_on', 'Moving On'),
        ('completed', 'Completed'),
    ]
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='setup')
    
    takes_planned = models.IntegerField(default=1)
    takes_completed = models.IntegerField(default=0)
    takes_good = models.IntegerField(default=0)
    
    estimated_time = models.DurationField(null=True, blank=True)
    actual_time = models.DurationField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['shot_number']
        unique_together = ['scene', 'shot_number']
    
    def __str__(self):
        return f"{self.scene.scene_number}-{self.shot_number} ({self.shot_type})"
    
    @property
    def efficiency_ratio(self):
        """Poměr dobrých záběrů k celkovému počtu"""
        if self.takes_completed > 0:
            return round(self.takes_good / self.takes_completed, 2)
        return 0

class Take(models.Model):
    """Jednotlivý take/pokus"""
    shot = models.ForeignKey(Shot, on_delete=models.CASCADE, related_name='takes')
    take_number = models.IntegerField()
    
    RESULT_CHOICES = [
        ('good', 'Good'),
        ('ng', 'No Good'),
        ('maybe', 'Maybe'),
        ('print', 'Print'),
    ]
    result = models.CharField(max_length=10, choices=RESULT_CHOICES)
    
    director_notes = models.TextField(blank=True)
    script_supervisor_notes = models.TextField(blank=True)
    
    timecode_in = models.TimeField(null=True, blank=True)
    timecode_out = models.TimeField(null=True, blank=True)
    
    recorded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['take_number']
        unique_together = ['shot', 'take_number']
    
    def __str__(self):
        return f"{self.shot} - Take {self.take_number} ({self.result})"
