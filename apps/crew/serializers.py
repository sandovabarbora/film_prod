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
    secondary_positions = PositionSerializer(many=True, read_only=True)
    current_assignments = serializers.SerializerMethodField()
    display_name = serializers.CharField(read_only=True)
    full_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = CrewMember
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_current_assignments(self, obj):
        assignments = obj.assignments.filter(
            status__in=['confirmed', 'tentative']
        ).select_related('production')[:5]
        return CrewAssignmentListSerializer(assignments, many=True).data

class CrewMemberCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer pro vytváření a aktualizaci crew memberů"""
    primary_position_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    primary_position = PositionSerializer(read_only=True)
    
    # Availability fields
    available_from = serializers.DateField(required=False, allow_null=True)
    available_to = serializers.DateField(required=False, allow_null=True)
    
    class Meta:
        model = CrewMember
        fields = [
            'id', 'first_name', 'last_name', 'preferred_name', 'email',
            'phone_primary', 'phone_secondary', 
            'emergency_contact_name', 'emergency_contact_phone',
            'primary_position', 'primary_position_id',
            'daily_rate', 'union_member', 'union_number',
            'has_vehicle', 'dietary_restrictions', 'shirt_size',
            'status', 'notes', 'available_from', 'available_to',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        primary_position_id = validated_data.pop('primary_position_id', None)
        available_from = validated_data.pop('available_from', None)
        available_to = validated_data.pop('available_to', None)
        
        crew_member = CrewMember.objects.create(**validated_data)
        
        if primary_position_id:
            try:
                position = Position.objects.get(id=primary_position_id)
                crew_member.primary_position = position
                crew_member.save()
            except Position.DoesNotExist:
                pass
        
        # Note: available_from/available_to by se měly implementovat jako separate model
        # Pro teď je ignorujeme, ale struktura je připravená
        
        return crew_member
    
    def update(self, instance, validated_data):
        primary_position_id = validated_data.pop('primary_position_id', None)
        available_from = validated_data.pop('available_from', None)
        available_to = validated_data.pop('available_to', None)
        
        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update position if provided
        if primary_position_id:
            try:
                position = Position.objects.get(id=primary_position_id)
                instance.primary_position = position
            except Position.DoesNotExist:
                pass
        
        instance.save()
        return instance

    def validate_email(self, value):
        """Check if email is unique"""
        if self.instance and self.instance.email == value:
            return value
        
        if CrewMember.objects.filter(email=value).exists():
            raise serializers.ValidationError("Crew member with this email already exists.")
        
        return value

    def validate(self, data):
        """Cross-field validation"""
        available_from = data.get('available_from')
        available_to = data.get('available_to')
        
        if available_from and available_to and available_from > available_to:
            raise serializers.ValidationError({
                'available_to': 'End date must be after start date.'
            })
        
        return data

class CrewAssignmentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for lists"""
    crew_member_name = serializers.CharField(source='crew_member.display_name', read_only=True)
    production_title = serializers.CharField(source='production.title', read_only=True)
    position_title = serializers.CharField(source='position.title', read_only=True)
    department = serializers.CharField(source='position.department.name', read_only=True)
    
    class Meta:
        model = CrewAssignment
        fields = [
            'id', 'crew_member_name', 'production_title', 'position_title',
            'department', 'start_date', 'end_date', 'daily_rate', 'status'
        ]

class CrewAssignmentDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer with all info"""
    crew_member = CrewMemberListSerializer(read_only=True)
    position = PositionSerializer(read_only=True)
    
    class Meta:
        model = CrewAssignment
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

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

class CallSheetDetailSerializer(serializers.ModelSerializer):
    crew_calls = serializers.SerializerMethodField()
    
    class Meta:
        model = CallSheet
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_crew_calls(self, obj):
        calls = obj.crew_calls.select_related('crew_member').all()
        return CrewCallSerializer(calls, many=True).data

class CallSheetCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CallSheet
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class CrewCallSerializer(serializers.ModelSerializer):
    crew_member_name = serializers.CharField(source='crew_member.display_name', read_only=True)
    
    class Meta:
        model = CrewCall
        fields = '__all__'

class CharacterSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.display_name', read_only=True)
    
    class Meta:
        model = Character
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

# Additional utility serializers
class CrewAvailabilitySerializer(serializers.Serializer):
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    position_id = serializers.UUIDField(required=False)
    department_id = serializers.IntegerField(required=False)
    
    def validate(self, data):
        if data['start_date'] > data['end_date']:
            raise serializers.ValidationError("End date must be after start date")
        return data

class CrewBulkImportSerializer(serializers.Serializer):
    file = serializers.FileField()
    update_existing = serializers.BooleanField(default=False)
    
    def validate_file(self, value):
        if not value.name.endswith(('.csv', '.xlsx', '.xls')):
            raise serializers.ValidationError("File must be CSV or Excel format")
        return value