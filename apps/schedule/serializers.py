# apps/schedule/serializers.py
from rest_framework import serializers
from django.db import transaction
from django.utils import timezone
from datetime import datetime, timedelta
from .models import (
    ShootingDay, SceneSchedule, DayBreak, StatusUpdate,
    ProductionCalendar, ScheduleChange, ScheduleTemplate
)
from apps.production.serializers import SceneListSerializer, LocationSerializer

class DayBreakSerializer(serializers.ModelSerializer):
    class Meta:
        model = DayBreak
        fields = '__all__'

class SceneScheduleListSerializer(serializers.ModelSerializer):
    scene_number = serializers.CharField(source='scene.scene_number', read_only=True)
    location_name = serializers.CharField(source='scene.location.name', read_only=True)
    estimated_pages = serializers.DecimalField(
        source='scene.estimated_pages', 
        max_digits=5, 
        decimal_places=2, 
        read_only=True
    )
    int_ext = serializers.CharField(source='scene.int_ext', read_only=True)
    time_of_day = serializers.CharField(source='scene.time_of_day', read_only=True)
    estimated_end = serializers.TimeField(read_only=True)
    
    class Meta:
        model = SceneSchedule
        fields = [
            'id', 'scene_number', 'location_name', 'int_ext', 'time_of_day',
            'estimated_pages', 'estimated_start', 'estimated_duration', 
            'estimated_end', 'day_order', 'status'
        ]

class SceneScheduleDetailSerializer(serializers.ModelSerializer):
    scene = SceneListSerializer(read_only=True)
    scene_id = serializers.UUIDField(write_only=True)
    estimated_end = serializers.TimeField(read_only=True)
    
    class Meta:
        model = SceneSchedule
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, data):
        # Validate no double booking
        shooting_day = data.get('shooting_day') or self.instance.shooting_day
        scene_id = data.get('scene_id') or self.instance.scene_id
        
        qs = SceneSchedule.objects.filter(
            shooting_day=shooting_day,
            scene_id=scene_id
        )
        
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        
        if qs.exists():
            raise serializers.ValidationError(
                "This scene is already scheduled for this day"
            )
        
        return data

class ShootingDayListSerializer(serializers.ModelSerializer):
    location_name = serializers.CharField(source='primary_location.name', read_only=True)
    scenes_count = serializers.IntegerField(read_only=True)
    total_pages = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    
    class Meta:
        model = ShootingDay
        fields = [
            'id', 'day_number', 'date', 'status', 'day_type',
            'crew_call', 'shooting_call', 'estimated_wrap',
            'location_name', 'scenes_count', 'total_pages'
        ]

class ShootingDayDetailSerializer(serializers.ModelSerializer):
    scheduled_scenes = SceneScheduleListSerializer(many=True, read_only=True)
    breaks = DayBreakSerializer(many=True, read_only=True)
    primary_location = LocationSerializer(read_only=True)
    scenes_count = serializers.IntegerField(read_only=True)
    total_pages = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    
    class Meta:
        model = ShootingDay
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']

class ShootingDayCreateSerializer(serializers.ModelSerializer):
    scenes = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = ShootingDay
        fields = '__all__'
    
    def create(self, validated_data):
        scenes_data = validated_data.pop('scenes', [])
        
        with transaction.atomic():
            shooting_day = ShootingDay.objects.create(**validated_data)
            
            # Create scene schedules
            for order, scene_data in enumerate(scenes_data, 1):
                SceneSchedule.objects.create(
                    shooting_day=shooting_day,
                    day_order=order,
                    **scene_data
                )
        
        return shooting_day

class StatusUpdateSerializer(serializers.ModelSerializer):
    posted_by_name = serializers.CharField(source='posted_by.get_full_name', read_only=True)
    current_scene_number = serializers.CharField(source='current_scene.scene_number', read_only=True)
    
    class Meta:
        model = StatusUpdate
        fields = '__all__'
        read_only_fields = ['id', 'timestamp', 'posted_by']
    
    def create(self, validated_data):
        validated_data['posted_by'] = self.context['request'].user
        return super().create(validated_data)

