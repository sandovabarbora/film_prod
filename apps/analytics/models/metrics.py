from django.db import models
from django.db.models import Avg, Sum, Count, F
from django.utils import timezone
from datetime import timedelta
from apps.production.models import Production, Scene, Shot

class ProductionMetrics(models.Model):
    """Daily production metrics for analytics"""
    production = models.ForeignKey(Production, on_delete=models.CASCADE, related_name='metrics')
    date = models.DateField()
    
    # Core metrics
    pages_shot = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    scenes_completed = models.IntegerField(default=0)
    shots_completed = models.IntegerField(default=0)
    takes_total = models.IntegerField(default=0)
    takes_good = models.IntegerField(default=0)
    
    # Timing metrics
    first_shot_time = models.TimeField(null=True, blank=True)
    wrap_time = models.TimeField(null=True, blank=True)
    total_shooting_hours = models.DecimalField(max_digits=4, decimal_places=2, null=True)
    setup_time_minutes = models.IntegerField(default=0)
    
    # Efficiency metrics
    shoot_ratio = models.DecimalField(max_digits=4, decimal_places=3, null=True)  # good/total takes
    pages_per_hour = models.DecimalField(max_digits=4, decimal_places=2, null=True)
    setups_per_hour = models.DecimalField(max_digits=4, decimal_places=2, null=True)
    
    # Cost metrics (optional)
    estimated_daily_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    cost_per_page = models.DecimalField(max_digits=8, decimal_places=2, null=True)
    overtime_hours = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    
    # Weather/external factors
    weather_conditions = models.CharField(max_length=50, blank=True)
    temperature = models.IntegerField(null=True, blank=True)
    exterior_scenes_shot = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['production', 'date']
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.production.title} - {self.date}"
    
    @property
    def efficiency_score(self):
        """Calculate composite efficiency score (0-100)"""
        if not self.shoot_ratio or not self.pages_per_hour:
            return None
        
        # Weight shoot ratio 60%, pages per hour 40%
        shoot_score = float(self.shoot_ratio) * 100
        
        # Normalize pages per hour (assume 2.5 pages/hour is 100%)
        pages_score = min(100, (float(self.pages_per_hour) / 2.5) * 100)
        
        return round(shoot_score * 0.6 + pages_score * 0.4, 1)
    
    @classmethod
    def calculate_for_date(cls, production, date):
        """Calculate and save metrics for a specific date"""
        from apps.schedule.models import ShootingDay
        
        try:
            shooting_day = ShootingDay.objects.get(production=production, date=date)
        except ShootingDay.DoesNotExist:
            return None
        
        # Get completed scenes for this day
        completed_scenes = Scene.objects.filter(
            production=production,
            status='completed',
            # Assuming we track completion date somehow
        )
        
        # Get shots completed today
        completed_shots = Shot.objects.filter(
            scene__production=production,
            status='completed',
            completed_at__date=date
        )
        
        # Calculate takes
        takes_data = completed_shots.aggregate(
            total_takes=Sum('takes_completed'),
            good_takes=Sum('takes_good')
        )
        
        # Calculate pages
        pages_shot = sum(scene.estimated_pages for scene in completed_scenes)
        
        # Calculate shoot ratio
        shoot_ratio = None
        if takes_data['total_takes'] and takes_data['total_takes'] > 0:
            shoot_ratio = takes_data['good_takes'] / takes_data['total_takes']
        
        # Create or update metrics
        metrics, created = cls.objects.update_or_create(
            production=production,
            date=date,
            defaults={
                'pages_shot': pages_shot,
                'scenes_completed': completed_scenes.count(),
                'shots_completed': completed_shots.count(),
                'takes_total': takes_data['total_takes'] or 0,
                'takes_good': takes_data['good_takes'] or 0,
                'shoot_ratio': shoot_ratio,
            }
        )
        
        return metrics

class VelocityTrend(models.Model):
    """Track velocity trends over time"""
    production = models.ForeignKey(Production, on_delete=models.CASCADE)
    date = models.DateField()
    
    # Rolling averages
    velocity_7day = models.DecimalField(max_digits=5, decimal_places=2, null=True)  # pages per day
    velocity_14day = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    velocity_30day = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    
    # Trend direction
    trend_direction = models.CharField(max_length=10, choices=[
        ('up', 'Improving'),
        ('down', 'Declining'),
        ('stable', 'Stable')
    ], null=True)
    
    # Prediction confidence
    prediction_accuracy = models.DecimalField(max_digits=4, decimal_places=2, null=True)
    
    class Meta:
        unique_together = ['production', 'date']
        ordering = ['-date']

class PerformanceBaseline(models.Model):
    """Industry and historical baselines for comparison"""
    metric_type = models.CharField(max_length=50, choices=[
        ('pages_per_day', 'Pages per Day'),
        ('shoot_ratio', 'Shoot Ratio'),
        ('setup_time', 'Setup Time'),
        ('cost_per_page', 'Cost per Page'),
    ])
    
    # Baseline values
    industry_average = models.DecimalField(max_digits=8, decimal_places=2)
    industry_best = models.DecimalField(max_digits=8, decimal_places=2)
    production_type = models.CharField(max_length=50, default='feature')  # feature, commercial, series
    
    # Context
    budget_range = models.CharField(max_length=20, blank=True)  # low, medium, high
    crew_size = models.CharField(max_length=20, blank=True)    # small, medium, large
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['metric_type', 'production_type', 'budget_range']