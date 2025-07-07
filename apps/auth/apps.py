from django.apps import AppConfig

class AuthConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.auth'
    label = 'filmflow_auth'  # Avoid conflict with Django's built-in auth
    
    def ready(self):
        import apps.auth.signals