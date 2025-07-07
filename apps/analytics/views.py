from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Sum, Count, Q, Max, Min
from django.utils import timezone
from datetime import datetime, timedelta, date
from decimal import Decimal

from .models import (
    ProductionMetrics, CrewPerformance, BudgetTracking,
    ProgressReport, VelocityTrend
)
from .serializers import (
    ProductionMetricsSerializer, CrewPerformanceSerializer,
    BudgetTrackingSerializer, ProgressReportSerializer,
    VelocityTrendSerializer
)

class ProductionMetricsViewSet(viewsets.ModelViewSet):
    """Production metrics management"""
    queryset = ProductionMetrics.objects.select_related('production', 'shooting_day')
    serializer_class = ProductionMetricsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by production
        production_id = self.request.query_params.get('production')
        if production_id:
            queryset = queryset.filter(production_id=production_id)
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        
        return queryset.order_by('-date')
    
    @action(detail=False, methods=['get'])
    def dashboard_summary(self, request):
        """Get key metrics for dashboard"""
        production_id = request.query_params.get('production')
        if not production_id:
            return Response({'error': 'production_id required'}, status=400)
        
        # Get last 30 days of metrics
        thirty_days_ago = timezone.now().date() - timedelta(days=30)
        metrics = self.get_queryset().filter(
            production_id=production_id,
            date__gte=thirty_days_ago
        )
        
        if not metrics.exists():
            return Response({
                'message': 'No metrics data available',
                'total_shooting_days': 0,
                'average_efficiency': 0,
                'average_velocity': 0,
                'total_pages_shot': 0,
                'schedule_performance': 'no_data'
            })
        
        # Calculate aggregates
        totals = metrics.aggregate(
            total_days=Count('id'),
            avg_efficiency=Avg('efficiency_score'),
            avg_velocity=Avg('velocity_score'),
            total_pages=Sum('pages_shot'),
            avg_schedule_variance=Avg('schedule_variance_minutes'),
            total_scenes_completed=Sum('scenes_completed'),
            total_scenes_scheduled=Sum('scenes_scheduled')
        )
        
        # Schedule performance status
        avg_variance = totals['avg_schedule_variance'] or 0
        if avg_variance <= -30:
            schedule_status = 'ahead'
        elif avg_variance <= 30:
            schedule_status = 'on_time'
        else:
            schedule_status = 'behind'
        
        return Response({
            'total_shooting_days': totals['total_days'],
            'average_efficiency': round(totals['avg_efficiency'] or 0, 1),
            'average_velocity': round(totals['avg_velocity'] or 0, 2),
            'total_pages_shot': totals['total_pages'] or 0,
            'total_scenes_completed': totals['total_scenes_completed'] or 0,
            'total_scenes_scheduled': totals['total_scenes_scheduled'] or 0,
            'completion_rate': round(
                (totals['total_scenes_completed'] / totals['total_scenes_scheduled'] * 100) 
                if totals['total_scenes_scheduled'] > 0 else 0, 1
            ),
            'schedule_performance': schedule_status,
            'average_schedule_variance_minutes': round(avg_variance, 0)
        })

class CrewPerformanceViewSet(viewsets.ModelViewSet):
    """Crew performance tracking"""
    queryset = CrewPerformance.objects.select_related('production', 'crew_member')
    serializer_class = CrewPerformanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by production
        production_id = self.request.query_params.get('production')
        if production_id:
            queryset = queryset.filter(production_id=production_id)
        
        # Filter by crew member
        crew_member_id = self.request.query_params.get('crew_member')
        if crew_member_id:
            queryset = queryset.filter(crew_member_id=crew_member_id)
        
        return queryset.order_by('-date')

class BudgetTrackingViewSet(viewsets.ModelViewSet):
    """Budget tracking and analysis"""
    queryset = BudgetTracking.objects.select_related('production')
    serializer_class = BudgetTrackingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by production
        production_id = self.request.query_params.get('production')
        if production_id:
            queryset = queryset.filter(production_id=production_id)
        
        return queryset.order_by('-date')

class ProgressReportViewSet(viewsets.ModelViewSet):
    """Progress reports generation and management"""
    queryset = ProgressReport.objects.select_related('production', 'generated_by')
    serializer_class = ProgressReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by production
        production_id = self.request.query_params.get('production')
        if production_id:
            queryset = queryset.filter(production_id=production_id)
        
        return queryset.order_by('-period_end')

class VelocityTrendViewSet(viewsets.ModelViewSet):
    """Velocity trend analysis"""
    queryset = VelocityTrend.objects.select_related('production')
    serializer_class = VelocityTrendSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by production
        production_id = self.request.query_params.get('production')
        if production_id:
            queryset = queryset.filter(production_id=production_id)
        
        return queryset.order_by('-week_ending')

class AnalyticsDashboardViewSet(viewsets.ViewSet):
    """Main analytics dashboard endpoints"""
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def overview(self, request):
        """Complete dashboard overview"""
        production_id = request.query_params.get('production_id')
        if not production_id:
            return Response({'error': 'production_id required'}, status=400)
        
        # Simple overview for now
        return Response({
            'message': 'Analytics dashboard overview',
            'production_id': production_id,
            'status': 'active'
        })