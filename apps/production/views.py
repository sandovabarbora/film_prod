from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Count, Q
from .models import Production, Scene, Shot, Take, Location
from .serializers import (
    ProductionListSerializer, ProductionDetailSerializer,
    SceneListSerializer, SceneDetailSerializer,
    ShotListSerializer, ShotDetailSerializer,
    TakeSerializer, LocationSerializer,
    LiveDashboardSerializer
)

class ProductionViewSet(viewsets.ModelViewSet):
    queryset = Production.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProductionListSerializer
        return ProductionDetailSerializer
    
    @action(detail=True, methods=['get'])
    def dashboard(self, request, pk=None):
        """Live production dashboard data"""
        production = self.get_object()
        
        # Get today's shooting day
        today = timezone.now().date()
        try:
            from schedule.models import ShootingDay, StatusUpdate
            shooting_day = ShootingDay.objects.get(production=production, date=today)
            
            # Latest status update
            latest_status = StatusUpdate.objects.filter(
                production=production,
                shooting_day=shooting_day
            ).first()
            
            # Calculate progress
            scenes_today = shooting_day.scheduled_scenes.all()
            completed_scenes_today = scenes_today.filter(scene__status='completed').count()
            
            # Get all shots for today's scenes
            today_scene_ids = scenes_today.values_list('scene_id', flat=True)
            shots_today = Shot.objects.filter(scene_id__in=today_scene_ids)
            completed_shots_today = shots_today.filter(status='completed').count()
            
            pages_shot_today = sum(
                scene.scene.estimated_pages 
                for scene in scenes_today.filter(scene__status='completed')
            )
            
            # Next scene calculation
            next_scene_scheduled = scenes_today.filter(
                scene__status__in=['not_shot', 'in_progress']
            ).first()
            
            dashboard_data = {
                'production_id': production.id,
                'current_scene': latest_status.current_scene if latest_status else '',
                'current_shot': latest_status.current_shot if latest_status else '',
                'current_status': latest_status.current_status if latest_status else 'prep',
                'scenes_completed_today': completed_scenes_today,
                'shots_completed_today': completed_shots_today,
                'pages_shot_today': pages_shot_today,
                'day_start': shooting_day.crew_call,
                'current_time': timezone.now().time(),
                'estimated_wrap': shooting_day.estimated_wrap,
                'behind_schedule_minutes': latest_status.minutes_behind if latest_status else 0,
                'next_scene': next_scene_scheduled.scene.scene_number if next_scene_scheduled else '',
                'next_estimated_time': next_scene_scheduled.estimated_start_time if next_scene_scheduled else None,
                'current_temperature': None,  # TODO: Weather API integration
                'weather_description': '',
                'crew_on_set': 0,  # TODO: Check-in tracking
                'crew_total': production.crew.filter(is_active=True).count(),
            }
            
            serializer = LiveDashboardSerializer(dashboard_data)
            return Response(serializer.data)
            
        except ShootingDay.DoesNotExist:
            return Response(
                {'error': 'No shooting day scheduled for today'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update current production status"""
        production = self.get_object()
        data = request.data
        
        try:
            from schedule.models import ShootingDay, StatusUpdate
            from crew.models import CrewMember
            
            today = timezone.now().date()
            shooting_day = ShootingDay.objects.get(production=production, date=today)
            
            # Get crew member (in real app would be from auth)
            crew_member = production.crew.first()  # Simplified for MVP
            
            status_update = StatusUpdate.objects.create(
                production=production,
                shooting_day=shooting_day,
                updated_by=crew_member,
                current_scene=data.get('current_scene', ''),
                current_shot=data.get('current_shot', ''),
                current_status=data.get('current_status', 'prep'),
                estimated_next_shot=data.get('estimated_next_shot'),
                notes=data.get('notes', ''),
                minutes_behind=data.get('minutes_behind', 0)
            )
            
            # TODO: Send real-time notification via WebSocket
            
            return Response({'status': 'updated', 'id': status_update.id})
            
        except ShootingDay.DoesNotExist:
            return Response(
                {'error': 'No shooting day found for today'}, 
                status=status.HTTP_404_NOT_FOUND
            )

class SceneViewSet(viewsets.ModelViewSet):
    def get_serializer_class(self):
        if self.action == 'list':
            return SceneListSerializer
        return SceneDetailSerializer
    
    def get_queryset(self):
        queryset = Scene.objects.select_related('location', 'production')
        production_id = self.request.query_params.get('production')
        if production_id:
            queryset = queryset.filter(production_id=production_id)
        return queryset
    
    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        """Mark scene as completed"""
        scene = self.get_object()
        scene.status = 'completed'
        scene.save()
        
        # Auto-complete all shots in scene
        scene.shots.update(status='completed')
        
        return Response({'status': 'Scene marked as completed'})

class ShotViewSet(viewsets.ModelViewSet):
    def get_serializer_class(self):
        if self.action == 'list':
            return ShotListSerializer
        return ShotDetailSerializer
    
    def get_queryset(self):
        queryset = Shot.objects.select_related('scene')
        scene_id = self.request.query_params.get('scene')
        if scene_id:
            queryset = queryset.filter(scene_id=scene_id)
        return queryset
    
    @action(detail=True, methods=['post'])
    def add_take(self, request, pk=None):
        """Add a new take to shot"""
        shot = self.get_object()
        data = request.data
        
        # Get next take number
        last_take = shot.takes.order_by('-take_number').first()
        next_take_number = (last_take.take_number + 1) if last_take else 1
        
        take = Take.objects.create(
            shot=shot,
            take_number=next_take_number,
            result=data.get('result', 'ng'),
            director_notes=data.get('director_notes', ''),
            script_supervisor_notes=data.get('script_supervisor_notes', '')
        )
        
        # Update shot stats
        shot.takes_completed = shot.takes.count()
        shot.takes_good = shot.takes.filter(result__in=['good', 'print']).count()
        shot.save()
        
        serializer = TakeSerializer(take)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update shot status (setup, rehearsal, rolling, etc.)"""
        shot = self.get_object()
        new_status = request.data.get('status')
        
        if new_status in dict(Shot.STATUS_CHOICES):
            shot.status = new_status
            
            # Track timing
            if new_status == 'completed':
                shot.completed_at = timezone.now()
            
            shot.save()
            
            # TODO: Send WebSocket notification to production dashboard
            
            return Response({'status': f'Shot status updated to {new_status}'})
        
        return Response(
            {'error': 'Invalid status'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

class LocationViewSet(viewsets.ModelViewSet):
    serializer_class = LocationSerializer
    
    def get_queryset(self):
        queryset = Location.objects.all()
        production_id = self.request.query_params.get('production')
        if production_id:
            queryset = queryset.filter(production_id=production_id)
        return queryset

class TakeViewSet(viewsets.ModelViewSet):
    serializer_class = TakeSerializer
    
    def get_queryset(self):
        queryset = Take.objects.select_related('shot__scene')
        shot_id = self.request.query_params.get('shot')
        if shot_id:
            queryset = queryset.filter(shot_id=shot_id)
        return queryset