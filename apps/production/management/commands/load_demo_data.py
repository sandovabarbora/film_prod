from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, timedelta
from apps.production.models import Production, Location, Scene, Shot
from apps.crew.models import Department, CrewMember, Character

class Command(BaseCommand):
    help = 'Load demo data for FilmFlow MVP'
    
    def handle(self, *args, **options):
        self.stdout.write('Creating demo data...')
        
        # Create departments
        departments = [
            ('Direction', '#8B5CF6'),
            ('Camera', '#0EA5E9'),
            ('Lighting', '#F59E0B'),
            ('Sound', '#10B981'),
            ('Production', '#EF4444'),
            ('Wardrobe', '#EC4899'),
            ('Makeup', '#F97316'),
        ]
        
        for name, color in departments:
            dept, created = Department.objects.get_or_create(
                name=name,
                defaults={'color_code': color}
            )
            if created:
                self.stdout.write(f'Created department: {name}')
        
        # Create production
        production = Production.objects.create(
            title='The Last Stand',
            director='Jane Smith',
            producer='Bob Johnson',
            status='shoot',
            start_date=date.today() - timedelta(days=5),
            end_date=date.today() + timedelta(days=25),
            script_version='2.1'
        )
        self.stdout.write(f'Created production: {production.title}')
        
        # Create locations
        locations_data = [
            ('Studio A - Interior', 'Main production studio, Prague'),
            ('Old Town Square', 'Staroměstské náměstí, Praha'),
            ('Petřín Hill', 'Petřín Lookout Tower area'),
            ('Café Slavia', 'Historic café near National Theatre'),
        ]
        
        locations = []
        for name, address in locations_data:
            location = Location.objects.create(
                production=production,
                name=name,
                address=address,
                contact_person='Location Manager'
            )
            locations.append(location)
            self.stdout.write(f'Created location: {name}')
        
        # Create crew
        direction_dept = Department.objects.get(name='Direction')
        camera_dept = Department.objects.get(name='Camera')
        
        crew_data = [
            ('Jane', 'Smith', 'Director', direction_dept, 'head'),
            ('Mike', 'Brown', 'Assistant Director', direction_dept, 'assistant'),
            ('Sarah', 'Davis', 'DOP', camera_dept, 'head'),
            ('Tom', 'Wilson', '1st AC', camera_dept, 'operator'),
        ]
        
        crew_members = []
        for first, last, position, dept, role in crew_data:
            crew = CrewMember.objects.create(
                production=production,
                first_name=first,
                last_name=last,
                email=f'{first.lower()}.{last.lower()}@filmflow.demo',
                department=dept,
                position=position,
                role_level=role,
                call_time_offset=timedelta(hours=0),  # Opraveno: timedelta místo string
                wrap_time_offset=timedelta(hours=0)   # Opraveno: timedelta místo string
            )
            crew_members.append(crew)
            self.stdout.write(f'Created crew member: {first} {last}')
        
        # Create scenes
        scenes_data = [
            ('1', 'INT', locations[0], 'Kitchen', 'DAY', 'Opening breakfast scene'),
            ('2A', 'EXT', locations[1], 'Square', 'DAY', 'Chase sequence begins'),
            ('2B', 'EXT', locations[1], 'Square', 'DAY', 'Chase continues'),
            ('3', 'EXT', locations[2], 'Hill', 'DUSK', 'Final confrontation'),
            ('4', 'INT', locations[3], 'Café', 'NIGHT', 'Resolution scene'),
        ]
        
        scenes = []
        for scene_num, int_ext, location, detail, time_of_day, desc in scenes_data:
            scene = Scene.objects.create(
                production=production,
                scene_number=scene_num,
                int_ext=int_ext,
                location=location,
                location_detail=detail,
                time_of_day=time_of_day,
                description=desc,
                estimated_pages=1.5 if scene_num.startswith('2') else 1.0
            )
            scenes.append(scene)
            self.stdout.write(f'Created scene: {scene_num}')
        
        # Create shots for first scene
        first_scene = scenes[0]
        shots_data = [
            ('Master', 'MASTER', 'Wide shot of entire kitchen'),
            ('1A', 'MS', 'Medium shot of protagonist'),
            ('1B', 'CU', 'Close-up on coffee cup'),
            ('2', 'OTS', 'Over shoulder conversation'),
        ]
        
        for shot_num, shot_type, desc in shots_data:
            shot = Shot.objects.create(
                scene=first_scene,
                shot_number=shot_num,
                shot_type=shot_type,
                description=desc,
                takes_planned=3,
                estimated_time=timedelta(minutes=30),  # Opraveno: timedelta místo None
                actual_time=None
            )
            self.stdout.write(f'Created shot: {first_scene.scene_number}-{shot_num}')
        
        # Mark some progress
        scenes[0].status = 'completed'
        scenes[0].save()
        
        first_scene.shots.filter(shot_number__in=['Master', '1A']).update(
            status='completed',
            takes_completed=4,
            takes_good=2,
            completed_at=timezone.now()
        )
        
        self.stdout.write(
            self.style.SUCCESS('Demo data loaded successfully!')
        )
        self.stdout.write(
            f'Production ID: {production.id}'
        )
        self.stdout.write(
            'You can now access:'
        )
        self.stdout.write(
            f'- Admin: http://localhost:8000/admin/'
        )
        self.stdout.write(
            f'- Live Dashboard: http://localhost:3000/productions/{production.id}/dashboard'
        )
        self.stdout.write(
            f'- API: http://localhost:8000/api/v1/production/productions/'
        )