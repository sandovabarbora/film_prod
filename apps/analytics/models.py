# apps/analytics/models.py
from django.db import models
from django.db.models import Avg, Sum, Count, F, Q
from django.utils import timezone
from datetime import timedelta
import numpy as np

class ProductionMetrics(models.Model):
    """Time-series metrics for production analytics"""
    production = models.ForeignKey('production.Production', on_delete=models.CASCADE)
    date = models.DateField()
    
    # Daily metrics
    pages_shot = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    scenes_completed = models.IntegerField(default=0)
    shots_completed = models.IntegerField(default=0)
    crew_hours_total = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    overtime_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    
    # Efficiency metrics
    setup_time_avg = models.DurationField(null=True)
    takes_per_shot_avg = models.DecimalField(max_digits=4, decimal_places=2, null=True)
    shoot_ratio = models.DecimalField(max_digits=4, decimal_places=3, null=True)  # good takes / total takes
    
    # Budget tracking
    daily_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    cost_per_page = models.DecimalField(max_digits=8, decimal_places=2, null=True)
    
    # Predictive metrics
    estimated_completion_date = models.DateField(null=True)
    schedule_variance_days = models.IntegerField(default=0)  # + = behind, - = ahead
    budget_variance_percent = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['production', 'date']
        ordering = ['-date']

class PredictiveAnalytics:
    """ML-inspired analytics for production forecasting"""
    
    @staticmethod
    def calculate_velocity_trend(production, days_window=7):
        """Calculate production velocity (pages/day) trend"""
        recent_metrics = ProductionMetrics.objects.filter(
            production=production,
            date__gte=timezone.now().date() - timedelta(days=days_window)
        ).order_by('date')
        
        if len(recent_metrics) < 3:
            return None
            
        # Simple linear regression on pages per day
        dates = [m.date for m in recent_metrics]
        pages = [float(m.pages_shot) for m in recent_metrics]
        
        # Convert dates to numeric (days since start)
        x = [(d - dates[0]).days for d in dates]
        
        if len(x) > 1:
            slope = np.polyfit(x, pages, 1)[0]  # Linear trend
            return slope
        return 0
    
    @staticmethod
    def predict_completion_date(production):
        """Predict completion based on current velocity"""
        total_pages = production.scenes.aggregate(
            total=Sum('estimated_pages')
        )['total'] or 0
        
        completed_pages = ProductionMetrics.objects.filter(
            production=production
        ).aggregate(total=Sum('pages_shot'))['total'] or 0
        
        remaining_pages = total_pages - completed_pages
        
        velocity = PredictiveAnalytics.calculate_velocity_trend(production)
        if velocity and velocity > 0:
            days_remaining = remaining_pages / velocity
            return timezone.now().date() + timedelta(days=int(days_remaining))
        
        return None
    
    @staticmethod
    def calculate_efficiency_score(production):
        """Composite efficiency score (0-100)"""
        recent_metrics = ProductionMetrics.objects.filter(
            production=production,
            date__gte=timezone.now().date() - timedelta(days=7)
        )
        
        if not recent_metrics.exists():
            return None
        
        avg_shoot_ratio = recent_metrics.aggregate(
            avg=Avg('shoot_ratio')
        )['avg'] or 0
        
        avg_takes_per_shot = recent_metrics.aggregate(
            avg=Avg('takes_per_shot_avg')
        )['avg'] or 0
        
        # Score: 70% shoot ratio + 30% inverse of takes per shot
        shoot_score = float(avg_shoot_ratio) * 100
        takes_score = max(0, 100 - (float(avg_takes_per_shot) - 1) * 20)
        
        return (shoot_score * 0.7 + takes_score * 0.3)

class WeatherPredictionIntegration(models.Model):
    """Weather data for exterior shooting optimization"""
    production = models.ForeignKey('production.Production', on_delete=models.CASCADE)
    date = models.DateField()
    location = models.ForeignKey('production.Location', on_delete=models.CASCADE)
    
    # Weather data
    temperature_high = models.IntegerField()
    temperature_low = models.IntegerField()
    precipitation_chance = models.IntegerField()  # 0-100%
    wind_speed = models.IntegerField()  # km/h
    cloud_cover = models.IntegerField()  # 0-100%
    
    # Shooting conditions
    exterior_suitable = models.BooleanField()
    golden_hour_start = models.TimeField()
    golden_hour_end = models.TimeField()
    
    # Recommendations
    recommended_exterior_scenes = models.ManyToManyField(
        'production.Scene', 
        blank=True,
        limit_choices_to={'int_ext': 'EXT'}
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['production', 'date', 'location']