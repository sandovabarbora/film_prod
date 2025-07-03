# apps/analytics/management/commands/generate_sample_data.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, timedelta
import random
from decimal import Decimal

from apps.production.models import Production, Scene, Shot, Take, Location
from apps.analytics.models.metrics import ProductionMetrics
from apps.analytics.services.analytics_engine import AnalyticsEngine


class Command(BaseCommand):
    help = 'Generate realistic sample data for analytics testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--production-id',
            type=str,
            help='Production ID to generate data for'
        )
        parser.add_argument(
            '--days',
            type=int,
            default=30,
            help='Number of days of historical data to generate'
        )

    def handle(self, *args, **options):
        production_id = options.get('production_id')
        days_to_generate = options.get('days')

        if production_id:
            try:
                production = Production.objects.get(id=production_id)
            except Production.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'Production {production_id} not found')
                )
                return
        else:
            production = Production.objects.first()
            if not production:
                self.stdout.write(
                    self.style.ERROR('No productions found. Create a production first.')
                )
                return

        self.stdout.write(f'Generating sample data for: {production.title}')

        # Create sample locations if none exist
        locations = self._ensure_locations(production)
        
        # Create sample scenes if none exist
        scenes = self._ensure_scenes(production, locations)
        
        # Generate shooting data for the last N days
        self._generate_historical_metrics(production, scenes, days_to_generate)
        
        # Create some shots and takes
        self._generate_shots_and_takes(scenes)

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully generated {days_to_generate} days of sample data!'
            )
        )

        # Test the analytics
        engine = AnalyticsEngine(str(production.id))
        velocity = engine.get_current_velocity()
        efficiency = engine.get_efficiency_score()
        
        self.stdout.write(f'Current velocity: {velocity} pages/day')
        self.stdout.write(f'Efficiency score: {efficiency}%')

    def _ensure_locations(self, production):
        """Create sample locations if none exist"""
        locations = list(production.locations.all())
        
        if not locations:
            sample_locations = [
                {'name': 'Studio A', 'address': '123 Studio Lot, Hollywood, CA'},
                {'name': 'Downtown Office', 'address': '456 Main St, Downtown'},
                {'name': 'Suburban House', 'address': '789 Oak Avenue, Suburbs'},
                {'name': 'Warehouse District', 'address': '321 Industrial Blvd'},
                {'name': 'Park Location', 'address': 'Central Park, City'}
            ]
            
            for loc_data in sample_locations:
                location = Location.objects.create(
                    production=production,
                    **loc_data
                )
                locations.append(location)
                
            self.stdout.write(f'Created {len(sample_locations)} sample locations')
        
        return locations

    def _ensure_scenes(self, production, locations):
        """Create sample scenes if none exist"""
        scenes = list(production.scenes.all())
        
        if not scenes:
            scene_templates = [
                {'number': '1', 'int_ext': 'INT', 'detail': 'Kitchen', 'time': 'MORNING', 'pages': 2.5},
                {'number': '2', 'int_ext': 'INT', 'detail': 'Living Room', 'time': 'DAY', 'pages': 1.8},
                {'number': '3', 'int_ext': 'EXT', 'detail': 'Front Yard', 'time': 'DAY', 'pages': 3.2},
                {'number': '4', 'int_ext': 'INT', 'detail': 'Office', 'time': 'AFTERNOON', 'pages': 2.1},
                {'number': '5', 'int_ext': 'EXT', 'detail': 'Parking Lot', 'time': 'NIGHT', 'pages': 1.5},
                {'number': '6', 'int_ext': 'INT', 'detail': 'Warehouse', 'time': 'DAY', 'pages': 4.0},
                {'number': '7', 'int_ext': 'EXT', 'detail': 'Park', 'time': 'SUNSET', 'pages': 2.8},
                {'number': '8', 'int_ext': 'INT', 'detail': 'Car', 'time': 'NIGHT', 'pages': 1.2},
                {'number': '9', 'int_ext': 'EXT', 'detail': 'Street', 'time': 'DAY', 'pages': 3.5},
                {'number': '10', 'int_ext': 'INT', 'detail': 'Bedroom', 'time': 'NIGHT', 'pages': 1.9},
            ]
            
            for i, template in enumerate(scene_templates):
                scene = Scene.objects.create(
                    production=production,
                    scene_number=template['number'],
                    int_ext=template['int_ext'],
                    location=random.choice(locations),
                    location_detail=template['detail'],
                    time_of_day=template['time'],
                    estimated_pages=Decimal(str(template['pages'])),
                    description=f"Sample scene {template['number']} - {template['detail']}",
                    status='completed' if i < 6 else 'not_shot'  # First 6 scenes are completed
                )
                scenes.append(scene)
                
            self.stdout.write(f'Created {len(scene_templates)} sample scenes')
        
        return scenes

    def _generate_historical_metrics(self, production, scenes, days):
        """Generate realistic historical metrics"""
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        current_date = start_date
        base_velocity = 4.2  # Base pages per day
        base_efficiency = 75.0
        
        while current_date <= end_date:
            # Add some realistic variation
            velocity_variation = random.uniform(0.7, 1.3)
            efficiency_variation = random.uniform(0.8, 1.2)
            
            # Weekend penalty
            if current_date.weekday() >= 5:  # Saturday, Sunday
                velocity_variation *= 0.6
                efficiency_variation *= 0.8
            
            # Some days have no shooting (prep days, weather delays, etc.)
            if random.random() < 0.15:  # 15% chance of no shooting
                current_date += timedelta(days=1)
                continue
            
            pages_shot = base_velocity * velocity_variation
            efficiency = base_efficiency * efficiency_variation
            
            # Generate realistic metrics
            scenes_completed = max(1, int(pages_shot / 2.5))  # ~2.5 pages per scene average
            shots_completed = scenes_completed * random.randint(8, 15)
            takes_total = shots_completed * random.randint(2, 6)
            takes_good = int(takes_total * random.uniform(0.6, 0.85))
            
            shoot_ratio = takes_good / takes_total if takes_total > 0 else 0
            
            # Create metrics
            ProductionMetrics.objects.update_or_create(
                production=production,
                date=current_date,
                defaults={
                    'pages_shot': Decimal(str(round(pages_shot, 2))),
                    'scenes_completed': scenes_completed,
                    'shots_completed': shots_completed,
                    'takes_total': takes_total,
                    'takes_good': takes_good,
                    'shoot_ratio': Decimal(str(round(shoot_ratio, 3))),
                    'efficiency_score': Decimal(str(round(efficiency, 1))),
                    'setup_time_minutes': random.randint(25, 60),
                    'estimated_daily_cost': Decimal(str(random.randint(35000, 75000))),
                    'cost_per_page': Decimal(str(random.randint(8000, 18000))),
                }
            )
            
            current_date += timedelta(days=1)
        
        self.stdout.write(f'Generated metrics for {days} days')

    def _generate_shots_and_takes(self, scenes):
        """Generate sample shots and takes"""
        shot_types = ['MASTER', 'CU', 'MCU', 'MS', 'WS', 'OTS', 'POV', 'INSERT']
        
        completed_scenes = [s for s in scenes if s.status == 'completed']
        
        for scene in completed_scenes[:6]:  # First 6 completed scenes
            num_shots = random.randint(8, 15)
            
            for shot_num in range(1, num_shots + 1):
                shot = Shot.objects.create(
                    scene=scene,
                    shot_number=f"{shot_num}",
                    shot_type=random.choice(shot_types),
                    description=f"Shot {shot_num} for scene {scene.scene_number}",
                    status='completed',
                    takes_planned=random.randint(2, 5),
                    takes_completed=random.randint(2, 8),
                    takes_good=random.randint(1, 4)
                )
                
                # Generate some takes
                for take_num in range(1, shot.takes_completed + 1):
                    Take.objects.create(
                        shot=shot,
                        take_number=take_num,
                        result=random.choice(['good', 'print', 'ng']),
                        director_notes=f"Take {take_num} director notes"
                    )

        self.stdout.write(f'Generated shots and takes for {len(completed_scenes)} scenes')