from django.db import models
from django.utils import timezone
from apps.production.models import Production, Scene
from apps.crew.models import CrewMember
from apps.schedule.models import ShootingDay
from datetime import datetime, timedelta
import uuid

class ProductionMetrics(models.Model):
    """Daily production metrics and KPIs"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    production = models.ForeignKey(Production, on_delete=models.CASCADE, related_name='metrics')
    shooting_day = models.ForeignKey(ShootingDay, on_delete=models.CASCADE, related_name='metrics')
    date = models.DateField()
    
    # Timing metrics
    actual_start_time = models.TimeField(null=True, blank=True)
    actual_wrap_time = models.TimeField(null=True, blank=True)
    total_work_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Productivity metrics
    scenes_scheduled = models.IntegerField(default=0)
    scenes_completed = models.IntegerField(default=0)
    pages_scheduled = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    pages_shot = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    setups_completed = models.IntegerField(default=0)
    takes_total = models.IntegerField(default=0)
    takes_good = models.IntegerField(default=0)
    
    # Efficiency metrics
    schedule_variance_minutes = models.IntegerField(default=0)  # positive = behind schedule
    average_setup_time = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # minutes
    pages_per_hour = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    
    # Crew metrics
    crew_count = models.IntegerField(default=0)
    crew_overtime_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Issues tracking
    equipment_issues = models.IntegerField(default=0)
    weather_delays_minutes = models.IntegerField(default=0)
    technical_delays_minutes = models.IntegerField(default=0)
    other_delays_minutes = models.IntegerField(default=0)
    
    # Calculated fields
    efficiency_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # 0-100
    velocity_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)   # pages/day
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date']
        unique_together = ['production', 'date']
    
    def __str__(self):
        return f"{self.production.title} - {self.date}"
    
    def calculate_efficiency_score(self):
        """Calculate overall efficiency score (0-100)"""
        if self.scenes_scheduled == 0:
            return 0
        
        # Base completion rate (40% weight)
        completion_rate = (self.scenes_completed / self.scenes_scheduled) * 40
        
        # Time efficiency (30% weight)
        time_efficiency = 30
        if self.schedule_variance_minutes > 0:
            # Penalty for being behind schedule
            penalty = min(self.schedule_variance_minutes / 60 * 5, 30)  # Max 30 point penalty
            time_efficiency = max(0, 30 - penalty)
        
        # Quality score (20% weight) 
        quality_score = 20
        if self.takes_total > 0:
            take_ratio = self.takes_good / self.takes_total
            quality_score = take_ratio * 20
        
        # Issue penalty (10% weight)
        issue_penalty = (self.equipment_issues + (self.technical_delays_minutes / 30)) * 2
        issue_score = max(0, 10 - issue_penalty)
        
        total_score = completion_rate + time_efficiency + quality_score + issue_score
        return min(100, max(0, total_score))
    
    def save(self, *args, **kwargs):
        # Auto-calculate scores
        self.efficiency_score = self.calculate_efficiency_score()
        if self.total_work_hours > 0:
            self.velocity_score = self.pages_shot / float(self.total_work_hours)
        super().save(*args, **kwargs)

class CrewPerformance(models.Model):
    """Individual crew member performance metrics"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    production = models.ForeignKey(Production, on_delete=models.CASCADE, related_name='crew_performances')
    crew_member = models.ForeignKey(CrewMember, on_delete=models.CASCADE, related_name='performances')
    date = models.DateField()
    
    # Attendance
    call_time = models.TimeField(null=True, blank=True)
    arrival_time = models.TimeField(null=True, blank=True)
    departure_time = models.TimeField(null=True, blank=True)
    late_minutes = models.IntegerField(default=0)
    
    # Performance ratings (1-5 scale)
    punctuality_rating = models.IntegerField(default=5)
    quality_rating = models.IntegerField(default=5) 
    teamwork_rating = models.IntegerField(default=5)
    efficiency_rating = models.IntegerField(default=5)
    
    # Work metrics
    tasks_assigned = models.IntegerField(default=0)
    tasks_completed = models.IntegerField(default=0)
    hours_worked = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    overtime_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Notes and feedback
    notes = models.TextField(blank=True)
    supervisor_feedback = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date']
        unique_together = ['production', 'crew_member', 'date']
    
    def __str__(self):
        return f"{self.crew_member.display_name} - {self.date}"
    
    @property
    def overall_rating(self):
        """Calculate overall performance rating"""
        ratings = [
            self.punctuality_rating,
            self.quality_rating,
            self.teamwork_rating,
            self.efficiency_rating
        ]
        return sum(ratings) / len(ratings)

