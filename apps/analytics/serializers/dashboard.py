# apps/analytics/serializers/dashboard.py
from rest_framework import serializers
from decimal import Decimal
from ..models.metrics import ProductionMetrics, VelocityTrend, PerformanceBaseline


class ProductionMetricsSerializer(serializers.ModelSerializer):
    """Serializer for daily production metrics"""
    shooting_duration_hours = serializers.ReadOnlyField()
    
    class Meta:
        model = ProductionMetrics
        fields = [
            'id', 'date', 'pages_shot', 'scenes_completed', 'shots_completed',
            'takes_total', 'takes_good', 'shoot_ratio', 'efficiency_score',
            'setup_time_minutes', 'cost_per_page', 'estimated_daily_cost',
            'shooting_duration_hours', 'schedule_variance_days', 'velocity_trend'
        ]


class VelocityTrendSerializer(serializers.ModelSerializer):
    """Serializer for velocity trend data"""
    
    class Meta:
        model = VelocityTrend
        fields = [
            'date', 'velocity_7day', 'velocity_14day', 'velocity_30day',
            'trend_direction', 'trend_strength', 'prediction_confidence',
            'predicted_pages_next_7_days', 'predicted_completion_date'
        ]


class DashboardDataSerializer(serializers.Serializer):
    """Main dashboard data serializer"""
    
    # Velocity data
    velocity = serializers.DictField(child=serializers.JSONField(), required=False)
    
    # Efficiency data
    efficiency = serializers.DictField(child=serializers.JSONField(), required=False)
    
    # Schedule data
    schedule = serializers.DictField(child=serializers.JSONField(), required=False)
    
    # Budget data
    budget = serializers.DictField(child=serializers.JSONField(), required=False)
    
    # Timeline data for charts
    timeline_data = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )
    
    # Insights and recommendations
    insights = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )
    
    # Real-time metrics
    real_time = serializers.DictField(child=serializers.JSONField(), required=False)


class VelocityAnalysisSerializer(serializers.Serializer):
    """Detailed velocity analysis data"""
    
    daily_velocity = serializers.ListField(
        child=serializers.DictField(),
        help_text="Daily velocity chart data"
    )
    
    rolling_averages = serializers.DictField(
        child=serializers.ListField(child=serializers.FloatField()),
        help_text="Rolling averages for different time windows"
    )
    
    velocity_by_location = serializers.ListField(
        child=serializers.DictField(),
        help_text="Velocity breakdown by shooting location"
    )
    
    velocity_by_scene_type = serializers.ListField(
        child=serializers.DictField(),
        help_text="Velocity breakdown by scene type"
    )
    
    factors_analysis = serializers.DictField(
        help_text="Analysis of factors affecting velocity"
    )
    
    predictions = serializers.DictField(
        child=serializers.JSONField(),
        help_text="Velocity predictions and scenarios"
    )


class EfficiencyBreakdownSerializer(serializers.Serializer):
    """Detailed efficiency analysis data"""
    
    shoot_ratio_trend = serializers.ListField(
        child=serializers.DictField(),
        help_text="Shoot ratio trend over time"
    )
    
    setup_time_analysis = serializers.DictField(
        help_text="Setup time analysis and optimization suggestions"
    )
    
    department_efficiency = serializers.DictField(
        help_text="Efficiency scores by department"
    )
    
    location_efficiency = serializers.DictField(
        help_text="Efficiency breakdown by location"
    )
    
    time_of_day_analysis = serializers.DictField(
        help_text="Efficiency analysis by time of day"
    )
    
    crew_performance = serializers.DictField(
        help_text="Crew performance metrics"
    )
    
    recommendations = serializers.ListField(
        child=serializers.DictField(),
        help_text="Efficiency improvement recommendations"
    )


class PredictiveInsightsSerializer(serializers.Serializer):
    """AI-powered predictions and insights"""
    
    completion_forecast = serializers.DictField(
        child=serializers.JSONField(),
        help_text="Production completion forecasts"
    )
    
    budget_forecast = serializers.DictField(
        child=serializers.JSONField(),
        help_text="Budget projection and variance analysis"
    )
    
    risk_analysis = serializers.DictField(
        child=serializers.JSONField(),
        help_text="Risk identification and assessment"
    )
    
    optimization_suggestions = serializers.DictField(
        child=serializers.JSONField(),
        help_text="Optimization recommendations"
    )


class RealTimeMetricsSerializer(serializers.Serializer):
    """Real-time production metrics"""
    
    today = serializers.DictField(
        child=serializers.JSONField(),
        help_text="Today's metrics and progress"
    )
    
    current_status = serializers.CharField(
        help_text="Current production status"
    )
    
    live_metrics = serializers.DictField(
        child=serializers.JSONField(),
        help_text="Live production metrics"
    )
    
    alerts = serializers.ListField(
        child=serializers.DictField(),
        help_text="Active alerts and notifications"
    )