class ProductionCalendarSerializer(serializers.ModelSerializer):
    total_shooting_days = serializers.SerializerMethodField()
    work_days = serializers.ListField(read_only=True)
    
    class Meta:
        model = ProductionCalendar
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_total_shooting_days(self, obj):
        # Calculate working days between principal start and end
        current = obj.principal_start
        count = 0
        while current <= obj.principal_end:
            if obj.is_work_day(current):
                count += 1
            current += timedelta(days=1)
        return count

class ScheduleChangeSerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.get_full_name', read_only=True)
    scene_number = serializers.CharField(source='scene.scene_number', read_only=True)
    day_info = serializers.SerializerMethodField()
    
    class Meta:
        model = ScheduleChange
        fields = '__all__'
        read_only_fields = ['id', 'changed_at', 'changed_by', 'notified_at']
    
    def get_day_info(self, obj):
        if obj.shooting_day:
            return f"Day {obj.shooting_day.day_number} - {obj.shooting_day.date}"
        return None

class ScheduleTemplateSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = ScheduleTemplate
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'created_by']

class ScheduleOptimizationSerializer(serializers.Serializer):
    """Request schedule optimization"""
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    scenes = serializers.ListField(
        child=serializers.UUIDField(),
        help_text="List of scene IDs to schedule"
    )
    constraints = serializers.DictField(
        required=False,
        help_text="Optimization constraints"
    )
    
    def validate(self, data):
        if data['end_date'] < data['start_date']:
            raise serializers.ValidationError("End date must be after start date")
        return data

class DragDropScheduleSerializer(serializers.Serializer):
    """Handle drag and drop scene scheduling"""
    scene_id = serializers.UUIDField()
    from_day_id = serializers.UUIDField(required=False)
    to_day_id = serializers.UUIDField()
    position = serializers.IntegerField(min_value=1)
    
    def validate(self, data):
        # Validate scene exists
        from apps.production.models import Scene
        try:
            Scene.objects.get(id=data['scene_id'])
        except Scene.DoesNotExist:
            raise serializers.ValidationError("Scene not found")
        
        # Validate days exist
        try:
            ShootingDay.objects.get(id=data['to_day_id'])
        except ShootingDay.DoesNotExist:
            raise serializers.ValidationError("Target day not found")
        
        if data.get('from_day_id'):
            try:
                ShootingDay.objects.get(id=data['from_day_id'])
            except ShootingDay.DoesNotExist:
                raise serializers.ValidationError("Source day not found")
        
        return data

class ScheduleConflictSerializer(serializers.Serializer):
    """Check for scheduling conflicts"""
    date = serializers.DateField()
    scenes = serializers.ListField(child=serializers.UUIDField())
    
    def validate_scenes(self, value):
        from apps.production.models import Scene
        if not Scene.objects.filter(id__in=value).count() == len(value):
            raise serializers.ValidationError("One or more scenes not found")
        return value

class BatchScheduleUpdateSerializer(serializers.Serializer):
    """Batch update multiple schedule entries"""
    updates = serializers.ListField(
        child=serializers.DictField(),
        help_text="List of schedule updates"
    )
    
    def validate_updates(self, value):
        for update in value:
            if 'id' not in update:
                raise serializers.ValidationError("Each update must include an id")
        return value

class ScheduleReportSerializer(serializers.Serializer):
    """Generate schedule reports"""
    report_type = serializers.ChoiceField(choices=[
        ('one_liner', 'One Liner'),
        ('day_out_of_days', 'Day Out of Days'),
        ('cast_list', 'Cast List'),
        ('location_list', 'Location List'),
        ('strips', 'Production Strips')
    ])
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
    format = serializers.ChoiceField(
        choices=[('pdf', 'PDF'), ('excel', 'Excel'), ('csv', 'CSV')],
        default='pdf'
    )