class BudgetTracking(models.Model):
    """Budget tracking and cost analysis"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    production = models.ForeignKey(Production, on_delete=models.CASCADE, related_name='budget_tracking')
    date = models.DateField()
    
    # Daily costs
    crew_costs = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    equipment_costs = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    location_costs = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    catering_costs = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    transportation_costs = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    other_costs = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Calculated totals
    total_daily_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    cumulative_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Budget variance
    planned_daily_budget = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    budget_variance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Cost per metrics
    cost_per_page = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    cost_per_scene = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date']
        unique_together = ['production', 'date']
    
    def __str__(self):
        return f"Budget {self.production.title} - {self.date}"
    
    def save(self, *args, **kwargs):
        # Calculate totals
        self.total_daily_cost = (
            self.crew_costs + self.equipment_costs + self.location_costs +
            self.catering_costs + self.transportation_costs + self.other_costs
        )
        self.budget_variance = self.total_daily_cost - self.planned_daily_budget
        super().save(*args, **kwargs)

class ProgressReport(models.Model):
    """Weekly/monthly progress reports"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    production = models.ForeignKey(Production, on_delete=models.CASCADE, related_name='progress_reports')
    
    REPORT_TYPE_CHOICES = [
        ('daily', 'Daily Report'),
        ('weekly', 'Weekly Report'),
        ('monthly', 'Monthly Report'),
        ('milestone', 'Milestone Report'),
    ]
    report_type = models.CharField(max_length=10, choices=REPORT_TYPE_CHOICES)
    
    period_start = models.DateField()
    period_end = models.DateField()
    
    # Summary metrics
    total_shooting_days = models.IntegerField(default=0)
    total_scenes_shot = models.IntegerField(default=0)
    total_pages_shot = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    average_pages_per_day = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Schedule performance
    days_on_schedule = models.IntegerField(default=0)
    days_behind_schedule = models.IntegerField(default=0)
    average_delay_minutes = models.IntegerField(default=0)
    
    # Budget performance
    total_spent = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    budget_variance_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Quality metrics
    average_efficiency_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    equipment_issues_count = models.IntegerField(default=0)
    weather_delay_days = models.IntegerField(default=0)
    
    # Completion status
    script_completion_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    schedule_completion_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Text summaries
    executive_summary = models.TextField(blank=True)
    key_achievements = models.TextField(blank=True)
    challenges_faced = models.TextField(blank=True)
    next_period_forecast = models.TextField(blank=True)
    
    generated_at = models.DateTimeField(auto_now_add=True)
    generated_by = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True)
    
    class Meta:
        ordering = ['-period_end']
        unique_together = ['production', 'report_type', 'period_start', 'period_end']
    
    def __str__(self):
        return f"{self.get_report_type_display()} - {self.production.title} ({self.period_start} to {self.period_end})"

class VelocityTrend(models.Model):
    """Track velocity trends over time"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    production = models.ForeignKey(Production, on_delete=models.CASCADE, related_name='velocity_trends')
    week_ending = models.DateField()
    
    # Velocity metrics
    pages_per_day = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    scenes_per_day = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    setups_per_day = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Trend indicators
    velocity_trend = models.CharField(max_length=20, choices=[
        ('increasing', 'Increasing'),
        ('stable', 'Stable'),
        ('decreasing', 'Decreasing'),
    ], default='stable')
    
    # Forecasting
    projected_completion_date = models.DateField(null=True, blank=True)
    days_ahead_behind = models.IntegerField(default=0)  # positive = ahead, negative = behind
    
    calculated_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-week_ending']
        unique_together = ['production', 'week_ending']
    
    def __str__(self):
        return f"Velocity Trend - {self.production.title} (Week ending {self.week_ending})"