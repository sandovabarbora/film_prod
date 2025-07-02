from django.contrib import admin
from .models import Department, CrewMember, Character, CrewAvailability, EquipmentItem

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'color_code']

@admin.register(CrewMember)
class CrewMemberAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'position', 'department', 'production', 'is_active']
    list_filter = ['department', 'production', 'role_level', 'is_active']
    search_fields = ['first_name', 'last_name', 'position', 'email']

@admin.register(Character)
class CharacterAdmin(admin.ModelAdmin):
    list_display = ['name', 'production', 'actor']
    list_filter = ['production']
    search_fields = ['name', 'description']

@admin.register(CrewAvailability)
class CrewAvailabilityAdmin(admin.ModelAdmin):
    list_display = ['crew_member', 'date', 'status']
    list_filter = ['status', 'date']

@admin.register(EquipmentItem)
class EquipmentItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'production', 'status', 'assigned_to']
    list_filter = ['category', 'status', 'production']
    search_fields = ['name', 'serial_number']