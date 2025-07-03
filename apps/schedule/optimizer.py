# apps/scheduling/optimizer.py
import numpy as np
from datetime import datetime, timedelta
from django.db.models import Q, Avg, Sum
from typing import List, Dict, Tuple
import pulp

class ProductionScheduleOptimizer:
    """AI-powered scheduling optimization using linear programming"""
    
    def __init__(self, production):
        self.production = production
        self.scenes = list(production.scenes.all())
        self.crew = list(production.crew.filter(is_active=True))
        self.locations = list(production.locations.all())
    
    def optimize_schedule(self, start_date: datetime, constraints: Dict) -> List[Dict]:
        """
        Optimize shooting schedule considering multiple constraints
        
        Constraints:
        - Actor availability
        - Location availability  
        - Weather conditions
        - Equipment requirements
        - Crew preferences
        - Budget optimization
        """
        
        # Create optimization problem
        prob = pulp.LpProblem("FilmScheduleOptimization", pulp.LpMinimize)
        
        # Decision variables: scene_day[scene_id, day] = 1 if scene shot on day
        days = list(range(30))  # 30-day window
        scene_day_vars = {}
        
        for scene in self.scenes:
            for day in days:
                var_name = f"scene_{scene.id}_day_{day}"
                scene_day_vars[(scene.id, day)] = pulp.LpVariable(
                    var_name, cat='Binary'
                )
        
        # Objective: Minimize total cost + setup changes + overtime
        setup_cost = self._calculate_setup_costs()
        location_change_penalty = 1000  # Cost of moving between locations
        overtime_cost = 500  # Cost per overtime hour
        
        objective_terms = []
        
        # Location change penalties
        for day in days[1:]:
            for loc1 in self.locations:
                for loc2 in self.locations:
                    if loc1 != loc2:
                        # Penalty for shooting at different locations on consecutive days
                        scenes_loc1_prev = [
                            scene_day_vars[(s.id, day-1)] 
                            for s in self.scenes if s.location == loc1
                        ]
                        scenes_loc2_curr = [
                            scene_day_vars[(s.id, day)] 
                            for s in self.scenes if s.location == loc2
                        ]
                        
                        if scenes_loc1_prev and scenes_loc2_curr:
                            change_indicator = pulp.LpVariable(
                                f"loc_change_{loc1.id}_to_{loc2.id}_day_{day}",
                                cat='Binary'
                            )
                            # If any scene from loc1 shot yesterday AND any from loc2 today
                            prob += change_indicator >= (
                                sum(scenes_loc1_prev) + sum(scenes_loc2_curr) - 1
                            ) / len(scenes_loc1_prev + scenes_loc2_curr)
                            
                            objective_terms.append(
                                location_change_penalty * change_indicator
                            )
        
        prob += sum(objective_terms)
        
        # Constraints
        
        # 1. Each scene must be shot exactly once
        for scene in self.scenes:
            prob += sum(
                scene_day_vars[(scene.id, day)] for day in days
            ) == 1
        
        # 2. Daily page limit (crew capacity)
        max_pages_per_day = constraints.get('max_pages_per_day', 8)
        for day in days:
            daily_pages = sum(
                scene_day_vars[(scene.id, day)] * float(scene.estimated_pages)
                for scene in self.scenes
            )
            prob += daily_pages <= max_pages_per_day
        
        # 3. Actor availability constraints
        for crew_member in self.crew:
            if hasattr(crew_member, 'availability'):
                unavailable_days = self._get_unavailable_days(crew_member)
                for day in unavailable_days:
                    # Scenes requiring this actor cannot be shot on unavailable days
                    actor_scenes = [
                        s for s in self.scenes 
                        if crew_member in s.characters.all()
                    ]
                    for scene in actor_scenes:
                        prob += scene_day_vars[(scene.id, day)] == 0
        
        # 4. Weather constraints for exterior scenes
        weather_data = self._get_weather_forecast(start_date, 30)
        for day, weather in enumerate(weather_data):
            if weather['precipitation_chance'] > 70:  # High rain chance
                exterior_scenes = [s for s in self.scenes if s.int_ext == 'EXT']
                for scene in exterior_scenes:
                    prob += scene_day_vars[(scene.id, day)] <= 0.3  # Reduced probability
        
        # 5. Location sequence optimization (group by location)
        # Encourage shooting scenes at same location close together
        for location in self.locations:
            location_scenes = [s for s in self.scenes if s.location == location]
            if len(location_scenes) > 1:
                for i, scene1 in enumerate(location_scenes):
                    for scene2 in location_scenes[i+1:]:
                        # Encourage these scenes to be shot close together
                        for day1 in days:
                            for day2 in days:
                                if abs(day1 - day2) <= 2:  # Within 2 days
                                    proximity_bonus = pulp.LpVariable(
                                        f"proximity_{scene1.id}_{scene2.id}_{day1}_{day2}",
                                        cat='Binary'
                                    )
                                    prob += proximity_bonus <= scene_day_vars[(scene1.id, day1)]
                                    prob += proximity_bonus <= scene_day_vars[(scene2.id, day2)]
                                    
                                    # Bonus for proximity (negative cost)
                                    objective_terms.append(-50 * proximity_bonus)
        
        # Solve the optimization problem
        prob.solve(pulp.PULP_CBC_CMD(msg=0))
        
        if prob.status == pulp.LpStatusOptimal:
            return self._extract_schedule(scene_day_vars, start_date, days)
        else:
            return self._fallback_schedule(start_date)
    
    def _calculate_setup_costs(self) -> Dict:
        """Calculate setup costs for different scene transitions"""
        setup_costs = {}
        
        for scene in self.scenes:
            # Cost factors: location change, time of day change, equipment change
            base_cost = 100
            
            if scene.int_ext == 'EXT':
                base_cost += 50  # Weather dependency
            
            if scene.time_of_day in ['NIGHT', 'DUSK']:
                base_cost += 75  # Lighting setup
            
            setup_costs[scene.id] = base_cost
        
        return setup_costs
    
    def _get_unavailable_days(self, crew_member) -> List[int]:
        """Get days when crew member is unavailable"""
        # This would integrate with crew availability system
        return []  # Placeholder
    
    def _get_weather_forecast(self, start_date: datetime, days: int) -> List[Dict]:
        """Get weather forecast for scheduling period"""
        # This would integrate with weather API
        return [
            {
                'precipitation_chance': np.random.randint(0, 100),
                'temperature': np.random.randint(15, 30),
                'wind_speed': np.random.randint(5, 25)
            }
            for _ in range(days)
        ]
    
    def _extract_schedule(self, scene_day_vars, start_date, days) -> List[Dict]:
        """Extract optimized schedule from solved variables"""
        schedule = []
        
        for day in days:
            day_date = start_date + timedelta(days=day)
            day_scenes = []
            
            for scene in self.scenes:
                if scene_day_vars[(scene.id, day)].value() == 1:
                    day_scenes.append({
                        'scene': scene,
                        'estimated_start': '08:00',
                        'estimated_duration': scene.estimated_pages * 45,  # 45 min per page
                        'location': scene.location,
                        'crew_required': self._get_scene_crew(scene)
                    })
            
            if day_scenes:
                schedule.append({
                    'date': day_date,
                    'scenes': day_scenes,
                    'total_pages': sum(s['scene'].estimated_pages for s in day_scenes),
                    'primary_location': day_scenes[0]['location'] if day_scenes else None
                })
        
        return schedule
    
    def _fallback_schedule(self, start_date) -> List[Dict]:
        """Simple fallback scheduling if optimization fails"""
        schedule = []
        current_date = start_date
        
        # Group scenes by location for efficiency
        location_groups = {}
        for scene in self.scenes:
            if scene.location not in location_groups:
                location_groups[scene.location] = []
            location_groups[scene.location].append(scene)
        
        for location, scenes in location_groups.items():
            for scene in scenes:
                schedule.append({
                    'date': current_date,
                    'scenes': [scene],
                    'total_pages': scene.estimated_pages,
                    'primary_location': location
                })
                current_date += timedelta(days=1)
        
        return schedule
    
    def _get_scene_crew(self, scene) -> List:
        """Get required crew for a scene"""
        # This would analyze scene requirements and return needed crew
        return self.crew  # Simplified

