from django.contrib import admin
from .models import (
    ProductionMetrics, CrewPerformance, BudgetTracking,
    ProgressReport, VelocityTrend
)

@admin.register(ProductionMetrics)
class ProductionMetricsAdmin(admin.ModelAdmin):
    list_display = [
        'production', 'date', 'shooting_day', 'scenes_completed', 'pages_shot',
        'efficiency_score', 'velocity_score', 'schedule_variance_minutes'
    ]
    list_filter = ['production', 'date', 'shooting_day__status']
    search_fields = ['production__title']
    readonly_fields = ['efficiency_score', 'velocity_score', 'created_at', 'updated_at']

@admin.register(CrewPerformance)
class CrewPerformanceAdmin(admin.ModelAdmin):
    list_display = [
        'crew_member', 'production', 'date', 'punctuality_rating',
        'quality_rating', 'overall_rating', 'late_minutes'
    ]
    list_filter = ['production', 'date', 'punctuality_rating', 'quality_rating']
    search_fields = ['crew_member__first_name', 'crew_member__last_name']

@admin.register(BudgetTracking)
class BudgetTrackingAdmin(admin.ModelAdmin):
    list_display = [
        'production', 'date', 'total_daily_cost', 'planned_daily_budget',
        'budget_variance', 'cost_per_page'
    ]
    list_filter = ['production', 'date']
    readonly_fields = ['total_daily_cost', 'budget_variance']

@admin.register(ProgressReport)
class ProgressReportAdmin(admin.ModelAdmin):
    list_display = [
        'production', 'report_type', 'period_start', 'period_end',
        'total_shooting_days', 'average_efficiency_score'
    ]
    list_filter = ['production', 'report_type', 'period_start']

@admin.register(VelocityTrend)
class VelocityTrendAdmin(admin.ModelAdmin):
    list_display = [
        'production', 'week_ending', 'pages_per_day', 'scenes_per_day',
        'velocity_trend', 'days_ahead_behind'
    ]
    list_filter = ['production', 'velocity_trend']