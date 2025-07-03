from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Sum, Count, F, Q
from django.utils import timezone
from datetime import timedelta, date
from ..models.metrics import ProductionMetrics, VelocityTrend
from ..services.analytics_engine import AnalyticsEngine
from ..serializers.dashboard import DashboardDataSerializer

class AnalyticsDashboardViewSet(viewsets.ViewSet):
    """Analytics dashboard API endpoints"""
    
    @action(detail=False, methods=['get'])
    def overview(self, request):
        """Main dashboard overview data"""
        production_id = request.query_params.get('production_id')
        timeframe = request.query_params.get('timeframe', '30d')
        
        if not production_id:
            return Response({'error': 'production_id required'}, status=400)
        
        days_back = self._parse_timeframe(timeframe)
        start_date = timezone.now().date() - timedelta(days=days_back)
        
        # Get metrics for timeframe
        metrics = ProductionMetrics.objects.filter(
            production_id=production_id,
            date__gte=start_date
        ).order_by('date')
        
        # Calculate key metrics
        analytics_engine = AnalyticsEngine(production_id)
        
        overview_data = {
            'velocity': {
                'current': analytics_engine.get_current_velocity(),
                'trend': analytics_engine.get_velocity_trend(days_back),
                'forecast': analytics_engine.predict_completion_date()
            },
            'efficiency': {
                'score': analytics_engine.get_efficiency_score(),
                'trend': analytics_engine.get_efficiency_trend(),
                'breakdown': analytics_engine.get_efficiency_breakdown()
            },
            'schedule': {
                'status': analytics_engine.get_schedule_status(),
                'variance_days': analytics_engine.get_schedule_variance(),
                'critical_path': analytics_engine.get_critical_path_analysis()
            },
            'budget': {
                'daily_average': analytics_engine.get_daily_cost_average(),
                'cost_per_page': analytics_engine.get_cost_per_page(),
                'variance_percent': analytics_engine.get_budget_variance()
            },
            'timeline_data': self._prepare_timeline_data(metrics),
            'insights': analytics_engine.get_actionable_insights()
        }
        
        return Response(overview_data)
    
    @action(detail=False, methods=['get'])
    def velocity_analysis(self, request):
        """Detailed velocity analysis"""
        production_id = request.query_params.get('production_id')
        
        analytics_engine = AnalyticsEngine(production_id)
        
        velocity_data = {
            'daily_velocity': analytics_engine.get_daily_velocity_chart(),
            'rolling_averages': analytics_engine.get_rolling_averages(),
            'velocity_by_location': analytics_engine.get_velocity_by_location(),
            'velocity_by_scene_type': analytics_engine.get_velocity_by_scene_type(),
            'factors_analysis': analytics_engine.analyze_velocity_factors(),
            'predictions': {
                'next_week': analytics_engine.predict_next_week_velocity(),
                'completion_scenarios': analytics_engine.get_completion_scenarios()
            }
        }
        
        return Response(velocity_data)
    
    @action(detail=False, methods=['get'])
    def efficiency_breakdown(self, request):
        """Detailed efficiency analysis"""
        production_id = request.query_params.get('production_id')
        
        analytics_engine = AnalyticsEngine(production_id)
        
        efficiency_data = {
            'shoot_ratio_trend': analytics_engine.get_shoot_ratio_trend(),
            'setup_time_analysis': analytics_engine.get_setup_time_analysis(),
            'department_efficiency': analytics_engine.get_department_efficiency(),
            'location_efficiency': analytics_engine.get_location_efficiency(),
            'time_of_day_analysis': analytics_engine.get_time_of_day_efficiency(),
            'crew_performance': analytics_engine.get_crew_performance_metrics(),
            'recommendations': analytics_engine.get_efficiency_recommendations()
        }
        
        return Response(efficiency_data)
    
    @action(detail=False, methods=['get'])
    def predictive_insights(self, request):
        """AI-powered predictions and insights"""
        production_id = request.query_params.get('production_id')
        
        analytics_engine = AnalyticsEngine(production_id)
        
        predictions = {
            'completion_forecast': {
                'most_likely_date': analytics_engine.predict_completion_date(),
                'confidence_interval': analytics_engine.get_completion_confidence(),
                'scenarios': analytics_engine.get_completion_scenarios()
            },
            'budget_forecast': {
                'projected_total': analytics_engine.predict_total_budget(),
                'variance_risk': analytics_engine.get_budget_risk_analysis(),
                'cost_optimization': analytics_engine.get_cost_optimization_suggestions()
            },
            'risk_analysis': {
                'schedule_risks': analytics_engine.identify_schedule_risks(),
                'budget_risks': analytics_engine.identify_budget_risks(),
                'operational_risks': analytics_engine.identify_operational_risks()
            },
            'optimization_suggestions': {
                'schedule_optimization': analytics_engine.suggest_schedule_optimizations(),
                'resource_optimization': analytics_engine.suggest_resource_optimizations(),
                'workflow_improvements': analytics_engine.suggest_workflow_improvements()
            }
        }
        
        return Response(predictions)
    
    @action(detail=False, methods=['get'])
    def real_time_metrics(self, request):
        """Real-time production metrics"""
        production_id = request.query_params.get('production_id')
        today = timezone.now().date()
        
        # Get today's metrics
        try:
            today_metrics = ProductionMetrics.objects.get(
                production_id=production_id,
                date=today
            )
        except ProductionMetrics.DoesNotExist:
            today_metrics = None
        
        analytics_engine = AnalyticsEngine(production_id)
        
        real_time_data = {
            'today': {
                'pages_shot': today_metrics.pages_shot if today_metrics else 0,
                'scenes_completed': today_metrics.scenes_completed if today_metrics else 0,
                'current_efficiency': analytics_engine.get_current_efficiency(),
                'projected_daily_total': analytics_engine.project_daily_total()
            },
            'current_status': analytics_engine.get_current_production_status(),
            'live_metrics': {
                'active_crew': analytics_engine.get_active_crew_count(),
                'current_scene': analytics_engine.get_current_scene_info(),
                'time_elapsed': analytics_engine.get_time_elapsed_today(),
                'estimated_wrap': analytics_engine.estimate_wrap_time()
            },
            'alerts': analytics_engine.get_active_alerts()
        }
        
        return Response(real_time_data)
    
    def _parse_timeframe(self, timeframe):
        """Parse timeframe parameter to days"""
        timeframe_map = {
            '7d': 7,
            '14d': 14,
            '30d': 30,
            '90d': 90,
            'all': 365  # Max 1 year
        }
        return timeframe_map.get(timeframe, 30)
    
    def _prepare_timeline_data(self, metrics):
        """Prepare timeline data for charts"""
        return [
            {
                'date': metric.date.isoformat(),
                'pages_shot': float(metric.pages_shot),
                'efficiency_score': metric.efficiency_score,
                'scenes_completed': metric.scenes_completed,
                'shoot_ratio': float(metric.shoot_ratio) if metric.shoot_ratio else None,
                'cost_per_page': float(metric.cost_per_page) if metric.cost_per_page else None
            }
            for metric in metrics
        ]

