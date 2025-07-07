from django.contrib import admin
from .models import (
    Department, Position, CrewMember, CrewAssignment, 
    CallSheet, CrewCall, Character
)

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'abbreviation', 'color_code', 'sort_order']
    list_editable = ['sort_order']
    ordering = ['sort_order']

@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = ['title', 'department', 'level', 'daily_rate_min', 'daily_rate_max']
    list_filter = ['department', 'level', 'requires_certification']
    search_fields = ['title']

@admin.register(CrewMember)
class CrewMemberAdmin(admin.ModelAdmin):
    list_display = ['display_name', 'email', 'primary_position', 'phone_primary', 'status']
    list_filter = ['primary_position__department', 'status', 'union_member']
    search_fields = ['first_name', 'last_name', 'email', 'phone_primary']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Personal Info', {
            'fields': ('first_name', 'last_name', 'preferred_name', 'email')
        }),
        ('Contact Info', {
            'fields': ('phone_primary', 'phone_secondary', 'emergency_contact_name', 'emergency_contact_phone')
        }),
        ('Professional Info', {
            'fields': ('primary_position', 'secondary_positions', 'union_member', 'union_number', 'daily_rate')
        }),
        ('Logistics', {
            'fields': ('has_vehicle', 'dietary_restrictions', 'shirt_size')
        }),
        ('Status', {
            'fields': ('status', 'notes', 'created_at', 'updated_at')
        }),
    )

@admin.register(CrewAssignment)
class CrewAssignmentAdmin(admin.ModelAdmin):
    list_display = ['crew_member', 'production', 'position', 'status', 'start_date', 'daily_rate']
    list_filter = ['status', 'production', 'position__department']
    search_fields = ['crew_member__first_name', 'crew_member__last_name', 'production__title']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(CallSheet)
class CallSheetAdmin(admin.ModelAdmin):
    list_display = ['production', 'shooting_day', 'date', 'general_call_time', 'status']
    list_filter = ['production', 'status', 'date']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(CrewCall)
class CrewCallAdmin(admin.ModelAdmin):
    list_display = ['call_sheet', 'crew_member', 'call_time', 'status', 'confirmed']
    list_filter = ['status', 'confirmed', 'call_sheet__production']
    search_fields = ['crew_member__first_name', 'crew_member__last_name']

@admin.register(Character)
class CharacterAdmin(admin.ModelAdmin):
    list_display = ['name', 'production', 'actor', 'is_principal', 'total_scenes']
    list_filter = ['production', 'is_principal', 'is_supporting', 'is_background']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']