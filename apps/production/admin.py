from django.contrib import admin
from .models import Production, Location, Scene, Shot, Take

@admin.register(Production)
class ProductionAdmin(admin.ModelAdmin):
    list_display = ['title', 'director', 'status', 'start_date', 'end_date']
    list_filter = ['status', 'start_date']
    search_fields = ['title', 'director', 'producer']

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ['name', 'production', 'contact_person']
    list_filter = ['production']
    search_fields = ['name', 'address']

@admin.register(Scene)
class SceneAdmin(admin.ModelAdmin):
    list_display = ['scene_number', 'production', 'int_ext', 'location', 'time_of_day', 'status']
    list_filter = ['production', 'int_ext', 'time_of_day', 'status']
    search_fields = ['scene_number', 'description']

@admin.register(Shot)
class ShotAdmin(admin.ModelAdmin):
    list_display = ['scene', 'shot_number', 'shot_type', 'status', 'takes_completed', 'takes_good']
    list_filter = ['scene__production', 'shot_type', 'status']

@admin.register(Take)
class TakeAdmin(admin.ModelAdmin):
    list_display = ['shot', 'take_number', 'result', 'recorded_at']
    list_filter = ['result', 'recorded_at']