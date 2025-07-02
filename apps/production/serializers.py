from rest_framework import serializers
from .models import Production, Location, Scene, Shot, Take

class ProductionListSerializer(serializers.ModelSerializer):
    """Lightweight serializer pro seznam produkcí"""
    scenes_count = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Production
        fields = ['id', 'title', 'director', 'producer', 'status', 'start_date', 
                 'end_date', 'scenes_count', 'completion_percentage', 'created_at']
    
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
        fields = '__all__'
    
    def get_total_scenes(self, obj):
        return obj.scenes.count()
    
    def get_completed_scenes(self, obj):
        return obj.scenes.filter(status='completed').count()
    
    def get_total_shots(self, obj):
        return Shot.objects.filter(scene__production=obj).count()
    
    def get_completed_shots(self, obj):
        return Shot.objects.filter(scene__production=obj, status='completed').count()
    
    def get_total_pages(self, obj):
        return sum(scene.estimated_pages for scene in obj.scenes.all())

class LiveDashboardSerializer(serializers.Serializer):
    """Real-time dashboard data"""
    production_id = serializers.UUIDField()
    current_scene = serializers.CharField(allow_blank=True)
    current_shot = serializers.CharField(allow_blank=True)
    current_status = serializers.CharField()
    
    # Progress today
    scenes_completed_today = serializers.IntegerField()
    shots_completed_today = serializers.IntegerField()
    pages_shot_today = serializers.DecimalField(max_digits=5, decimal_places=2)
    
    # Timing
    day_start = serializers.TimeField()
    current_time = serializers.TimeField()
    estimated_wrap = serializers.TimeField()
    behind_schedule_minutes = serializers.IntegerField()
    
    # Next up
    next_scene = serializers.CharField(allow_blank=True)
    next_estimated_time = serializers.TimeField(allow_null=True)
    
    # Weather
    current_temperature = serializers.IntegerField(allow_null=True)
    weather_description = serializers.CharField(allow_blank=True)
    
    # Crew status
    crew_on_set = serializers.IntegerField()
    crew_total = serializers.IntegerField()