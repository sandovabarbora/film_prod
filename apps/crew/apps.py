# crew/apps.py
from django.apps import AppConfig

class CrewConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.crew'
    verbose_name = 'Crew Management'