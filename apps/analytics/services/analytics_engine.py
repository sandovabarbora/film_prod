from django.db.models import Avg, Sum, Count, F, Q, Max, Min
from django.utils import timezone
from datetime import timedelta, date, datetime
from decimal import Decimal
import numpy as np
from typing import Dict, List, Optional, Tuple, Any
import logging

from ..models.metrics import ProductionMetrics, VelocityTrend
from apps.production.models import Production, Scene, Shot, Take

logger = logging.getLogger(__name__)


class AnalyticsEngine:
    """
    Core analytics engine for film production metrics and predictions.
    Provides comprehensive analysis of velocity, efficiency, costs, and scheduling.
    """
    
    def __init__(self, production_id: str):
        self.production_id = production_id
        try:
            self.production = Production.objects.get(id=production_id)
        except Production.DoesNotExist:
            logger.error(f"Production {production_id} not found")
            raise ValueError(f"Production {production_id} not found")
    
    # VELOCITY ANALYTICS
    
    def get_current_velocity(self) -> float:
        """Current pages per day velocity"""
        recent_metrics = self._get_recent_metrics(days=7)
        if not recent_metrics:
            return 0.0
        
        total_pages = sum(m.pages_shot for m in recent_metrics)
        return round(total_pages / len(recent_metrics), 2)
    
    def get_velocity_trend(self, days: int = 30) -> Dict[str, Any]:
        """Velocity trend analysis over specified period"""
        metrics = self._get_recent_metrics(days=days)
        if len(metrics) < 7:
            return {'trend': 'insufficient_data', 'change_percent': 0}
        
        # Split into first and second half
        mid_point = len(metrics) // 2
        first_half = metrics[:mid_point]
        second_half = metrics[mid_point:]
        
        first_avg = sum(m.pages_shot for m in first_half) / len(first_half)
        second_avg = sum(m.pages_shot for m in second_half) / len(second_half)
        
        change_percent = ((second_avg - first_avg) / first_avg * 100) if first_avg > 0 else 0
        
        trend = 'improving' if change_percent > 5 else 'declining' if change_percent < -5 else 'stable'
        
        return {
            'trend': trend,
            'change_percent': round(change_percent, 1),
            'first_period_avg': round(first_avg, 2),
            'second_period_avg': round(second_avg, 2)
        }
    
    def get_daily_velocity_chart(self) -> List[Dict]:
        """Daily velocity data for charting"""
        metrics = self._get_recent_metrics(days=30)
        return [
            {
                'date': m.date.isoformat(),
                'pages_shot': float(m.pages_shot),
                'rolling_avg': self._calculate_rolling_average(metrics, m.date, window=7)
            }
            for m in metrics
        ]
    
    def get_rolling_averages(self) -> Dict[str, List[float]]:
        """Various rolling averages for trend analysis"""
        metrics = self._get_recent_metrics(days=90)
        dates = [m.date for m in metrics]
        
        return {
            '7_day': [self._calculate_rolling_average(metrics, d, 7) for d in dates],
            '14_day': [self._calculate_rolling_average(metrics, d, 14) for d in dates],
            '30_day': [self._calculate_rolling_average(metrics, d, 30) for d in dates]
        }
    
    def get_velocity_by_location(self) -> List[Dict]:
        """Velocity breakdown by shooting location"""
        # Use Scene and Shot data since we don't have DailyShooting
        from apps.schedule.models import ShootingDay
        
        try:
            # Get shooting days from the last 30 days
            recent_shooting_days = ShootingDay.objects.filter(
                production=self.production,
                date__gte=timezone.now().date() - timedelta(days=30),
                status='completed'
            ).select_related('primary_location')
            
            location_metrics = {}
            
            for shooting_day in recent_shooting_days:
                location_name = shooting_day.primary_location.name
                
                # Calculate pages shot on this day at this location
                scenes_shot = Scene.objects.filter(
                    production=self.production,
                    location=shooting_day.primary_location,
                    status='completed'
                ).aggregate(total_pages=Sum('estimated_pages'))
                
                if location_name not in location_metrics:
                    location_metrics[location_name] = {
                        'total_pages': 0,
                        'shooting_days': 0
                    }
                
                location_metrics[location_name]['total_pages'] += float(scenes_shot['total_pages'] or 0)
                location_metrics[location_name]['shooting_days'] += 1
            
            return [
                {
                    'location': location,
                    'avg_pages_per_day': round(data['total_pages'] / data['shooting_days'], 2) if data['shooting_days'] > 0 else 0,
                    'shooting_days': data['shooting_days']
                }
                for location, data in location_metrics.items()
            ]
            
        except ImportError:
            # Fallback if schedule app not available
            return [
                {
                    'location': 'Studio',
                    'avg_pages_per_day': 4.5,
                    'shooting_days': 15
                }
            ]
    
    def get_velocity_by_scene_type(self) -> List[Dict]:
        """Velocity analysis by scene type/complexity"""
        # Use Shot.shot_type as proxy for scene complexity
        scene_metrics = Shot.objects.filter(
            scene__production=self.production,
            status='completed'
        ).values('shot_type').annotate(
            total_shots=Count('id'),
            avg_takes=Avg('takes_completed')
        )
        
        # Convert shot complexity to velocity estimates
        complexity_mapping = {
            'MASTER': 1.2,  # Master shots are typically faster
            'CU': 0.8,      # Close-ups need more precision
            'MCU': 0.9,
            'MS': 1.0,
            'WS': 1.1,
            'OTS': 0.9,
            'POV': 0.7,
            'INSERT': 1.3   # Usually quick pickups
        }
        
        return [
            {
                'scene_type': sm['shot_type'],
                'avg_pages_per_day': round(complexity_mapping.get(sm['shot_type'], 1.0) * 5, 2),  # Base 5 pages/day
                'shot_count': sm['total_shots'],
                'avg_takes': round(float(sm['avg_takes'] or 0), 1)
            }
            for sm in scene_metrics
        ]
    
    def analyze_velocity_factors(self) -> Dict[str, Any]:
        """Analyze factors affecting velocity"""
        metrics = self._get_recent_metrics(days=30)
        
        # Day of week analysis
        weekday_performance = {}
        for m in metrics:
            weekday = m.date.weekday()
            if weekday not in weekday_performance:
                weekday_performance[weekday] = []
            weekday_performance[weekday].append(float(m.pages_shot))
        
        weekday_avgs = {
            day: round(sum(pages) / len(pages), 2)
            for day, pages in weekday_performance.items()
        }
        
        return {
            'weekday_performance': weekday_avgs,
            'best_weekday': max(weekday_avgs, key=weekday_avgs.get),
            'worst_weekday': min(weekday_avgs, key=weekday_avgs.get),
            'weekend_vs_weekday': self._compare_weekend_weekday(metrics)
        }
    
    # EFFICIENCY ANALYTICS
    
    def get_efficiency_score(self) -> float:
        """Overall production efficiency score (0-100)"""
        recent_metrics = self._get_recent_metrics(days=14)
        if not recent_metrics:
            return 0.0
        
        scores = [m.efficiency_score for m in recent_metrics if m.efficiency_score]
        return round(sum(scores) / len(scores), 1) if scores else 0.0
    
    def get_efficiency_trend(self) -> Dict[str, Any]:
        """Efficiency trend over time"""
        metrics = self._get_recent_metrics(days=30)
        if len(metrics) < 7:
            return {'trend': 'insufficient_data'}
        
        # Calculate weekly efficiency averages
        weekly_scores = []
        for i in range(0, len(metrics), 7):
            week_metrics = metrics[i:i+7]
            week_scores = [m.efficiency_score for m in week_metrics if m.efficiency_score]
            if week_scores:
                weekly_scores.append(sum(week_scores) / len(week_scores))
        
        if len(weekly_scores) < 2:
            return {'trend': 'insufficient_data'}
        
        # Calculate trend
        recent_avg = sum(weekly_scores[-2:]) / 2
        earlier_avg = sum(weekly_scores[:-2]) / len(weekly_scores[:-2]) if len(weekly_scores) > 2 else weekly_scores[0]
        
        change = recent_avg - earlier_avg
        trend = 'improving' if change > 2 else 'declining' if change < -2 else 'stable'
        
        return {
            'trend': trend,
            'change_points': round(change, 1),
            'current_score': round(recent_avg, 1),
            'weekly_scores': [round(s, 1) for s in weekly_scores]
        }
    
    def get_efficiency_breakdown(self) -> Dict[str, float]:
        """Detailed efficiency component breakdown"""
        recent_shooting = DailyShooting.objects.filter(
            production=self.production,
            date__gte=timezone.now().date() - timedelta(days=14)
        )
        
        if not recent_shooting.exists():
            return {}
        
        avg_setup_time = recent_shooting.aggregate(avg_setup=Avg('setup_time'))['avg_setup'] or 0
        avg_shoot_ratio = recent_shooting.aggregate(avg_ratio=Avg('shoot_ratio'))['avg_ratio'] or 0
        
        # Calculate component scores (normalized to 0-100)
        setup_efficiency = max(0, min(100, 100 - (float(avg_setup_time) / 60 * 10)))  # Assuming 60min is baseline
        shoot_efficiency = max(0, min(100, 100 - (float(avg_shoot_ratio) - 1) * 20))  # 1:1 ratio is perfect
        
        return {
            'setup_efficiency': round(setup_efficiency, 1),
            'shoot_ratio_efficiency': round(shoot_efficiency, 1),
            'overall_planning': self._calculate_planning_efficiency(),
            'crew_performance': self._calculate_crew_efficiency()
        }
    
    def get_shoot_ratio_trend(self) -> List[Dict]:
        """Shoot ratio trend over time"""
        metrics = self._get_recent_metrics(days=30)
        return [
            {
                'date': m.date.isoformat(),
                'shoot_ratio': float(m.shoot_ratio) if m.shoot_ratio else None,
                'target_ratio': 1.5  # Industry standard target
            }
            for m in metrics
        ]
    
    def get_setup_time_analysis(self) -> Dict[str, Any]:
        """Setup time analysis and optimization suggestions"""
        # Since we don't have DailyShooting, estimate from Shot completion patterns
        recent_shots = Shot.objects.filter(
            scene__production=self.production,
            status='completed',
            updated_at__gte=timezone.now() - timedelta(days=30)
        ).order_by('updated_at')
        
        if not recent_shots.exists():
            return {'status': 'no_data'}
        
        # Estimate setup times based on shot complexity
        setup_estimates = []
        for shot in recent_shots[:20]:  # Sample recent shots
            base_setup = 30  # Base 30 minutes
            
            # Adjust by shot type complexity
            complexity_factors = {
                'MASTER': 0.8,
                'CU': 1.2,
                'MCU': 1.0,
                'MS': 0.9,
                'WS': 0.7,
                'OTS': 1.1,
                'POV': 1.3,
                'INSERT': 0.6
            }
            
            factor = complexity_factors.get(shot.shot_type, 1.0)
            estimated_setup = base_setup * factor
            setup_estimates.append(estimated_setup)
        
        if not setup_estimates:
            return {'status': 'no_setup_data'}
        
        avg_setup = sum(setup_estimates) / len(setup_estimates)
        
        return {
            'average_setup_minutes': round(avg_setup, 1),
            'trend': 'stable',  # Would need historical data for real trend
            'optimization_potential': self._calculate_setup_optimization(setup_estimates),
            'recommendations': self._get_setup_recommendations(avg_setup)
        }
    
    # SCHEDULE ANALYTICS
    
    def get_schedule_status(self) -> str:
        """Current schedule status"""
        variance = self.get_schedule_variance()
        if variance > 3:
            return 'behind'
        elif variance < -3:
            return 'ahead'
        return 'on_track'
    
    def get_schedule_variance(self) -> int:
        """Days ahead/behind schedule"""
        if not hasattr(self.production, 'planned_end_date') or not self.production.planned_end_date:
            return 0
        
        completion_prediction = self.predict_completion_date()
        if not completion_prediction:
            return 0
        
        planned_end = self.production.planned_end_date
        predicted_end = datetime.strptime(completion_prediction, '%Y-%m-%d').date()
        
        return (predicted_end - planned_end).days
    
    def get_critical_path_analysis(self) -> Dict[str, Any]:
        """Critical path analysis for scheduling"""
        remaining_scenes = Scene.objects.filter(
            production=self.production,
            status__in=['not_started', 'in_progress']
        ).order_by('scheduled_date')
        
        if not remaining_scenes.exists():
            return {'status': 'completed'}
        
        critical_scenes = remaining_scenes.filter(
            is_critical=True
        ) if hasattr(Scene, 'is_critical') else remaining_scenes[:5]
        
        return {
            'total_remaining_scenes': remaining_scenes.count(),
            'critical_scenes_count': critical_scenes.count(),
            'next_critical_deadline': critical_scenes.first().scheduled_date if critical_scenes.exists() else None,
            'bottlenecks': self._identify_schedule_bottlenecks(remaining_scenes)
        }
    
    # BUDGET ANALYTICS
    
    def get_daily_cost_average(self) -> float:
        """Average daily production cost"""
        # Since we don't have daily cost tracking, estimate from production budget
        try:
            if hasattr(self.production, 'budget') and self.production.budget:
                total_budget = float(self.production.budget)
                
                # Estimate shooting days
                if hasattr(self.production, 'start_date') and hasattr(self.production, 'end_date'):
                    total_days = (self.production.end_date - self.production.start_date).days
                    shooting_days = total_days * 0.7  # Assume 70% are shooting days
                    
                    # Production costs are typically 50% of total budget
                    production_budget = total_budget * 0.5
                    
                    return round(production_budget / shooting_days, 2) if shooting_days > 0 else 0.0
            
            # Fallback estimate based on industry standards
            return 50000.0  # $50K per day average
            
        except (AttributeError, ValueError, TypeError):
            return 0.0
    
    def get_cost_per_page(self) -> float:
        """Cost per script page shot"""
        recent_metrics = self._get_recent_metrics(days=30)
        if not recent_metrics:
            return 0.0
        
        valid_metrics = [m for m in recent_metrics if m.cost_per_page]
        if not valid_metrics:
            return 0.0
        
        return round(sum(float(m.cost_per_page) for m in valid_metrics) / len(valid_metrics), 2)
    
    def get_budget_variance(self) -> float:
        """Budget variance percentage"""
        if not hasattr(self.production, 'total_budget') or not self.production.total_budget:
            return 0.0
        
        spent_to_date = self._calculate_spent_budget()
        progress_percent = self._calculate_completion_percentage()
        
        if progress_percent == 0:
            return 0.0
        
        expected_spent = float(self.production.total_budget) * (progress_percent / 100)
        variance = ((spent_to_date - expected_spent) / expected_spent) * 100
        
        return round(variance, 1)
    
    # PREDICTION METHODS
    
    def predict_completion_date(self) -> Optional[str]:
        """Predict production completion date based on current velocity"""
        current_velocity = self.get_current_velocity()
        if current_velocity <= 0:
            return None
        
        remaining_pages = self._calculate_remaining_pages()
        if remaining_pages <= 0:
            return timezone.now().date().isoformat()
        
        days_needed = remaining_pages / current_velocity
        
        # Account for weekends and holidays
        adjusted_days = days_needed * 1.4  # Rough weekend adjustment
        
        completion_date = timezone.now().date() + timedelta(days=int(adjusted_days))
        return completion_date.isoformat()
    
    def predict_next_week_velocity(self) -> Dict[str, float]:
        """Predict next week's velocity based on trends"""
        velocity_trend = self.get_velocity_trend(days=14)
        current_velocity = self.get_current_velocity()
        
        if velocity_trend['trend'] == 'improving':
            predicted = current_velocity * 1.1
        elif velocity_trend['trend'] == 'declining':
            predicted = current_velocity * 0.9
        else:
            predicted = current_velocity
        
        return {
            'predicted_velocity': round(predicted, 2),
            'confidence': self._calculate_prediction_confidence(),
            'range_low': round(predicted * 0.8, 2),
            'range_high': round(predicted * 1.2, 2)
        }
    
    def get_completion_scenarios(self) -> List[Dict]:
        """Multiple completion scenarios with probabilities"""
        current_velocity = self.get_current_velocity()
        remaining_pages = self._calculate_remaining_pages()
        
        if current_velocity <= 0 or remaining_pages <= 0:
            return []
        
        scenarios = [
            {'scenario': 'optimistic', 'multiplier': 1.2, 'probability': 0.25},
            {'scenario': 'realistic', 'multiplier': 1.0, 'probability': 0.5},
            {'scenario': 'conservative', 'multiplier': 0.8, 'probability': 0.25}
        ]
        
        results = []
        for scenario in scenarios:
            velocity = current_velocity * scenario['multiplier']
            days_needed = (remaining_pages / velocity) * 1.4  # Weekend adjustment
            completion_date = timezone.now().date() + timedelta(days=int(days_needed))
            
            results.append({
                'scenario': scenario['scenario'],
                'completion_date': completion_date.isoformat(),
                'probability': scenario['probability'],
                'days_from_now': int(days_needed)
            })
        
        return results
    
    def predict_total_budget(self) -> Dict[str, float]:
        """Predict final budget based on current spending patterns"""
        current_cost_per_page = self.get_cost_per_page()
        remaining_pages = self._calculate_remaining_pages()
        spent_to_date = self._calculate_spent_budget()
        
        if current_cost_per_page <= 0:
            return {'predicted_total': spent_to_date}
        
        predicted_remaining_cost = remaining_pages * current_cost_per_page
        predicted_total = spent_to_date + predicted_remaining_cost
        
        return {
            'predicted_total': round(predicted_total, 2),
            'spent_to_date': round(spent_to_date, 2),
            'predicted_remaining': round(predicted_remaining_cost, 2),
            'confidence_level': self._calculate_budget_prediction_confidence()
        }
    
    # INSIGHTS AND RECOMMENDATIONS
    
    def get_actionable_insights(self) -> List[Dict]:
        """Generate actionable insights based on current metrics"""
        insights = []
        
        # Velocity insights
        velocity_trend = self.get_velocity_trend()
        if velocity_trend['trend'] == 'declining':
            insights.append({
                'type': 'warning',
                'category': 'velocity',
                'title': 'Declining Velocity Detected',
                'message': f"Velocity has decreased by {abs(velocity_trend['change_percent'])}% recently",
                'action': 'Review recent shooting challenges and optimize workflow'
            })
        
        # Efficiency insights
        efficiency_score = self.get_efficiency_score()
        if efficiency_score < 70:
            insights.append({
                'type': 'warning',
                'category': 'efficiency',
                'title': 'Low Efficiency Score',
                'message': f"Current efficiency score is {efficiency_score}%",
                'action': 'Analyze setup times and shoot ratios for optimization opportunities'
            })
        
        # Budget insights
        budget_variance = self.get_budget_variance()
        if budget_variance > 10:
            insights.append({
                'type': 'alert',
                'category': 'budget',
                'title': 'Budget Overrun Risk',
                'message': f"Currently {budget_variance}% over expected spending",
                'action': 'Review budget allocation and consider cost reduction measures'
            })
        
        return insights
    
    def get_active_alerts(self) -> List[Dict]:
        """Get active production alerts"""
        alerts = []
        
        # Check for critical schedule delays
        schedule_variance = self.get_schedule_variance()
        if schedule_variance > 7:
            alerts.append({
                'severity': 'high',
                'type': 'schedule',
                'message': f'Production is {schedule_variance} days behind schedule',
                'timestamp': timezone.now().isoformat()
            })
        
        # Check for efficiency drops
        efficiency_trend = self.get_efficiency_trend()
        if efficiency_trend.get('trend') == 'declining':
            alerts.append({
                'severity': 'medium',
                'type': 'efficiency',
                'message': 'Efficiency trending downward',
                'timestamp': timezone.now().isoformat()
            })
        
        return alerts
    
    # UTILITY METHODS
    
    def _get_recent_metrics(self, days: int = 30) -> List[ProductionMetrics]:
        """Get recent metrics for the production"""
        start_date = timezone.now().date() - timedelta(days=days)
        return list(ProductionMetrics.objects.filter(
            production_id=self.production_id,
            date__gte=start_date
        ).order_by('date'))
    
    def _calculate_rolling_average(self, metrics: List[ProductionMetrics], target_date: date, window: int) -> float:
        """Calculate rolling average for a specific date"""
        start_date = target_date - timedelta(days=window-1)
        relevant_metrics = [m for m in metrics if start_date <= m.date <= target_date]
        
        if not relevant_metrics:
            return 0.0
        
        total_pages = sum(float(m.pages_shot) for m in relevant_metrics)
        return round(total_pages / len(relevant_metrics), 2)
    
    def _calculate_remaining_pages(self) -> float:
        """Calculate remaining script pages to shoot"""
        total_pages = getattr(self.production, 'total_script_pages', 120)  # Default if not set
        shot_pages = ProductionMetrics.objects.filter(
            production_id=self.production_id
        ).aggregate(total=Sum('pages_shot'))['total'] or 0
        
        return max(0, float(total_pages) - float(shot_pages))
    
    def _calculate_spent_budget(self) -> float:
        """Calculate total budget spent to date"""
        # Since we don't have daily cost tracking, estimate based on completion
        if hasattr(self.production, 'budget') and self.production.budget:
            total_budget = float(self.production.budget)
            completion_percent = self._calculate_completion_percentage()
            
            # Estimate spent budget based on completion (with front-loading typical in film)
            # Early production typically spends more per percent complete
            if completion_percent <= 20:
                spend_rate = 1.5  # 150% of linear
            elif completion_percent <= 50:
                spend_rate = 1.2  # 120% of linear  
            elif completion_percent <= 80:
                spend_rate = 0.9  # 90% of linear
            else:
                spend_rate = 0.8  # 80% of linear (post is cheaper)
            
            estimated_spent = (completion_percent / 100) * total_budget * spend_rate
            return min(estimated_spent, total_budget)  # Cap at total budget
        
        return 0.0
    
    def _calculate_completion_percentage(self) -> float:
        """Calculate production completion percentage"""
        total_pages = getattr(self.production, 'total_script_pages', 120)
        shot_pages = ProductionMetrics.objects.filter(
            production_id=self.production_id
        ).aggregate(total=Sum('pages_shot'))['total'] or 0
        
        return round((float(shot_pages) / float(total_pages)) * 100, 1) if total_pages > 0 else 0
    
    def _calculate_prediction_confidence(self) -> float:
        """Calculate confidence level for predictions"""
        metrics_count = ProductionMetrics.objects.filter(
            production_id=self.production_id
        ).count()
        
        # More data = higher confidence
        base_confidence = min(90, metrics_count * 3)
        
        # Adjust for consistency
        velocity_trend = self.get_velocity_trend()
        if velocity_trend['trend'] == 'stable':
            base_confidence += 10
        elif velocity_trend['trend'] in ['improving', 'declining']:
            base_confidence -= 5
        
        return round(min(95, max(50, base_confidence)), 1)
    
    def _calculate_planning_efficiency(self) -> float:
        """Calculate planning and scheduling efficiency"""
        # Placeholder implementation
        return 75.0
    
    def _calculate_crew_efficiency(self) -> float:
        """Calculate crew performance efficiency"""
        # Placeholder implementation
        return 80.0
    
    def _compare_weekend_weekday(self, metrics: List[ProductionMetrics]) -> Dict[str, float]:
        """Compare weekend vs weekday performance"""
        weekend_pages = []
        weekday_pages = []
        
        for m in metrics:
            if m.date.weekday() >= 5:  # Saturday, Sunday
                weekend_pages.append(float(m.pages_shot))
            else:
                weekday_pages.append(float(m.pages_shot))
        
        weekend_avg = sum(weekend_pages) / len(weekend_pages) if weekend_pages else 0
        weekday_avg = sum(weekday_pages) / len(weekday_pages) if weekday_pages else 0
        
        return {
            'weekend_avg': round(weekend_avg, 2),
            'weekday_avg': round(weekday_avg, 2),
            'weekend_vs_weekday_ratio': round(weekend_avg / weekday_avg, 2) if weekday_avg > 0 else 0
        }
    
    def recalculate_all_metrics(self) -> Dict[str, Any]:
        """Recalculate all metrics for the production"""
        start_date = self.production.start_date if hasattr(self.production, 'start_date') else timezone.now().date() - timedelta(days=90)
        end_date = timezone.now().date()
        
        dates_processed = 0
        current_date = start_date
        
        while current_date <= end_date:
            # This would trigger metric calculation for each date
            ProductionMetrics.calculate_for_date(
                production_id=self.production_id,
                date=current_date
            )
            dates_processed += 1
            current_date += timedelta(days=1)
        
        return {
            'count': dates_processed,
            'date_range': f"{start_date} to {end_date}"
        }
    
    # ADDITIONAL REAL-TIME METHODS USED IN VIEWS
    
    def get_current_efficiency(self) -> float:
        """Get current efficiency score for today"""
        today = timezone.now().date()
        try:
            today_metrics = ProductionMetrics.objects.get(
                production_id=self.production_id,
                date=today
            )
            return float(today_metrics.efficiency_score or 0)
        except ProductionMetrics.DoesNotExist:
            return 0.0
    
    def project_daily_total(self) -> Dict[str, float]:
        """Project end-of-day totals based on current progress"""
        current_velocity = self.get_current_velocity()
        current_time = timezone.now().time()
        
        # Estimate remaining productive hours (assuming 10-hour shoot day)
        if current_time.hour < 8:  # Haven't started
            remaining_hours = 10
        elif current_time.hour > 18:  # Wrapped
            remaining_hours = 0
        else:
            elapsed_hours = current_time.hour - 8 + (current_time.minute / 60)
            remaining_hours = max(0, 10 - elapsed_hours)
        
        # Project based on current velocity and remaining time
        projected_additional_pages = (current_velocity / 10) * remaining_hours
        
        return {
            'projected_additional_pages': round(projected_additional_pages, 2),
            'remaining_productive_hours': round(remaining_hours, 1),
            'current_pace_pages_per_hour': round(current_velocity / 10, 2)
        }
    
    def get_current_production_status(self) -> str:
        """Get current production status"""
        schedule_variance = self.get_schedule_variance()
        efficiency_score = self.get_efficiency_score()
        
        if schedule_variance > 7 or efficiency_score < 60:
            return 'critical'
        elif schedule_variance > 3 or efficiency_score < 70:
            return 'warning'
        elif schedule_variance < -3 and efficiency_score > 85:
            return 'excellent'
        else:
            return 'normal'
    
    def get_active_crew_count(self) -> int:
        """Get current active crew count (placeholder)"""
        # This would integrate with crew management system
        return 45  # Placeholder value
    
    def get_current_scene_info(self) -> Dict[str, Any]:
        """Get information about the current scene being shot"""
        # This would integrate with current shooting schedule
        try:
            current_scene = Scene.objects.filter(
                production=self.production,
                status='in_progress'
            ).first()
            
            if current_scene:
                return {
                    'scene_number': current_scene.scene_number,
                    'scene_description': getattr(current_scene, 'description', 'N/A'),
                    'estimated_pages': float(getattr(current_scene, 'estimated_pages', 0)),
                    'location': getattr(current_scene, 'location', 'Unknown'),
                    'complexity': getattr(current_scene, 'complexity', 'medium')
                }
        except Exception:
            pass
        
        return {
            'scene_number': 'N/A',
            'scene_description': 'No active scene',
            'estimated_pages': 0,
            'location': 'Unknown',
            'complexity': 'unknown'
        }
    
    def get_time_elapsed_today(self) -> Dict[str, Any]:
        """Get time elapsed in today's shoot"""
        today = timezone.now().date()
        current_time = timezone.now().time()
        
        try:
            today_metrics = ProductionMetrics.objects.get(
                production_id=self.production_id,
                date=today
            )
            
            if today_metrics.first_shot_time:
                start_time = timezone.datetime.combine(today, today_metrics.first_shot_time)
                current_datetime = timezone.datetime.combine(today, current_time)
                elapsed = current_datetime - start_time
                
                return {
                    'elapsed_hours': round(elapsed.total_seconds() / 3600, 1),
                    'start_time': today_metrics.first_shot_time.strftime('%H:%M'),
                    'is_shooting': True
                }
        except ProductionMetrics.DoesNotExist:
            pass
        
        return {
            'elapsed_hours': 0,
            'start_time': None,
            'is_shooting': False
        }
    
    def estimate_wrap_time(self) -> Dict[str, Any]:
        """Estimate when shooting will wrap today"""
        current_velocity = self.get_current_velocity()
        remaining_pages_today = self._estimate_remaining_pages_today()
        
        if current_velocity <= 0 or remaining_pages_today <= 0:
            return {
                'estimated_wrap_time': None,
                'confidence': 'low',
                'pages_remaining': remaining_pages_today
            }
        
        hours_needed = remaining_pages_today / (current_velocity / 10)  # velocity per hour
        current_time = timezone.now()
        estimated_wrap = current_time + timedelta(hours=hours_needed)
        
        # Cap at reasonable wrap time (no later than midnight)
        max_wrap_time = timezone.datetime.combine(current_time.date(), time(23, 59))
        if estimated_wrap > max_wrap_time:
            estimated_wrap = max_wrap_time
            confidence = 'low'
        else:
            confidence = 'medium' if hours_needed < 6 else 'high'
        
        return {
            'estimated_wrap_time': estimated_wrap.strftime('%H:%M'),
            'confidence': confidence,
            'pages_remaining': round(remaining_pages_today, 1),
            'hours_needed': round(hours_needed, 1)
        }
    
    # RISK ANALYSIS METHODS
    
    def identify_schedule_risks(self) -> List[Dict]:
        """Identify potential schedule risks"""
        risks = []
        
        # Velocity decline risk
        velocity_trend = self.get_velocity_trend()
        if velocity_trend['trend'] == 'declining':
            risks.append({
                'type': 'velocity_decline',
                'severity': 'high' if velocity_trend['change_percent'] < -20 else 'medium',
                'description': f"Velocity declining by {abs(velocity_trend['change_percent'])}%",
                'impact': 'schedule_delay',
                'mitigation': 'Review workflow efficiency and identify bottlenecks'
            })
        
        # Schedule variance risk
        schedule_variance = self.get_schedule_variance()
        if schedule_variance > 5:
            risks.append({
                'type': 'schedule_variance',
                'severity': 'high' if schedule_variance > 10 else 'medium',
                'description': f"Currently {schedule_variance} days behind schedule",
                'impact': 'budget_overrun',
                'mitigation': 'Consider additional shooting days or crew optimization'
            })
        
        # Weather/external factors (placeholder)
        risks.append({
            'type': 'external_factors',
            'severity': 'low',
            'description': 'Weather and location availability risks',
            'impact': 'potential_delays',
            'mitigation': 'Monitor weather forecasts and have backup plans'
        })
        
        return risks
    
    def identify_budget_risks(self) -> List[Dict]:
        """Identify potential budget risks"""
        risks = []
        
        budget_variance = self.get_budget_variance()
        if budget_variance > 15:
            risks.append({
                'type': 'budget_overrun',
                'severity': 'high' if budget_variance > 25 else 'medium',
                'description': f"Budget variance at {budget_variance}%",
                'impact': 'financial_strain',
                'mitigation': 'Review cost structure and identify savings opportunities'
            })
        
        cost_per_page = self.get_cost_per_page()
        if cost_per_page > 10000:  # Placeholder threshold
            risks.append({
                'type': 'high_cost_per_page',
                'severity': 'medium',
                'description': f"Cost per page at ${cost_per_page:,.0f}",
                'impact': 'budget_pressure',
                'mitigation': 'Optimize crew efficiency and equipment usage'
            })
        
        return risks
    
    def identify_operational_risks(self) -> List[Dict]:
        """Identify operational risks"""
        risks = []
        
        efficiency_score = self.get_efficiency_score()
        if efficiency_score < 65:
            risks.append({
                'type': 'low_efficiency',
                'severity': 'high' if efficiency_score < 50 else 'medium',
                'description': f"Efficiency score at {efficiency_score}%",
                'impact': 'quality_schedule_risk',
                'mitigation': 'Review workflows and provide additional training'
            })
        
        return risks
    
    # OPTIMIZATION SUGGESTIONS
    
    def suggest_schedule_optimizations(self) -> List[Dict]:
        """Suggest schedule optimization strategies"""
        suggestions = []
        
        velocity_analysis = self.analyze_velocity_factors()
        best_weekday = velocity_analysis.get('best_weekday')
        worst_weekday = velocity_analysis.get('worst_weekday')
        
        if best_weekday is not None and worst_weekday is not None:
            weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            suggestions.append({
                'type': 'schedule_adjustment',
                'priority': 'medium',
                'description': f"Schedule complex scenes on {weekdays[best_weekday]}s (highest velocity)",
                'expected_impact': '10-15% velocity improvement',
                'implementation': 'Adjust shooting schedule to match performance patterns'
            })
        
        setup_analysis = self.get_setup_time_analysis()
        if setup_analysis.get('average_setup_minutes', 0) > 45:
            suggestions.append({
                'type': 'setup_optimization',
                'priority': 'high',
                'description': 'Reduce setup times through better pre-planning',
                'expected_impact': '20-30% time savings',
                'implementation': 'Implement setup checklists and pre-rig strategies'
            })
        
        return suggestions
    
    def suggest_resource_optimizations(self) -> List[Dict]:
        """Suggest resource optimization strategies"""
        suggestions = []
        
        efficiency_breakdown = self.get_efficiency_breakdown()
        
        if efficiency_breakdown.get('setup_efficiency', 100) < 70:
            suggestions.append({
                'type': 'crew_optimization',
                'priority': 'high',
                'description': 'Optimize crew deployment during setup phases',
                'expected_impact': 'Reduce setup time by 25%',
                'implementation': 'Cross-train crew members and implement parallel workflows'
            })
        
        if efficiency_breakdown.get('shoot_ratio_efficiency', 100) < 75:
            suggestions.append({
                'type': 'rehearsal_optimization',
                'priority': 'medium',
                'description': 'Increase rehearsal time to improve shoot ratios',
                'expected_impact': 'Reduce takes needed by 20%',
                'implementation': 'Schedule additional rehearsal time for complex scenes'
            })
        
        return suggestions
    
    def suggest_workflow_improvements(self) -> List[Dict]:
        """Suggest workflow improvement strategies"""
        suggestions = []
        
        suggestions.append({
            'type': 'communication_improvement',
            'priority': 'medium',
            'description': 'Implement digital daily reports for real-time tracking',
            'expected_impact': 'Faster decision making and issue resolution',
            'implementation': 'Use mobile apps for instant data collection'
        })
        
        suggestions.append({
            'type': 'predictive_scheduling',
            'priority': 'low',
            'description': 'Use AI-powered scheduling based on historical patterns',
            'expected_impact': '5-10% efficiency improvement',
            'implementation': 'Integrate ML models with production planning tools'
        })
        
        return suggestions
    
    # BENCHMARKING AND COMPARISON
    
    def get_industry_comparison(self) -> Dict[str, Any]:
        """Compare current production against industry benchmarks"""
        from .models.metrics import PerformanceBaseline
        
        production_type = getattr(self.production, 'production_type', 'feature')
        
        try:
            benchmarks = PerformanceBaseline.objects.filter(
                production_type=production_type
            )
            
            current_velocity = self.get_current_velocity()
            current_efficiency = self.get_efficiency_score()
            current_cost_per_page = self.get_cost_per_page()
            
            comparison = {}
            
            # Velocity comparison
            velocity_benchmark = benchmarks.filter(metric_type='pages_per_day').first()
            if velocity_benchmark:
                comparison['velocity'] = {
                    'current': current_velocity,
                    'industry_average': float(velocity_benchmark.industry_average),
                    'percentile': self._calculate_percentile(current_velocity, velocity_benchmark),
                    'status': 'above_average' if current_velocity > float(velocity_benchmark.industry_average) else 'below_average'
                }
            
            # Efficiency comparison
            efficiency_benchmark = benchmarks.filter(metric_type='efficiency_score').first()
            if efficiency_benchmark:
                comparison['efficiency'] = {
                    'current': current_efficiency,
                    'industry_average': float(efficiency_benchmark.industry_average),
                    'percentile': self._calculate_percentile(current_efficiency, efficiency_benchmark),
                    'status': 'above_average' if current_efficiency > float(efficiency_benchmark.industry_average) else 'below_average'
                }
            
            return comparison
            
        except Exception as e:
            logger.warning(f"Could not load industry benchmarks: {e}")
            return {}
    
    # UTILITY METHODS CONTINUED
    
    def _estimate_remaining_pages_today(self) -> float:
        """Estimate remaining pages to shoot today"""
        # This would be based on today's call sheet
        # Placeholder implementation
        target_pages_per_day = 5.0
        
        try:
            today_metrics = ProductionMetrics.objects.get(
                production_id=self.production_id,
                date=timezone.now().date()
            )
            shot_today = float(today_metrics.pages_shot)
            return max(0, target_pages_per_day - shot_today)
        except ProductionMetrics.DoesNotExist:
            return target_pages_per_day
    
    def _analyze_setup_trend(self, shooting_data) -> str:
        """Analyze setup time trend - simplified version"""
        # Since we don't have historical setup time data, return stable
        return 'stable'
    
    def _calculate_setup_optimization(self, setup_times) -> Dict[str, float]:
        """Calculate setup time optimization potential"""
        if not setup_times:
            return {'potential_savings': 0, 'target_time': 30}
        
        avg_setup = sum(setup_times) / len(setup_times)
        min_setup = min(setup_times)
        
        # Target is 25% better than current minimum
        target_setup = min_setup * 0.75
        potential_savings = max(0, avg_setup - target_setup)
        
        return {
            'potential_savings_minutes': round(potential_savings, 1),
            'target_time_minutes': round(target_setup, 1),
            'current_average_minutes': round(avg_setup, 1)
        }
    
    def _get_setup_recommendations(self, avg_setup) -> List[str]:
        """Get setup time improvement recommendations"""
        recommendations = []
        
        if avg_setup > 60:
            recommendations.append("Consider pre-rigging equipment between scenes")
            recommendations.append("Implement parallel setup workflows with multiple crews")
        
        if avg_setup > 45:
            recommendations.append("Create detailed setup checklists for each location type")
            recommendations.append("Cross-train crew members to reduce dependency bottlenecks")
        
        if avg_setup > 30:
            recommendations.append("Review camera and lighting package efficiency")
            recommendations.append("Schedule equipment checks during breaks rather than setup time")
        
        return recommendations or ["Setup times are within acceptable range"]
    
    def _identify_schedule_bottlenecks(self, remaining_scenes) -> List[Dict]:
        """Identify potential schedule bottlenecks"""
        bottlenecks = []
        
        # Location-based bottlenecks
        location_counts = {}
        for scene in remaining_scenes:
            location = getattr(scene, 'location', 'Unknown')
            location_counts[location] = location_counts.get(location, 0) + 1
        
        for location, count in location_counts.items():
            if count > 10:  # Many scenes in one location
                bottlenecks.append({
                    'type': 'location_concentration',
                    'location': location,
                    'scene_count': count,
                    'risk_level': 'high' if count > 20 else 'medium'
                })
        
        # Complexity-based bottlenecks
        complex_scenes = [s for s in remaining_scenes if getattr(s, 'complexity', 'medium') == 'high']
        if len(complex_scenes) > 5:
            bottlenecks.append({
                'type': 'complexity_concentration',
                'complex_scene_count': len(complex_scenes),
                'risk_level': 'medium'
            })
        
        return bottlenecks
    
    def _calculate_percentile(self, value, benchmark) -> int:
        """Calculate percentile ranking against industry benchmark"""
        try:
            industry_avg = float(benchmark.industry_average)
            industry_best = float(benchmark.industry_best_25th or industry_avg * 1.2)
            industry_worst = float(benchmark.industry_worst_25th or industry_avg * 0.8)
            
            if value >= industry_best:
                return 90
            elif value >= industry_avg:
                # Linear interpolation between average and best
                ratio = (value - industry_avg) / (industry_best - industry_avg)
                return int(50 + (ratio * 40))
            else:
                # Linear interpolation between worst and average
                ratio = (value - industry_worst) / (industry_avg - industry_worst)
                return max(10, int(ratio * 40))
                
        except (ValueError, TypeError, ZeroDivisionError):
            return 50  # Default to median if calculation fails
    
    def _calculate_budget_prediction_confidence(self) -> float:
        """Calculate confidence for budget predictions"""
        cost_data_points = ProductionMetrics.objects.filter(
            production_id=self.production_id,
            cost_per_page__isnull=False
        ).count()
        
        # More data points = higher confidence
        base_confidence = min(85, cost_data_points * 5)
        
        # Adjust for cost variance
        if cost_data_points >= 5:
            recent_costs = list(ProductionMetrics.objects.filter(
                production_id=self.production_id,
                cost_per_page__isnull=False
            ).order_by('-date')[:5].values_list('cost_per_page', flat=True))
            
            if recent_costs:
                avg_cost = sum(float(c) for c in recent_costs) / len(recent_costs)
                variance = sum((float(c) - avg_cost) ** 2 for c in recent_costs) / len(recent_costs)
                cv = (variance ** 0.5) / avg_cost if avg_cost > 0 else 1
                
                # Lower variance = higher confidence
                variance_adjustment = max(-20, -cv * 30)
                base_confidence += variance_adjustment
        
        return round(max(40, min(95, base_confidence)), 1)