class MetricsCalculationViewSet(viewsets.ViewSet):
    """Endpoints for metrics calculation and updates"""
    
    @action(detail=False, methods=['post'])
    def calculate_daily_metrics(self, request):
        """Calculate metrics for a specific date"""
        production_id = request.data.get('production_id')
        target_date = request.data.get('date', timezone.now().date())
        
        if isinstance(target_date, str):
            target_date = date.fromisoformat(target_date)
        
        metrics = ProductionMetrics.calculate_for_date(
            production_id=production_id,
            date=target_date
        )
        
        if metrics:
            return Response({
                'status': 'calculated',
                'date': target_date,
                'metrics': {
                    'pages_shot': float(metrics.pages_shot),
                    'efficiency_score': metrics.efficiency_score,
                    'scenes_completed': metrics.scenes_completed
                }
            })
        else:
            return Response({
                'status': 'no_data',
                'date': target_date
            })
    
    @action(detail=False, methods=['post'])
    def recalculate_all(self, request):
        """Recalculate all metrics for a production"""
        production_id = request.data.get('production_id')
        
        # This would typically be a background task
        analytics_engine = AnalyticsEngine(production_id)
        result = analytics_engine.recalculate_all_metrics()
        
        return Response({
            'status': 'recalculated',
            'metrics_updated': result['count'],
            'date_range': result['date_range']
        })