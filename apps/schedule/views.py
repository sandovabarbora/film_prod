from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count, Sum
from django.utils import timezone
from datetime import datetime, timedelta

from .models import (
    ShootingDay, SceneSchedule, DayBreak, StatusUpdate,
    ProductionCalendar, ScheduleChange
)
from .serializers import (
    ShootingDayListSerializer, ShootingDayDetailSerializer,
    SceneScheduleListSerializer, SceneScheduleDetailSerializer,
    DayBreakSerializer, StatusUpdateSerializer,
    ProductionCalendarSerializer, ScheduleChangeSerializer
)

class ShootingDayViewSet(viewsets.ModelViewSet):
    """Shooting days management"""
    queryset = ShootingDay.objects.select_related('production', 'primary_location').prefetch_related(
        'scene_schedules__scene', 'breaks', 'status_updates'
    )
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ShootingDayListSerializer
        return ShootingDayDetailSerializer
    
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
            queryset = queryset.filter(shoot_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(shoot_date__lte=date_to)
        
        # Filter by status
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        
        return queryset.order_by('shoot_date', 'day_number')
    
    @action(detail=True, methods=['post'])
    def start_day(self, request, pk=None):
        """Mark shooting day as started"""
        shooting_day = self.get_object()
        shooting_day.status = 'in_progress'
        shooting_day.save()
        
        # Create status update
        StatusUpdate.objects.create(
            production=shooting_day.production,
            shooting_day=shooting_day,
            update_type='day_start',
            message=f"Day {shooting_day.day_number} started",
            posted_by=request.user
        )
        
        return Response({'message': 'Day started'})
    
    @action(detail=True, methods=['post'])
    def wrap_day(self, request, pk=None):
        """Mark shooting day as wrapped"""
        shooting_day = self.get_object()
        shooting_day.status = 'completed'
        shooting_day.actual_wrap = timezone.now().time()
        shooting_day.save()
        
        # Create status update
        StatusUpdate.objects.create(
            production=shooting_day.production,
            shooting_day=shooting_day,
            update_type='wrap',
            message=f"That's a wrap on Day {shooting_day.day_number}!",
            posted_by=request.user
        )
        
        return Response({'message': 'Day wrapped'})
    
    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        """Get day progress statistics"""
        shooting_day = self.get_object()
        scene_schedules = shooting_day.scene_schedules.all()
        
        total_scenes = scene_schedules.count()
        completed_scenes = scene_schedules.filter(status='completed').count()
        in_progress_scenes = scene_schedules.filter(status='shooting').count()
        
        total_pages = sum(ss.scene.estimated_pages or 0 for ss in scene_schedules)
        completed_pages = sum(
            ss.scene.estimated_pages or 0 
            for ss in scene_schedules.filter(status='completed')
        )
        
        return Response({
            'total_scenes': total_scenes,
            'completed_scenes': completed_scenes,
            'in_progress_scenes': in_progress_scenes,
            'scenes_remaining': total_scenes - completed_scenes,
            'total_pages': total_pages,
            'completed_pages': completed_pages,
            'pages_remaining': total_pages - completed_pages,
            'completion_percentage': (completed_scenes / total_scenes * 100) if total_scenes > 0 else 0
        })

class SceneScheduleViewSet(viewsets.ModelViewSet):
    """Scene scheduling management"""
    queryset = SceneSchedule.objects.select_related(
        'shooting_day__production', 'scene__location'
    )
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return SceneScheduleListSerializer
        return SceneScheduleDetailSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by shooting day
        shooting_day_id = self.request.query_params.get('shooting_day')
        if shooting_day_id:
            queryset = queryset.filter(shooting_day_id=shooting_day_id)
        
        # Filter by production
        production_id = self.request.query_params.get('production')
        if production_id:
            queryset = queryset.filter(shooting_day__production_id=production_id)
        
        return queryset.order_by('shooting_day__shoot_date', 'day_order')
    
    @action(detail=True, methods=['post'])
    def start_scene(self, request, pk=None):
        """Mark scene as started"""
        scene_schedule = self.get_object()
        scene_schedule.status = 'shooting'
        scene_schedule.actual_start = timezone.now().time()
        scene_schedule.save()
        
        return Response({'message': f'Scene {scene_schedule.scene.scene_number} started'})
    
    @action(detail=True, methods=['post'])
    def complete_scene(self, request, pk=None):
        """Mark scene as completed"""
        scene_schedule = self.get_object()
        scene_schedule.status = 'completed'
        scene_schedule.actual_end = timezone.now().time()
        scene_schedule.completion_notes = request.data.get('notes', '')
        scene_schedule.save()
        
        return Response({'message': f'Scene {scene_schedule.scene.scene_number} completed'})

class StatusUpdateViewSet(viewsets.ModelViewSet):
    """Real-time status updates"""
    queryset = StatusUpdate.objects.select_related(
        'production', 'shooting_day', 'current_scene', 'posted_by'
    )
    serializer_class = StatusUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by production
        production_id = self.request.query_params.get('production')
        if production_id:
            queryset = queryset.filter(production_id=production_id)
        
        # Filter by shooting day
        shooting_day_id = self.request.query_params.get('shooting_day')
        if shooting_day_id:
            queryset = queryset.filter(shooting_day_id=shooting_day_id)
        
        # Recent updates only
        hours_back = self.request.query_params.get('hours_back', 24)
        time_threshold = timezone.now() - timedelta(hours=int(hours_back))
        queryset = queryset.filter(timestamp__gte=time_threshold)
        
        return queryset.order_by('-timestamp')
    
    def perform_create(self, serializer):
        serializer.save(posted_by=self.request.user)

class ProductionCalendarViewSet(viewsets.ModelViewSet):
    """Production calendar management"""
    queryset = ProductionCalendar.objects.select_related('production')
    serializer_class = ProductionCalendarSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by production
        production_id = self.request.query_params.get('production')
        if production_id:
            queryset = queryset.filter(production_id=production_id)
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def schedule_overview(self, request, pk=None):
        """Get overall schedule overview"""
        calendar = self.get_object()
        production = calendar.production
        
        # Get shooting days
        shooting_days = production.shooting_days.all()
        total_days = shooting_days.count()
        completed_days = shooting_days.filter(status='completed').count()
        
        # Calculate progress
        today = timezone.now().date()
        days_elapsed = max(0, (today - calendar.principal_start).days)
        total_production_days = (calendar.principal_end - calendar.principal_start).days
        
        return Response({
            'total_shooting_days': total_days,
            'completed_days': completed_days,
            'remaining_days': total_days - completed_days,
            'days_elapsed': days_elapsed,
            'total_production_days': total_production_days,
            'schedule_progress': (completed_days / total_days * 100) if total_days > 0 else 0,
            'calendar_progress': (days_elapsed / total_production_days * 100) if total_production_days > 0 else 0,
            'on_schedule': completed_days >= (days_elapsed * total_days / total_production_days) if total_production_days > 0 else True
        })

class DayBreakViewSet(viewsets.ModelViewSet):
    """Day breaks management"""
    queryset = DayBreak.objects.select_related('shooting_day')
    serializer_class = DayBreakSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by shooting day
        shooting_day_id = self.request.query_params.get('shooting_day')
        if shooting_day_id:
            queryset = queryset.filter(shooting_day_id=shooting_day_id)
        
        return queryset.order_by('scheduled_start')

class ScheduleChangeViewSet(viewsets.ReadOnlyModelViewSet):
    """Schedule change audit trail"""
    queryset = ScheduleChange.objects.select_related(
        'production', 'shooting_day', 'scene', 'changed_by'
    )
    serializer_class = ScheduleChangeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by production
        production_id = self.request.query_params.get('production')
        if production_id:
            queryset = queryset.filter(production_id=production_id)
        
        return queryset.order_by('-changed_at')