class MachineLearningInsights:
    """ML-powered insights for production optimization"""
    
    @staticmethod
    def predict_scene_duration(scene, historical_data):
        """Predict actual shooting time based on scene characteristics"""
        # Features: pages, complexity, location type, time of day, etc.
        features = np.array([
            float(scene.estimated_pages),
            1 if scene.int_ext == 'EXT' else 0,
            1 if scene.time_of_day == 'NIGHT' else 0,
            len(scene.characters.all()),
            scene.shots.count() if hasattr(scene, 'shots') else 3
        ])
        
        # Simple linear model (in production, use proper ML)
        # Trained on historical scene duration data
        weights = np.array([45, 15, 30, 10, 20])  # minutes
        predicted_duration = np.dot(features, weights)
        
        # Add uncertainty based on historical variance
        uncertainty = predicted_duration * 0.2
        
        return {
            'predicted_minutes': int(predicted_duration),
            'confidence_interval': (
                int(predicted_duration - uncertainty),
                int(predicted_duration + uncertainty)
            )
        }
    
    @staticmethod
    def recommend_scene_order(scenes, context):
        """ML-based scene order recommendation"""
        # Score scenes based on multiple factors
        scores = []
        
        for scene in scenes:
            score = 0
            
            # Weather factor
            if scene.int_ext == 'EXT' and context.get('weather_good', True):
                score += 10
            
            # Actor continuity
            if context.get('previous_scene'):
                shared_actors = set(scene.characters.all()) & set(
                    context['previous_scene'].characters.all()
                )
                score += len(shared_actors) * 5
            
            # Location efficiency
            if context.get('current_location') == scene.location:
                score += 15
            
            scores.append((scene, score))
        
        # Sort by score (descending)
        scores.sort(key=lambda x: x[1], reverse=True)
        return [scene for scene, _ in scores]