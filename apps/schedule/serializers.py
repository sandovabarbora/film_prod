from rest_framework import serializers
from django.db import transaction
from django.utils import timezone
from datetime import datetime, timedelta
from .models import (
    ShootingDay, SceneSchedule, DayBreak, StatusUpdate,
    ProductionCalendar, ScheduleChange
)

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
    scene_number = serializers.CharField(source='scene.scene_number', read_only=True)
    scene_description = serializers.CharField(source='scene.description', read_only=True)
    location_name = serializers.CharField(source='scene.location.name', read_only=True)
    estimated_end = serializers.TimeField(read_only=True)
    
    class Meta:
        model = SceneSchedule
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class ShootingDayListSerializer(serializers.ModelSerializer):
    production_title = serializers.CharField(source='production.title', read_only=True)
    location_name = serializers.CharField(source='primary_location.name', read_only=True)
    total_scenes = serializers.ReadOnlyField()
    total_pages = serializers.ReadOnlyField()
    
    class Meta:
        model = ShootingDay
        fields = [
            'id', 'production_title', 'day_number', 'shoot_date',
            'general_call', 'shooting_call', 'location_name',
            'total_scenes', 'total_pages', 'status'
        ]

class ShootingDayDetailSerializer(serializers.ModelSerializer):
    scene_schedules = SceneScheduleListSerializer(many=True, read_only=True)
    breaks = DayBreakSerializer(many=True, read_only=True)
    production_title = serializers.CharField(source='production.title', read_only=True)
    location_name = serializers.CharField(source='primary_location.name', read_only=True)
    
    # Add scenes for creation
    scenes = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = ShootingDay
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
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
    shooting_day_number = serializers.IntegerField(source='shooting_day.day_number', read_only=True)
    
    class Meta:
        model = ScheduleChange
        fields = '__all__'
        read_only_fields = ['id', 'changed_at']