class MetricsCalculationSerializer(serializers.Serializer):
    """Serializer for metrics calculation requests"""
    
    production_id = serializers.UUIDField()
    date = serializers.DateField(required=False)
    
    def validate_production_id(self, value):
        from apps.production.models import Production
        try:
            Production.objects.get(id=value)
        except Production.DoesNotExist:
            raise serializers.ValidationError("Production not found")
        return value


class MetricsCalculationResponseSerializer(serializers.Serializer):
    """Response for metrics calculation"""
    
    status = serializers.ChoiceField(choices=[
        ('calculated', 'Calculated'),
        ('no_data', 'No Data'),
        ('error', 'Error')
    ])
    
    date = serializers.DateField()
    
    metrics = serializers.DictField(
        child=serializers.JSONField(),
        required=False
    )
    
    message = serializers.CharField(required=False)


class ComparisonSerializer(serializers.Serializer):
    """Serializer for production comparisons"""
    
    production_ids = serializers.ListField(
        child=serializers.UUIDField(),
        min_length=2,
        max_length=5
    )
    
    metrics_to_compare = serializers.ListField(
        child=serializers.ChoiceField(choices=[
            'velocity', 'efficiency', 'cost_per_page', 'schedule_variance'
        ]),
        default=['velocity', 'efficiency']
    )
    
    timeframe = serializers.ChoiceField(
        choices=[('7d', '7 days'), ('30d', '30 days'), ('all', 'All time')],
        default='30d'
    )


class BenchmarkComparisonSerializer(serializers.Serializer):
    """Serializer for industry benchmark comparisons"""
    
    production_type = serializers.ChoiceField(
        choices=[
            ('feature', 'Feature Film'),
            ('commercial', 'Commercial'),
            ('series', 'TV Series'),
            ('documentary', 'Documentary')
        ],
        default='feature'
    )
    
    budget_range = serializers.ChoiceField(
        choices=[
            ('low', 'Low Budget'),
            ('medium', 'Medium Budget'),
            ('high', 'High Budget')
        ],
        required=False
    )
    
    metrics = serializers.ListField(
        child=serializers.ChoiceField(choices=[
            'pages_per_day', 'shoot_ratio', 'setup_time', 'cost_per_page'
        ]),
        default=['pages_per_day', 'efficiency_score']
    )


class AlertSerializer(serializers.Serializer):
    """Serializer for production alerts"""
    
    id = serializers.IntegerField(required=False)
    severity = serializers.ChoiceField(choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical')
    ])
    
    type = serializers.ChoiceField(choices=[
        ('velocity', 'Velocity'),
        ('efficiency', 'Efficiency'),
        ('schedule', 'Schedule'),
        ('budget', 'Budget'),
        ('quality', 'Quality')
    ])
    
    title = serializers.CharField(max_length=200)
    message = serializers.CharField()
    timestamp = serializers.DateTimeField()
    
    acknowledged = serializers.BooleanField(default=False)
    acknowledged_by = serializers.CharField(required=False)
    acknowledged_at = serializers.DateTimeField(required=False)
    
    action_required = serializers.BooleanField(default=False)
    suggested_actions = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )


class InsightSerializer(serializers.Serializer):
    """Serializer for actionable insights"""
    
    type = serializers.ChoiceField(choices=[
        ('info', 'Information'),
        ('warning', 'Warning'),
        ('alert', 'Alert'),
        ('recommendation', 'Recommendation')
    ])
    
    category = serializers.ChoiceField(choices=[
        ('velocity', 'Velocity'),
        ('efficiency', 'Efficiency'),
        ('schedule', 'Schedule'),
        ('budget', 'Budget'),
        ('quality', 'Quality'),
        ('crew', 'Crew'),
        ('equipment', 'Equipment')
    ])
    
    title = serializers.CharField(max_length=200)
    message = serializers.CharField()
    confidence = serializers.FloatField(min_value=0, max_value=1, required=False)
    
    action = serializers.CharField(required=False)
    priority = serializers.ChoiceField(
        choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High')],
        default='medium'
    )
    
    data_sources = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    
    created_at = serializers.DateTimeField(required=False)


class TimelineDataSerializer(serializers.Serializer):
    """Serializer for timeline chart data"""
    
    date = serializers.DateField()
    pages_shot = serializers.DecimalField(max_digits=5, decimal_places=2)
    efficiency_score = serializers.DecimalField(max_digits=5, decimal_places=2, required=False)
    scenes_completed = serializers.IntegerField()
    shoot_ratio = serializers.DecimalField(max_digits=4, decimal_places=3, required=False)
    cost_per_page = serializers.DecimalField(max_digits=8, decimal_places=2, required=False)
    
    # Rolling averages for trend lines
    velocity_7day_avg = serializers.DecimalField(max_digits=5, decimal_places=2, required=False)
    efficiency_7day_avg = serializers.DecimalField(max_digits=5, decimal_places=2, required=False)


class ChartDataSerializer(serializers.Serializer):
    """Generic chart data serializer"""
    
    labels = serializers.ListField(child=serializers.CharField())
    datasets = serializers.ListField(
        child=serializers.DictField(child=serializers.JSONField())
    )
    
    options = serializers.DictField(
        child=serializers.JSONField(),
        required=False
    )