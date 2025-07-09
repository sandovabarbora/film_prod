# apps/crew/management/commands/add_test_data.py
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from apps.crew.models import Department, Position, CrewMember
from apps.production.models import Production

class Command(BaseCommand):
    help = 'Přidá testovací data pro crew management'

    def handle(self, *args, **options):
        self.stdout.write('🎬 Vytváření testovacích dat...')

        # Vytvoř departments
        departments_data = [
            {'name': 'Camera', 'abbreviation': 'CAM', 'color_code': '#3B82F6', 'sort_order': 1},
            {'name': 'Sound', 'abbreviation': 'SND', 'color_code': '#10B981', 'sort_order': 2},
            {'name': 'Lighting', 'abbreviation': 'LT', 'color_code': '#F59E0B', 'sort_order': 3},
            {'name': 'Production', 'abbreviation': 'PROD', 'color_code': '#EF4444', 'sort_order': 4},
            {'name': 'Art Direction', 'abbreviation': 'ART', 'color_code': '#8B5CF6', 'sort_order': 5},
        ]

        departments = {}
        for dept_data in departments_data:
            dept, created = Department.objects.get_or_create(
                name=dept_data['name'],
                defaults=dept_data
            )
            departments[dept.name] = dept
            if created:
                self.stdout.write(f'✅ Vytvořen department: {dept.name}')

        # Vytvoř positions
        positions_data = [
            {'title': 'Director of Photography', 'department': 'Camera', 'level': 'head', 'daily_rate_min': 3000, 'daily_rate_max': 5000},
            {'title': 'Camera Operator', 'department': 'Camera', 'level': 'senior', 'daily_rate_min': 2000, 'daily_rate_max': 3000},
            {'title': 'Focus Puller', 'department': 'Camera', 'level': 'junior', 'daily_rate_min': 1500, 'daily_rate_max': 2500},
            
            {'title': 'Sound Mixer', 'department': 'Sound', 'level': 'head', 'daily_rate_min': 2500, 'daily_rate_max': 4000},
            {'title': 'Boom Operator', 'department': 'Sound', 'level': 'junior', 'daily_rate_min': 1200, 'daily_rate_max': 2000},
            
            {'title': 'Gaffer', 'department': 'Lighting', 'level': 'head', 'daily_rate_min': 2500, 'daily_rate_max': 4000},
            {'title': 'Electrician', 'department': 'Lighting', 'level': 'junior', 'daily_rate_min': 1200, 'daily_rate_max': 2000},
            
            {'title': 'Producer', 'department': 'Production', 'level': 'head', 'daily_rate_min': 4000, 'daily_rate_max': 8000},
            {'title': 'Line Producer', 'department': 'Production', 'level': 'senior', 'daily_rate_min': 2500, 'daily_rate_max': 4000},
            {'title': 'Production Assistant', 'department': 'Production', 'level': 'junior', 'daily_rate_min': 800, 'daily_rate_max': 1500},
            
            {'title': 'Production Designer', 'department': 'Art Direction', 'level': 'head', 'daily_rate_min': 2500, 'daily_rate_max': 4000},
            {'title': 'Set Decorator', 'department': 'Art Direction', 'level': 'senior', 'daily_rate_min': 1800, 'daily_rate_max': 2800},
        ]

        positions = {}
        for pos_data in positions_data:
            dept_name = pos_data.pop('department')
            dept = departments[dept_name]
            
            pos, created = Position.objects.get_or_create(
                title=pos_data['title'],
                department=dept,
                defaults=pos_data
            )
            positions[pos.title] = pos
            if created:
                self.stdout.write(f'✅ Vytvořena pozice: {pos.title}')

        # Vytvoř crew members
        crew_data = [
            {
                'first_name': 'Jan', 'last_name': 'Novák', 
                'email': 'jan.novak@email.com', 'phone_primary': '+420 123 456 789',
                'position': 'Director of Photography', 'daily_rate': 4000, 
                'union_member': True, 'status': 'available'
            },
            {
                'first_name': 'Petra', 'last_name': 'Svobodová', 
                'email': 'petra.svobodova@email.com', 'phone_primary': '+420 234 567 890',
                'position': 'Sound Mixer', 'daily_rate': 3000, 
                'union_member': True, 'status': 'available'
            },
            {
                'first_name': 'Tomáš', 'last_name': 'Dvořák', 
                'email': 'tomas.dvorak@email.com', 'phone_primary': '+420 345 678 901',
                'position': 'Gaffer', 'daily_rate': 3200, 
                'union_member': False, 'status': 'available'
            },
            {
                'first_name': 'Marie', 'last_name': 'Černá', 
                'email': 'marie.cerna@email.com', 'phone_primary': '+420 456 789 012',
                'position': 'Producer', 'daily_rate': 5000, 
                'union_member': True, 'status': 'busy'
            },
            {
                'first_name': 'Pavel', 'last_name': 'Kratký', 
                'email': 'pavel.kratky@email.com', 'phone_primary': '+420 567 890 123',
                'position': 'Camera Operator', 'daily_rate': 2500, 
                'union_member': False, 'status': 'available'
            },
            {
                'first_name': 'Anna', 'last_name': 'Horáková', 
                'email': 'anna.horakova@email.com', 'phone_primary': '+420 678 901 234',
                'position': 'Production Designer', 'daily_rate': 3000, 
                'union_member': True, 'status': 'available'
            },
        ]

        for crew_info in crew_data:
            position_title = crew_info.pop('position')
            position = positions[position_title]
            
            crew_member, created = CrewMember.objects.get_or_create(
                email=crew_info['email'],
                defaults={
                    **crew_info,
                    'primary_position': position
                }
            )
            
            if created:
                self.stdout.write(f'✅ Vytvořen crew member: {crew_member.display_name}')

        # Vytvoř test production
        production, created = Production.objects.get_or_create(
            title='Test Film Project',
            defaults={
                'description': 'Testovací filmový projekt pro demo účely',
                'status': 'pre_production',
                'budget_total': 5000000,
                'location_primary': 'Prague, Czech Republic'
            }
        )
        
        if created:
            self.stdout.write(f'✅ Vytvořen test production: {production.title}')

        # Statistiky
        dept_count = Department.objects.count()
        pos_count = Position.objects.count()
        crew_count = CrewMember.objects.count()
        prod_count = Production.objects.count()

        self.stdout.write(
            self.style.SUCCESS(
                f'\n🎉 Testovací data vytvořena!\n'
                f'📂 Departments: {dept_count}\n'
                f'👔 Positions: {pos_count}\n'
                f'👥 Crew Members: {crew_count}\n'
                f'🎬 Productions: {prod_count}'
            )
        )