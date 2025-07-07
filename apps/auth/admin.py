from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import UserProfile, ProductionAccess, LoginSession

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'
    extra = 0

class UserAdmin(BaseUserAdmin):
    inlines = [UserProfileInline]
    list_display = ['username', 'email', 'first_name', 'last_name', 'get_role', 'is_active', 'last_login']
    list_filter = ['is_active', 'is_staff', 'profile__role']
    search_fields = ['username', 'first_name', 'last_name', 'email']
    
    def get_role(self, obj):
        profile = getattr(obj, 'profile', None)
        return profile.role if profile else 'No Profile'
    get_role.short_description = 'Role'

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['display_name', 'role', 'user__email', 'phone', 'is_active', 'verified_at']
    list_filter = ['role', 'is_active', 'notification_email', 'notification_sms']
    search_fields = ['user__username', 'user__first_name', 'user__last_name', 'phone']
    readonly_fields = ['created_at', 'updated_at', 'last_active']
    
    def user__email(self, obj):
        return obj.user.email
    user__email.short_description = 'Email'
    
    fieldsets = (
        (None, {
            'fields': ('user', 'role', 'is_active')
        }),
        ('Contact Info', {
            'fields': ('phone', 'emergency_contact', 'emergency_phone')
        }),
        ('Preferences', {
            'fields': ('timezone', 'notification_email', 'notification_sms', 'notification_push')
        }),
        ('Status', {
            'fields': ('verified_at', 'last_active', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(ProductionAccess)
class ProductionAccessAdmin(admin.ModelAdmin):
    list_display = ['user_profile', 'production', 'is_active', 'can_edit_schedule', 'granted_at', 'granted_by']
    list_filter = ['is_active', 'can_edit_schedule', 'can_view_script', 'can_view_budget']
    search_fields = ['user_profile__user__username', 'production__title']
    readonly_fields = ['granted_at', 'revoked_at']
    
    fieldsets = (
        (None, {
            'fields': ('user_profile', 'production', 'is_active', 'granted_by')
        }),
        ('Permissions', {
            'fields': (
                'can_view_schedule', 'can_edit_schedule', 'can_view_script',
                'can_view_budget', 'can_view_contacts', 'can_manage_crew',
                'can_send_notifications'
            )
        }),
        ('Dates', {
            'fields': ('granted_at', 'revoked_at'),
            'classes': ('collapse',)
        }),
        ('Notes', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
    )

@admin.register(LoginSession)
class LoginSessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'ip_address', 'login_at', 'logout_at', 'is_suspicious', 'location_city']
    list_filter = ['is_suspicious', 'location_country', 'login_at']
    search_fields = ['user__username', 'ip_address', 'location_city']
    readonly_fields = ['login_at', 'last_activity', 'logout_at', 'session_key']
    
    fieldsets = (
        (None, {
            'fields': ('user', 'session_key', 'ip_address')
        }),
        ('Timestamps', {
            'fields': ('login_at', 'last_activity', 'logout_at')
        }),
        ('Security', {
            'fields': ('is_suspicious', 'location_country', 'location_city'),
            'classes': ('collapse',)
        }),
        ('Device Info', {
            'fields': ('user_agent',),
            'classes': ('collapse',)
        }),
    )

# Re-register User admin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)