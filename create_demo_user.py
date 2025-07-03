import os
import sys
import django

# Přidáme current directory do Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'filmflow.settings')
django.setup()

from django.contrib.auth.models import User

# Create demo user
if not User.objects.filter(username='demo').exists():
    user = User.objects.create_user(
        username='demo',
        email='demo@filmflow.com',
        password='demo123',
        first_name='Demo',
        last_name='User'
    )
    print("Demo user created: demo@filmflow.com / demo123")
else:
    print("Demo user already exists")
