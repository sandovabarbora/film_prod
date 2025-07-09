#!/usr/bin/env python3
"""
Backend diagnostic script pro FilmFlow aplikaci
Zkontroluje Django setup, URLs, migrace a API endpointy
"""

import os
import sys
import subprocess
import requests
from pathlib import Path

def check_django_setup():
    """Zkontroluje základní Django setup"""
    print("🔍 KONTROLA DJANGO SETUP")
    print("=" * 50)
    
    # Check if manage.py exists
    if Path('manage.py').exists():
        print("✅ manage.py nalezen")
    else:
        print("❌ manage.py nenalezen - nejste v Django root adresáři?")
        return False
    
    # Check if filmflow directory exists
    if Path('filmflow').exists():
        print("✅ filmflow projekt nalezen")
    else:
        print("❌ filmflow adresář nenalezen")
        return False
    
    # Check apps
    apps = ['apps/production', 'apps/crew', 'apps/auth', 'apps/schedule']
    for app in apps:
        if Path(app).exists():
            print(f"✅ {app} nalezen")
        else:
            print(f"⚠️  {app} nenalezen")
    
    return True

def check_migrations():
    """Zkontroluje stav migrací"""
    print("\n🔍 KONTROLA MIGRACÍ")
    print("=" * 50)
    
    try:
        # Check if migrations exist
        result = subprocess.run(['python', 'manage.py', 'showmigrations'], 
                              capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Django funguje")
            print("Migrace:")
            print(result.stdout)
        else:
            print("❌ Chyba při kontrole migrací:")
            print(result.stderr)
            return False
            
    except Exception as e:
        print(f"❌ Chyba při spuštění Django: {e}")
        return False
    
    return True

def check_urls():
    """Zkontroluje URL konfiguraci"""
    print("\n🔍 KONTROLA URL KONFIGURACE")
    print("=" * 50)
    
    try:
        result = subprocess.run(['python', 'manage.py', 'show_urls'], 
                              capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ URLs:")
            lines = result.stdout.split('\n')
            for line in lines:
                if 'production' in line or 'api/v1' in line:
                    print(f"  {line}")
        else:
            print("⚠️  show_urls command nenalezen (normální)")
            # Fallback - check URLs manually
            try:
                from filmflow.urls import urlpatterns
                print("✅ filmflow/urls.py načten")
            except Exception as e:
                print(f"❌ Chyba v filmflow/urls.py: {e}")
                
    except Exception as e:
        print(f"⚠️  URL check failed: {e}")

def check_server():
    """Zkontroluje jestli server běží"""
    print("\n🔍 KONTROLA SERVERU")
    print("=" * 50)
    
    try:
        # Test základní Django endpoint
        response = requests.get('http://localhost:8000/', timeout=5)
        print(f"✅ Server odpovídá na http://localhost:8000/")
        print(f"   Status: {response.status_code}")
        print(f"   Content-Type: {response.headers.get('content-type', 'unknown')}")
        
        # Test API endpoint
        try:
            api_response = requests.get('http://localhost:8000/api/v1/production/productions/', timeout=5)
            print(f"✅ API endpoint odpovídá")
            print(f"   Status: {api_response.status_code}")
            print(f"   Content-Type: {api_response.headers.get('content-type', 'unknown')}")
            
            if api_response.headers.get('content-type', '').startswith('application/json'):
                print("✅ API vrací JSON")
            else:
                print("⚠️  API nevrací JSON - možná chyba v URL routing")
                print(f"   Response preview: {api_response.text[:200]}...")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ API endpoint nedostupný: {e}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Server neběží na http://localhost:8000/: {e}")
        print("💡 Spusťte server: python manage.py runserver")

def main():
    """Hlavní diagnostic funkce"""
    print("🎬 FILMFLOW BACKEND DIAGNOSTICS")
    print("=" * 50)
    
    if not check_django_setup():
        print("\n❌ Základní setup failed")
        sys.exit(1)
    
    check_migrations()
    check_urls()
    check_server()
    
    print("\n🎯 DOPORUČENÉ KROKY:")
    print("1. python manage.py makemigrations")
    print("2. python manage.py migrate") 
    print("3. python manage.py runserver")
    print("4. Otestujte: http://localhost:8000/api/v1/production/productions/")

if __name__ == '__main__':
    main()
