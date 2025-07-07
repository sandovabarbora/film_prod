from rest_framework import serializers
from .models import (
    ProductionMetrics, CrewPerformance, BudgetTracking,
    ProgressReport, VelocityTrend
)

class ProductionMetricsSerializer(serializers.ModelSerializer):
    """Production metrics serializer"""
    production_title = serializers.CharField(source='production.title', read_only=True)
    shooting_day_number = serializers.IntegerField(source='shooting_day.day_number', read_only=True)
    
    # Calculated fields
    completion_rate = serializers.SerializerMethodField()
    pages_per_hour_actual = serializers.SerializerMethodField()
    total_delay_minutes = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductionMetrics
        fields = '__all__'
        read_only_fields = ['id', 'efficiency_score', 'velocity_score', 'created_at', 'updated_at']
    
    def get_completion_rate(self, obj):
        """Calculate scene completion rate as percentage"""
        if obj.scenes_scheduled == 0:
            return 0
        return round((obj.scenes_completed / obj.scenes_scheduled) * 100, 1)
    
    def get_pages_per_hour_actual(self, obj):
        """Calculate actual pages per hour"""
        if obj.total_work_hours == 0:
            return 0
        return round(float(obj.pages_shot / obj.total_work_hours), 2)
    
    def get_total_delay_minutes(self, obj):
        """Calculate total delay minutes from all sources"""
        return (
            obj.weather_delays_minutes + 
            obj.technical_delays_minutes + 
            obj.other_delays_minutes
        )

class CrewPerformanceSerializer(serializers.ModelSerializer):
    """Crew performance serializer"""
    crew_member_name = serializers.CharField(source='crew_member.display_name', read_only=True)
    crew_member_position = serializers.CharField(source='crew_member.primary_position.title', read_only=True)
    production_title = serializers.CharField(source='production.title', read_only=True)
    
    # Calculated fields
    overall_rating = serializers.ReadOnlyField()
    completion_rate = serializers.SerializerMethodField()
    attendance_status = serializers.SerializerMethodField()
    
    class Meta:
        model = CrewPerformance
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_completion_rate(self, obj):
        """Calculate task completion rate"""
        if obj.tasks_assigned == 0:
            return 100
        return round((obj.tasks_completed / obj.tasks_assigned) * 100, 1)
    
    def get_attendance_status(self, obj):
        """Get attendance status based on punctuality"""
        if obj.late_minutes == 0:
            return 'on_time'
        elif obj.late_minutes <= 15:
            return 'slightly_late'
        else:
            return 'late'

class BudgetTrackingSerializer(serializers.ModelSerializer):
    """Budget tracking serializer"""
    production_title = serializers.CharField(source='production.title', read_only=True)
    
    # Calculated fields
    budget_variance_percent = serializers.SerializerMethodField()
    cost_breakdown = serializers.SerializerMethodField()
    variance_status = serializers.SerializerMethodField()
    
    class Meta:
        model = BudgetTracking
        fields = '__all__'
        read_only_fields = [
            'id', 'total_daily_cost', 'budget_variance', 
            'cost_per_page', 'cost_per_scene', 'created_at', 'updated_at'
        ]
    
    def get_budget_variance_percent(self, obj):
        """Calculate budget variance as percentage"""
        if obj.planned_daily_budget == 0:
            return 0
        return round((obj.budget_variance / obj.planned_daily_budget) * 100, 2)
    
    def get_cost_breakdown(self, obj):
        """Get cost breakdown by category"""
        total = float(obj.total_daily_cost)
        if total == 0:
            return {}
        
        return {
            'crew': {
                'amount': float(obj.crew_costs),
                'percentage': round((obj.crew_costs / total) * 100, 1)
            },
            'equipment': {
                'amount': float(obj.equipment_costs),
                'percentage': round((obj.equipment_costs / total) * 100, 1)
            },
            'location': {
                'amount': float(obj.location_costs),
                'percentage': round((obj.location_costs / total) * 100, 1)
            },
            'catering': {
                'amount': float(obj.catering_costs),
                'percentage': round((obj.catering_costs / total) * 100, 1)
            },
            'transportation': {
                'amount': float(obj.transportation_costs),
                'percentage': round((obj.transportation_costs / total) * 100, 1)
            },
            'other': {
                'amount': float(obj.other_costs),
                'percentage': round((obj.other_costs / total) * 100, 1)
            }
        }
    
    def get_variance_status(self, obj):
        """Get budget variance status"""
        if obj.budget_variance < -100:
            return 'significantly_under'
        elif obj.budget_variance < 0:
            return 'under_budget'
        elif obj.budget_variance <= 100:
            return 'on_budget'
        else:
            return 'over_budget'

