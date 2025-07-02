from django.db import models
from django.contrib.auth.models import User
from apps.production.models import Production

class Department(models.Model):
    """Filmová oddělení"""
    name = models.CharField(max_length=50, unique=True)
    color_code = models.CharField(max_length=7, default='#000000')  # Hex color pro UI
    
    def __str__(self):
        return self.name

class CrewMember(models.Model):
    """Člen štábu"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    production = models.ForeignKey(Production, on_delete=models.CASCADE, related_name='crew')
    
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    position = models.CharField(max_length=100)  # "Director", "1st AC", "Gaffer" atd.
    
    ROLE_CHOICES = [
        ('head', 'Department Head'),
        ('assistant', 'Assistant'),
        ('operator', 'Operator'),
        ('talent', 'Talent/Actor'),
    ]
    role_level = models.CharField(max_length=10, choices=ROLE_CHOICES, default='operator')
    
    call_time_offset = models.DurationField(default='00:00:00')  # Kolik dříve má přijít
    wrap_time_offset = models.DurationField(default='00:00:00')  # Kolik déle může zůstat
    
    contact_priority = models.IntegerField(default=5)  # 1=highest, 10=lowest
    receives_walkie = models.BooleanField(default=False)
    
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)
    
    notes = models.TextField(blank=True)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['department', 'position', 'last_name']
        unique_together = ['production', 'email']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.position})"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

class Character(models.Model):
    """Postavy ve filmu"""
    production = models.ForeignKey(Production, on_delete=models.CASCADE, related_name='characters')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    # Casting info
    actor = models.ForeignKey(CrewMember, on_delete=models.SET_NULL, null=True, blank=True, 
                             limit_choices_to={'role_level': 'talent'})
    
    # Wardrobe/Makeup tracking
    costume_notes = models.TextField(blank=True)
    makeup_notes = models.TextField(blank=True)
    
    first_scene = models.CharField(max_length=10, blank=True)
    last_scene = models.CharField(max_length=10, blank=True)
    
    class Meta:
        ordering = ['name']
        unique_together = ['production', 'name']
    
    def __str__(self):
        actor_name = f" ({self.actor.full_name})" if self.actor else ""
        return f"{self.name}{actor_name}"

class CrewAvailability(models.Model):
    """Dostupnost člena štábu"""
    crew_member = models.ForeignKey(CrewMember, on_delete=models.CASCADE, related_name='availability')
    date = models.DateField()
    
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('unavailable', 'Unavailable'),
        ('limited', 'Limited Availability'),
        ('tentative', 'Tentative'),
    ]
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default='available')
    
    start_time = models.TimeField(null=True, blank=True)  # Pro limited availability
    end_time = models.TimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        unique_together = ['crew_member', 'date']
        ordering = ['date']
    
    def __str__(self):
        return f"{self.crew_member.full_name} - {self.date} ({self.status})"

class EquipmentItem(models.Model):
    """Vybavení a technika"""
    production = models.ForeignKey(Production, on_delete=models.CASCADE, related_name='equipment')
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)  # "Camera", "Lighting", "Audio" atd.
    
    serial_number = models.CharField(max_length=50, blank=True)
    rental_house = models.CharField(max_length=100, blank=True)
    daily_rate = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    
    assigned_to = models.ForeignKey(CrewMember, on_delete=models.SET_NULL, null=True, blank=True)
    
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('in_use', 'In Use'),
        ('maintenance', 'Maintenance'),
        ('lost', 'Lost/Missing'),
    ]
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default='available')
    
    notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['category', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.category})"