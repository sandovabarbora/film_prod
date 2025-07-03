# apps/analytics/models/metrics.py
from django.db import models
from django.db.models import Avg, Sum, Count, F, Q
from django.utils import timezone
from datetime import timedelta, time
from decimal import Decimal
from apps.production.models import Production, Scene


class ProductionMetrics(models.Model):
    """Daily production metrics for comprehensive analytics"""
    production = models.ForeignKey(Production, on_delete=models.CASCADE, related_name='analytics_metrics')
    date = models.DateField()
    
    # Core productivity metrics
    pages_shot = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    scenes_completed = models.IntegerField(default=0)
    shots_completed = models.IntegerField(default=0)
    takes_total = models.IntegerField(default=0)
    takes_good = models.IntegerField(default=0)
    
    # Timing and efficiency
    first_shot_time = models.TimeField(null=True, blank=True)
    wrap_time = models.TimeField(null=True, blank=True)
    total_shooting_hours = models.DecimalField(max_digits=4, decimal_places=2, null=True)
    setup_time_minutes = models.IntegerField(default=0)
    crew_hours_total = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    overtime_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    
    # Calculated efficiency metrics
    shoot_ratio = models.DecimalField(max_digits=4, decimal_places=3, null=True)
    pages_per_hour = models.DecimalField(max_digits=4, decimal_places=2, null=True)
    setups_per_hour = models.DecimalField(max_digits=4, decimal_places=2, null=True)
    efficiency_score = models.DecimalField(max_digits=5, decimal_places=2, null=True)  # 0-100
    
    # Budget tracking
    estimated_daily_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    cost_per_page = models.DecimalField(max_digits=8, decimal_places=2, null=True)
    budget_variance_percent = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    
    # Predictive fields
    estimated_completion_date = models.DateField(null=True)
    schedule_variance_days = models.IntegerField(default=0)
    velocity_trend = models.CharField(max_length=20, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    calculated_by = models.CharField(max_length=100, default='system')
    
    class Meta:
        unique_together = ['production', 'date']
        ordering = ['-date']
        indexes = [
            models.Index(fields=['production', 'date']),
            models.Index(fields=['date']),
            models.Index(fields=['efficiency_score']),
        ]
    
    def __str__(self):
        return f"{self.production.title} - {self.date} ({self.pages_shot}pp)"
    
    @property
    def shooting_duration_hours(self):
        """Calculate total shooting duration in hours"""
        if self.first_shot_time and self.wrap_time:
            start = timezone.datetime.combine(self.date, self.first_shot_time)
            end = timezone.datetime.combine(self.date, self.wrap_time)
            
            if end < start:  # Wrapped to next day
                end += timedelta(days=1)
            
            duration = end - start
            return round(duration.total_seconds() / 3600, 2)
        return None
    
    @classmethod
    def calculate_for_date(cls, production_id, date):
        """Calculate and save metrics for a specific date"""
        from apps.schedule.models import ShootingDay
        
        try:
            production = Production.objects.get(id=production_id)
        except Production.DoesNotExist:
            return None
        
        # Try to get shooting day data
        try:
            shooting_day = ShootingDay.objects.get(
                production=production,
                date=date
            )
        except ShootingDay.DoesNotExist:
            # No shooting day scheduled, calculate from scenes/shots
            shooting_day = None
        
        # Calculate metrics from Scene and Shot data
        completed_scenes = Scene.objects.filter(
            production=production,
            status='completed'
        )
        
        completed_shots = Shot.objects.filter(
            scene__production=production,
            status='completed'
        )
        
        # Calculate takes data
        takes_data = completed_shots.aggregate(
            total_takes=Sum('takes_completed'),
            good_takes=Sum('takes_good')
        )
        
        # Calculate pages shot (from completed scenes)
        pages_shot = completed_scenes.aggregate(
            total_pages=Sum('estimated_pages')
        )['total_pages'] or 0
        
        metrics_data = {
            'pages_shot': pages_shot,
            'scenes_completed': completed_scenes.count(),
            'shots_completed': completed_shots.count(),
            'takes_total': takes_data['total_takes'] or 0,
            'takes_good': takes_data['good_takes'] or 0,
        }
        
        # Calculate derived metrics
        if takes_data['total_takes'] and takes_data['total_takes'] > 0:
            metrics_data['shoot_ratio'] = (takes_data['good_takes'] or 0) / takes_data['total_takes']
        
        # Estimate timing from shooting day if available
        if shooting_day:
            metrics_data['first_shot_time'] = shooting_day.crew_call
            metrics_data['wrap_time'] = shooting_day.wrap_time
            
            # Calculate shooting hours
            if shooting_day.crew_call and shooting_day.wrap_time:
                start = timezone.datetime.combine(date, shooting_day.crew_call)
                end = timezone.datetime.combine(date, shooting_day.wrap_time)
                if end < start:  # Wrapped next day
                    end += timedelta(days=1)
                hours = (end - start).total_seconds() / 3600
                metrics_data['total_shooting_hours'] = round(hours, 2)
        
        # Calculate efficiency score
        metrics_data['efficiency_score'] = cls._calculate_efficiency_score_from_data(metrics_data)
        
        # Estimate cost per page
        if metrics_data['pages_shot'] > 0:
            # Use production budget to estimate daily cost
            if hasattr(production, 'budget') and production.budget:
                estimated_total_days = 50  # Typical feature film
                daily_cost = float(production.budget) / estimated_total_days * 0.5  # 50% is production cost
                metrics_data['cost_per_page'] = daily_cost / float(metrics_data['pages_shot'])
                metrics_data['estimated_daily_cost'] = daily_cost
        
        # Create or update metrics
        metrics, created = cls.objects.update_or_create(
            production=production,
            date=date,
            defaults=metrics_data
        )
        
        return metrics
    
    @staticmethod
    def _calculate_efficiency_score_from_data(metrics_data):
        """Calculate composite efficiency score from metrics data"""
        score = 0
        factors = 0
        
        # Pages shot factor (40% weight)
        if metrics_data.get('pages_shot'):
            target_pages = 5.0  # Industry standard
            pages_score = min(100, (float(metrics_data['pages_shot']) / target_pages) * 100)
            score += pages_score * 0.4
            factors += 0.4
        
        # Shoot ratio factor (30% weight)
        if metrics_data.get('shoot_ratio'):
            ratio_score = min(100, float(metrics_data['shoot_ratio']) * 150)  # 67% good takes = 100 score
            score += ratio_score * 0.3
            factors += 0.3
        
        # Scene completion factor (20% weight)
        if metrics_data.get('scenes_completed'):
            target_scenes = 8  # Target scenes per day
            scene_score = min(100, (metrics_data['scenes_completed'] / target_scenes) * 100)
            score += scene_score * 0.2
            factors += 0.2
        
        # Shot completion factor (10% weight)
        if metrics_data.get('shots_completed'):
            target_shots = 20  # Target shots per day
            shot_score = min(100, (metrics_data['shots_completed'] / target_shots) * 100)
            score += shot_score * 0.1
            factors += 0.1
        
        return round(score / factors if factors > 0 else 75, 1)  # Default to 75 if no data


class VelocityTrend(models.Model):
    """Track velocity trends and rolling averages"""
    production = models.ForeignKey(Production, on_delete=models.CASCADE, related_name='velocity_trends')
    date = models.DateField()
    
    # Rolling velocity averages (pages per day)
    velocity_7day = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    velocity_14day = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    velocity_30day = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    
    # Trend analysis
    trend_direction = models.CharField(max_length=20, choices=[
        ('improving', 'Improving'),
        ('declining', 'Declining'),
        ('stable', 'Stable'),
        ('volatile', 'Volatile')
    ], null=True)
    
    trend_strength = models.DecimalField(max_digits=3, decimal_places=2, null=True)  # 0-1
    prediction_confidence = models.DecimalField(max_digits=4, decimal_places=2, null=True)  # 0-100
    
    # Forecasting
    predicted_pages_next_7_days = models.DecimalField(max_digits=6, decimal_places=2, null=True)
    predicted_completion_date = models.DateField(null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['production', 'date']
        ordering = ['-date']
    
    @classmethod
    def calculate_for_date(cls, production_id, date):
        """Calculate velocity trends for a specific date"""
        try:
            production = Production.objects.get(id=production_id)
        except Production.DoesNotExist:
            return None
        
        # Get historical metrics
        metrics = ProductionMetrics.objects.filter(
            production=production,
            date__lte=date
        ).order_by('date')
        
        if len(metrics) < 3:
            return None
        
        # Calculate rolling averages
        velocity_7day = cls._calculate_rolling_velocity(metrics, date, 7)
        velocity_14day = cls._calculate_rolling_velocity(metrics, date, 14)
        velocity_30day = cls._calculate_rolling_velocity(metrics, date, 30)
        
        # Determine trend
        trend_direction, trend_strength = cls._calculate_trend(metrics, date)
        
        # Create or update trend record
        trend, created = cls.objects.update_or_create(
            production=production,
            date=date,
            defaults={
                'velocity_7day': velocity_7day,
                'velocity_14day': velocity_14day,
                'velocity_30day': velocity_30day,
                'trend_direction': trend_direction,
                'trend_strength': trend_strength,
                'prediction_confidence': cls._calculate_confidence(metrics, date)
            }
        )
        
        return trend
    
    @staticmethod
    def _calculate_rolling_velocity(metrics, target_date, window_days):
        """Calculate rolling average velocity"""
        start_date = target_date - timedelta(days=window_days-1)
        window_metrics = [m for m in metrics if start_date <= m.date <= target_date]
        
        if not window_metrics:
            return None
        
        total_pages = sum(float(m.pages_shot) for m in window_metrics)
        return round(total_pages / len(window_metrics), 2)
    
    @staticmethod
    def _calculate_trend(metrics, target_date):
        """Calculate trend direction and strength"""
        if len(metrics) < 7:
            return 'insufficient_data', 0
        
        # Get last 14 days of data
        recent_metrics = [m for m in metrics if m.date > target_date - timedelta(days=14)]
        
        if len(recent_metrics) < 7:
            return 'insufficient_data', 0
        
        # Simple trend calculation - compare first and second half
        mid_point = len(recent_metrics) // 2
        first_half = recent_metrics[:mid_point]
        second_half = recent_metrics[mid_point:]
        
        first_avg = sum(float(m.pages_shot) for m in first_half) / len(first_half)
        second_avg = sum(float(m.pages_shot) for m in second_half) / len(second_half)
        
        if first_avg == 0:
            return 'stable', 0
        
        change_percent = ((second_avg - first_avg) / first_avg) * 100
        
        if change_percent > 10:
            trend = 'improving'
        elif change_percent < -10:
            trend = 'declining'
        else:
            trend = 'stable'
        
        strength = min(1.0, abs(change_percent) / 20)
        
        return trend, round(strength, 2)
    
    @staticmethod
    def _calculate_confidence(metrics, target_date):
        """Calculate prediction confidence based on data consistency"""
        if len(metrics) < 7:
            return 30
        
        recent_metrics = [m for m in metrics if m.date > target_date - timedelta(days=14)]
        pages_values = [float(m.pages_shot) for m in recent_metrics]
        
        if not pages_values:
            return 30
        
        # Calculate coefficient of variation
        mean_pages = sum(pages_values) / len(pages_values)
        if mean_pages == 0:
            return 30
        
        variance = sum((x - mean_pages) ** 2 for x in pages_values) / len(pages_values)
        std_dev = variance ** 0.5
        cv = std_dev / mean_pages
        
        # Lower variation = higher confidence
        confidence = max(30, min(95, 100 - (cv * 100)))
        
        return round(confidence, 1)


class PerformanceBaseline(models.Model):
    """Industry and historical performance baselines"""
    metric_type = models.CharField(max_length=50, choices=[
        ('pages_per_day', 'Pages per Day'),
        ('shoot_ratio', 'Shoot Ratio'),
        ('setup_time', 'Setup Time Minutes'),
        ('cost_per_page', 'Cost per Page'),
        ('efficiency_score', 'Efficiency Score'),
        ('crew_hours_per_page', 'Crew Hours per Page'),
    ])
    
    production_type = models.CharField(max_length=50, choices=[
        ('feature', 'Feature Film'),
        ('commercial', 'Commercial'),
        ('series', 'TV Series'),
        ('documentary', 'Documentary'),
        ('music_video', 'Music Video'),
    ], default='feature')
    
    budget_range = models.CharField(max_length=20, choices=[
        ('low', 'Low Budget'),
        ('medium', 'Medium Budget'),
        ('high', 'High Budget'),
        ('ultra_high', 'Ultra High Budget'),
    ], blank=True)
    
    # Baseline values
    industry_average = models.DecimalField(max_digits=10, decimal_places=2)
    industry_median = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    industry_best_25th = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    industry_worst_25th = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    
    # Context information
    sample_size = models.IntegerField(default=0)
    data_source = models.CharField(max_length=100, blank=True)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['metric_type', 'production_type', 'budget_range']
        indexes = [
            models.Index(fields=['metric_type', 'production_type']),
        ]
    
    def __str__(self):
        return f"{self.get_metric_type_display()} - {self.get_production_type_display()}"


class AlertConfiguration(models.Model):
    """Configuration for production alerts and thresholds"""
    production = models.ForeignKey(Production, on_delete=models.CASCADE, related_name='alert_configs')
    
    # Velocity alerts
    velocity_decline_threshold = models.DecimalField(max_digits=4, decimal_places=1, default=20)  # percent
    velocity_target_pages_per_day = models.DecimalField(max_digits=4, decimal_places=2, default=5)
    
    # Efficiency alerts
    efficiency_low_threshold = models.DecimalField(max_digits=4, decimal_places=1, default=70)
    shoot_ratio_low_threshold = models.DecimalField(max_digits=3, decimal_places=2, default=0.6)
    
    # Schedule alerts
    schedule_variance_warning_days = models.IntegerField(default=3)
    schedule_variance_critical_days = models.IntegerField(default=7)
    
    # Budget alerts
    budget_variance_warning_percent = models.DecimalField(max_digits=4, decimal_places=1, default=10)
    budget_variance_critical_percent = models.DecimalField(max_digits=4, decimal_places=1, default=20)
    
    # Notification settings
    email_notifications = models.BooleanField(default=True)
    slack_notifications = models.BooleanField(default=False)
    dashboard_notifications = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Alert Configuration"
        verbose_name_plural = "Alert Configurations"