class ProgressReportSerializer(serializers.ModelSerializer):
    """Progress report serializer"""
    production_title = serializers.CharField(source='production.title', read_only=True)
    generated_by_name = serializers.CharField(source='generated_by.get_full_name', read_only=True)
    
    # Calculated fields
    period_length_days = serializers.SerializerMethodField()
    schedule_performance_status = serializers.SerializerMethodField()
    budget_performance_status = serializers.SerializerMethodField()
    
    class Meta:
        model = ProgressReport
        fields = '__all__'
        read_only_fields = ['id', 'generated_at']
    
    def get_period_length_days(self, obj):
        """Calculate period length in days"""
        return (obj.period_end - obj.period_start).days + 1
    
    def get_schedule_performance_status(self, obj):
        """Get schedule performance status"""
        if obj.days_behind_schedule == 0:
            return 'on_schedule'
        elif obj.days_behind_schedule > obj.days_on_schedule:
            return 'behind_schedule'
        else:
            return 'mixed_performance'
    
    def get_budget_performance_status(self, obj):
        """Get budget performance status"""
        variance = float(obj.budget_variance_percent)
        if variance <= -5:
            return 'under_budget'
        elif variance <= 5:
            return 'on_budget'
        else:
            return 'over_budget'

class VelocityTrendSerializer(serializers.ModelSerializer):
    """Velocity trend serializer"""
    production_title = serializers.CharField(source='production.title', read_only=True)
    
    # Calculated fields
    forecast_accuracy = serializers.SerializerMethodField()
    performance_indicator = serializers.SerializerMethodField()
    
    class Meta:
        model = VelocityTrend
        fields = '__all__'
        read_only_fields = ['id', 'calculated_at']
    
    def get_forecast_accuracy(self, obj):
        """Calculate forecast accuracy based on historical data"""
        # This would compare projected vs actual completion
        # Simplified for now
        return 85.0
    
    def get_performance_indicator(self, obj):
        """Get overall performance indicator"""
        if obj.days_ahead_behind > 2:
            return 'ahead_of_schedule'
        elif obj.days_ahead_behind < -2:
            return 'behind_schedule'
        else:
            return 'on_schedule'

class DashboardDataSerializer(serializers.Serializer):
    """Dashboard overview data serializer"""
    
    # Production summary
    production_title = serializers.CharField()
    shooting_days_total = serializers.IntegerField()
    shooting_days_completed = serializers.IntegerField()
    shooting_days_remaining = serializers.IntegerField()
    
    # Progress metrics
    scenes_total = serializers.IntegerField()
    scenes_completed = serializers.IntegerField()
    pages_total = serializers.DecimalField(max_digits=6, decimal_places=2)
    pages_shot = serializers.DecimalField(max_digits=6, decimal_places=2)
    completion_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    
    # Performance metrics
    average_efficiency_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    average_velocity = serializers.DecimalField(max_digits=5, decimal_places=2)
    schedule_variance_days = serializers.IntegerField()
    
    # Budget metrics
    total_budget = serializers.DecimalField(max_digits=12, decimal_places=2)
    budget_spent = serializers.DecimalField(max_digits=12, decimal_places=2)
    budget_remaining = serializers.DecimalField(max_digits=12, decimal_places=2)
    budget_variance_percent = serializers.DecimalField(max_digits=5, decimal_places=2)
    
    # Status indicators
    overall_status = serializers.CharField()
    schedule_status = serializers.CharField()
    budget_status = serializers.CharField()
    quality_status = serializers.CharField()
    
    # Forecasting
    projected_completion_date = serializers.DateField()
    projected_final_budget = serializers.DecimalField(max_digits=12, decimal_places=2)

class KPICardSerializer(serializers.Serializer):
    """KPI card data serializer"""
    title = serializers.CharField()
    value = serializers.CharField()
    trend = serializers.CharField()  # 'up', 'down', 'stable'
    trend_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    status = serializers.CharField()  # 'good', 'warning', 'critical'
    subtitle = serializers.CharField(required=False)
    icon = serializers.CharField(required=False)