from rest_framework import serializers
from .models import Production, Location, Scene, Shot, Take

class ProductionListSerializer(serializers.ModelSerializer):
    """Lightweight serializer pro seznam produkcí"""
    scenes_count = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Production
        fields = ['id', 'title', 'director', 'producer', 'status', 'start_date', 
                 'end_date', 'budget', 'location_primary', 'scenes_count', 
                 'completion_percentage', 'created_at']
    
    def get_scenes_count(self, obj):
        return obj.scenes.count()
    
    def get_completion_percentage(self, obj):
        total_scenes = obj.scenes.count()
        if total_scenes == 0:
            return 0
        completed_scenes = obj.scenes.filter(status='completed').count()
        return round((completed_scenes / total_scenes) * 100, 1)

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'

class TakeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Take
        fields = '__all__'

class ShotDetailSerializer(serializers.ModelSerializer):
    takes = TakeSerializer(many=True, read_only=True)
    efficiency_ratio = serializers.ReadOnlyField()
    
    class Meta:
        model = Shot
        fields = '__all__'

class ShotListSerializer(serializers.ModelSerializer):
    """Lightweight pro lists"""
    efficiency_ratio = serializers.ReadOnlyField()
    
    class Meta:
        model = Shot
        fields = ['id', 'shot_number', 'shot_type', 'status', 'takes_planned', 
                 'takes_completed', 'takes_good', 'efficiency_ratio', 'created_at']

class SceneDetailSerializer(serializers.ModelSerializer):
    shots = ShotListSerializer(many=True, read_only=True)
    location = LocationSerializer(read_only=True)
    characters = serializers.StringRelatedField(many=True, read_only=True)
    
    class Meta:
        model = Scene
        fields = '__all__'

class SceneListSerializer(serializers.ModelSerializer):
    location_name = serializers.CharField(source='location.name', read_only=True)
    shots_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Scene
        fields = ['id', 'scene_number', 'int_ext', 'location_name', 'location_detail', 
                 'time_of_day', 'estimated_pages', 'status', 'shots_count']
    
    def get_shots_count(self, obj):
        return obj.shots.count()

class ProductionDetailSerializer(serializers.ModelSerializer):
    """Full serializer pro detail view s relationships"""
    locations = LocationSerializer(many=True, read_only=True)
    scenes = SceneListSerializer(many=True, read_only=True)
    
    # Dashboard statistics
    total_scenes = serializers.SerializerMethodField()
    completed_scenes = serializers.SerializerMethodField()
    total_shots = serializers.SerializerMethodField()
    completed_shots = serializers.SerializerMethodField()
    total_pages = serializers.SerializerMethodField()
    
    class Meta:
        model = Production
        fields = [
            'id', 'title', 'director', 'producer', 'status', 
            'start_date', 'end_date', 'budget', 'location_primary',
            'script_version', 'script_file', 'created_at', 'updated_at',
            'locations', 'scenes',
            'total_scenes', 'completed_scenes', 'total_shots', 
            'completed_shots', 'total_pages'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_total_scenes(self, obj):
        return obj.scenes.count()
    
    def get_completed_scenes(self, obj):
        return obj.scenes.filter(status='completed').count()
    
    def get_total_shots(self, obj):
        return Shot.objects.filter(scene__production=obj).count()
    
    def get_completed_shots(self, obj):
        return Shot.objects.filter(scene__production=obj, status='completed').count()
    
    def get_total_pages(self, obj):
        return sum(scene.estimated_pages or 0 for scene in obj.scenes.all())

class ProductionCreateUpdateSerializer(serializers.ModelSerializer):
    """Simplified serializer pro CREATE/UPDATE - podporuje crew_ids"""
    
    # 🎯 Crew support - přijme crew_ids ale neuloží je přímo (pro future implementation)
    crew_ids = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        write_only=True,
        help_text="List of crew member IDs to assign to production"
    )
    
    class Meta:
        model = Production
        fields = [
            'id', 'title', 'director', 'producer', 'status', 
            'start_date', 'end_date', 'budget', 'location_primary',
            'script_version', 'crew_ids'
        ]
        read_only_fields = ['id']
        
    def create(self, validated_data):
        # 🎯 Odstraníme crew_ids z validated_data (pro future crew assignment)
        crew_ids = validated_data.pop('crew_ids', [])
        
        # Pokud není zadán director/producer, použijeme defaults
        if not validated_data.get('director'):
            validated_data['director'] = 'TBD'
        if not validated_data.get('producer'):
            validated_data['producer'] = 'TBD'
            
        production = Production.objects.create(**validated_data)
        
        # 🎯 TODO: Implement crew assignment when crew app is ready
        if crew_ids:
            print(f"🎯 Future crew assignment: {crew_ids} to production {production.id}")
        
        # Pokud máme location_primary, vytvoříme Location záznam
        if validated_data.get('location_primary'):
            Location.objects.create(
                production=production,
                name=validated_data['location_primary'],
                address=validated_data['location_primary']
            )
        
        return production
    
    def update(self, instance, validated_data):
        # 🎯 Odstraníme crew_ids (pro future implementation)
        crew_ids = validated_data.pop('crew_ids', [])
        
        # Update production
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # 🎯 TODO: Update crew assignment
        if crew_ids:
            print(f"🎯 Future crew update: {crew_ids} for production {instance.id}")
        
        # Update primary location pokud zadána
        location_primary = validated_data.get('location_primary')
        if location_primary:
            primary_location, created = Location.objects.get_or_create(
                production=instance,
                name=location_primary,
                defaults={'address': location_primary}
            )
        
        return instance
