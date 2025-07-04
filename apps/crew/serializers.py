# apps/crew/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Department, Position, CrewMember, CrewAssignment,
    CallSheet, CrewCall, Character
)

class DepartmentSerializer(serializers.ModelSerializer):
    positions_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Department
        fields = '__all__'
    
    def get_positions_count(self, obj):
        return obj.positions.count()

class PositionSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = Position
        fields = '__all__'

class CrewMemberListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for lists"""
    primary_position_title = serializers.CharField(source='primary_position.title', read_only=True)
    department = serializers.CharField(source='primary_position.department.name', read_only=True)
    
    class Meta:
        model = CrewMember
        fields = [
            'id', 'display_name', 'email', 'phone_primary',
            'primary_position_title', 'department', 'status'
        ]

class CrewMemberDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer with all info"""
    primary_position = PositionSerializer(read_only=True)
    primary_position_id = serializers.UUIDField(write_only=True, required=False)
    secondary_positions = PositionSerializer(many=True, read_only=True)
    secondary_position_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )
    current_assignments = serializers.SerializerMethodField()
    
    class Meta:
        model = CrewMember
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_current_assignments(self, obj):
        active = obj.assignments.filter(
            status__in=['confirmed', 'pending', 'tentative']
        ).select_related('production', 'position')
        return CrewAssignmentListSerializer(active, many=True).data
    
    def create(self, validated_data):
        position_id = validated_data.pop('primary_position_id', None)
        secondary_ids = validated_data.pop('secondary_position_ids', [])
        
        crew_member = CrewMember.objects.create(**validated_data)
        
        if position_id:
            crew_member.primary_position_id = position_id
            crew_member.save()
        
        if secondary_ids:
            crew_member.secondary_positions.set(secondary_ids)
        
        return crew_member
    
    def update(self, instance, validated_data):
        position_id = validated_data.pop('primary_position_id', None)
        secondary_ids = validated_data.pop('secondary_position_ids', None)
        
        if position_id:
            validated_data['primary_position_id'] = position_id
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if secondary_ids is not None:
            instance.secondary_positions.set(secondary_ids)
        
        return instance

class CrewAssignmentListSerializer(serializers.ModelSerializer):
    crew_member_name = serializers.CharField(source='crew_member.display_name', read_only=True)
    position_title = serializers.CharField(source='position.title', read_only=True)
    department = serializers.CharField(source='position.department.name', read_only=True)
    production_title = serializers.CharField(source='production.title', read_only=True)
    
    class Meta:
        model = CrewAssignment
        fields = [
            'id', 'crew_member_name', 'position_title', 'department',
            'production_title', 'start_date', 'end_date', 'status', 'daily_rate'
        ]

class CrewAssignmentDetailSerializer(serializers.ModelSerializer):
    crew_member = CrewMemberListSerializer(read_only=True)
    crew_member_id = serializers.UUIDField(write_only=True)
    position = PositionSerializer(read_only=True)
    position_id = serializers.IntegerField(write_only=True)
    days_worked = serializers.SerializerMethodField()
    total_earned = serializers.SerializerMethodField()
    
    class Meta:
        model = CrewAssignment
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_days_worked(self, obj):
        # This would connect to schedule/timesheet data
        return 0
    
    def get_total_earned(self, obj):
        days = self.get_days_worked(obj)
        return float(obj.daily_rate * days) if obj.daily_rate else 0
    
    def validate(self, data):
        # Check for conflicts
        crew_member_id = data.get('crew_member_id') or self.instance.crew_member_id
        production_id = data.get('production') or self.instance.production
        position_id = data.get('position_id') or self.instance.position_id
        
        # Validate no duplicate assignments
        qs = CrewAssignment.objects.filter(
            crew_member_id=crew_member_id,
            production=production_id,
            position_id=position_id
        )
        
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        
        if qs.exists():
            raise serializers.ValidationError(
                "This crew member already has this position on this production"
            )
        
        return data

class CallSheetListSerializer(serializers.ModelSerializer):
    production_title = serializers.CharField(source='production.title', read_only=True)
    crew_count = serializers.SerializerMethodField()
    
    class Meta:
        model = CallSheet
        fields = [
            'id', 'production_title', 'shooting_day', 'date',
            'general_call_time', 'status', 'crew_count'
        ]
    
    def get_crew_count(self, obj):
        return obj.crew_calls.count()

class CrewCallSerializer(serializers.ModelSerializer):
    crew_member_name = serializers.CharField(source='crew_member.display_name', read_only=True)
    position = serializers.CharField(source='crew_member.primary_position.title', read_only=True)
    department = serializers.CharField(source='crew_member.primary_position.department.name', read_only=True)
    phone = serializers.CharField(source='crew_member.phone_primary', read_only=True)
    
    class Meta:
        model = CrewCall
        fields = '__all__'

class CallSheetDetailSerializer(serializers.ModelSerializer):
    crew_calls = CrewCallSerializer(many=True, read_only=True)
    scenes_scheduled = serializers.SerializerMethodField()
    total_pages = serializers.SerializerMethodField()
    
    class Meta:
        model = CallSheet
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_scenes_scheduled(self, obj):
        # This would connect to schedule data
        return []
    
    def get_total_pages(self, obj):
        # Calculate from scheduled scenes
        return 0

class CallSheetCreateSerializer(serializers.ModelSerializer):
    """Special serializer for creating call sheets with crew calls"""
    crew_calls = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = CallSheet
        fields = '__all__'
    
    def create(self, validated_data):
        crew_calls_data = validated_data.pop('crew_calls', [])
        call_sheet = CallSheet.objects.create(**validated_data)
        
        # Create crew calls
        for call_data in crew_calls_data:
            CrewCall.objects.create(
                call_sheet=call_sheet,
                **call_data
            )
        
        return call_sheet

class CharacterSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.display_name', read_only=True)
    scenes = serializers.SerializerMethodField()
    
    class Meta:
        model = Character
        fields = '__all__'
    
    def get_scenes(self, obj):
        # Get scenes where this character appears
        return obj.scene_set.values_list('scene_number', flat=True)

class CrewAvailabilitySerializer(serializers.Serializer):
    """Check crew availability for date range"""
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    position_id = serializers.IntegerField(required=False)
    department_id = serializers.IntegerField(required=False)
    
    def validate(self, data):
        if data['end_date'] < data['start_date']:
            raise serializers.ValidationError("End date must be after start date")
        return data

class CrewBulkImportSerializer(serializers.Serializer):
    """Bulk import crew from CSV/Excel"""
    file = serializers.FileField()
    update_existing = serializers.BooleanField(default=False)
    
    def validate_file(self, value):
        if not value.name.endswith(('.csv', '.xlsx', '.xls')):
            raise serializers.ValidationError("File must be CSV or Excel format")
        return value