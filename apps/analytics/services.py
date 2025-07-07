from django.db.models import Avg, Sum, Count, Q, Max, Min
from django.utils import timezone
from datetime import datetime, timedelta, date
from decimal import Decimal
from apps.production.models import Production, Scene
from apps.schedule.models import ShootingDay, StatusUpdate
from apps.crew.models import CrewMember
from .models import ProductionMetrics, CrewPerformance, BudgetTracking, VelocityTrend

class AnalyticsEngine:
    """Core analytics engine for calculations and insights"""
    
    def __init__(self, production_id):
        self.production_id = production_id
        self.production = Production.objects.get(id=production_id)
    
    def get_metrics_summary(self, days_back=30):
        """Get overall metrics summary"""
        start_date = timezone.now().date() - timedelta(days=days_back)
        
        metrics = ProductionMetrics.objects.filter(
            production_id=self.production_id,
            date__gte=start_date
        )
        
        if not metrics.exists():
            return self._empty_metrics_summary()
        
        summary = metrics.aggregate(
            total_days=Count('id'),
            avg_efficiency=Avg('efficiency_score'),
            avg_velocity=Avg('velocity_score'),
            total_pages=Sum('pages_shot'),
            total_scenes=Sum('scenes_completed'),
            avg_schedule_variance=Avg('schedule_variance_minutes'),
            total_delays=Sum('weather_delays_minutes') + Sum('technical_delays_minutes'),
            avg_crew_overtime=Avg('crew_overtime_hours')
        )
        
        return {
            'period_days': days_back,
            'shooting_days': summary['total_days'] or 0,
            'average_efficiency': round(summary['avg_efficiency'] or 0, 1),
            'average_velocity': round(summary['avg_velocity'] or 0, 2),
            'total_pages_shot': summary['total_pages'] or 0,
            'total_scenes_completed': summary['total_scenes'] or 0,
            'schedule_variance_minutes': round(summary['avg_schedule_variance'] or 0, 0),
            'total_delay_minutes': summary['total_delays'] or 0,
            'average_overtime_hours': round(summary['avg_crew_overtime'] or 0, 1)
        }
    
    def get_velocity_trend(self, weeks_back=8):
        """Calculate velocity trend over time"""
        trends = VelocityTrend.objects.filter(
            production_id=self.production_id
        ).order_by('-week_ending')[:weeks_back]
        
        if not trends.exists():
            return self._calculate_velocity_trend()
        
        trend_data = []
        for trend in reversed(trends):
            trend_data.append({
                'week_ending': trend.week_ending,
                'pages_per_day': float(trend.pages_per_day),
                'scenes_per_day': float(trend.scenes_per_day),
                'velocity_trend': trend.velocity_trend,
                'days_ahead_behind': trend.days_ahead_behind
            })
        
        # Calculate overall trend direction
        if len(trend_data) >= 2:
            recent_velocity = trend_data[-1]['pages_per_day']
            older_velocity = trend_data[0]['pages_per_day']
            
            if recent_velocity > older_velocity * 1.1:
                overall_trend = 'increasing'
            elif recent_velocity < older_velocity * 0.9:
                overall_trend = 'decreasing'
            else:
                overall_trend = 'stable'
        else:
            overall_trend = 'insufficient_data'
        
        return {
            'trend_data': trend_data,
            'overall_trend': overall_trend,
            'current_velocity': trend_data[-1]['pages_per_day'] if trend_data else 0
        }
    
    def get_efficiency_breakdown(self):
        """Get detailed efficiency breakdown"""
        recent_metrics = ProductionMetrics.objects.filter(
            production_id=self.production_id,
            date__gte=timezone.now().date() - timedelta(days=7)
        )
        
        if not recent_metrics.exists():
            return self._empty_efficiency_breakdown()
        
        # Calculate efficiency factors
        avg_metrics = recent_metrics.aggregate(
            avg_completion_rate=Avg('scenes_completed') / Avg('scenes_scheduled') * 100,
            avg_schedule_variance=Avg('schedule_variance_minutes'),
            avg_equipment_issues=Avg('equipment_issues'),
            avg_takes_ratio=Avg('takes_good') / Avg('takes_total') * 100
        )
        
        # Time efficiency score
        schedule_variance = avg_metrics['avg_schedule_variance'] or 0
        if schedule_variance <= 0:
            time_efficiency = 100
        else:
            time_efficiency = max(0, 100 - (schedule_variance / 30 * 20))  # 20% penalty per 30 min delay
        
        # Quality efficiency score
        takes_ratio = avg_metrics['avg_takes_ratio'] or 80
        quality_efficiency = min(100, takes_ratio)
        
        # Resource efficiency score
        equipment_issues = avg_metrics['avg_equipment_issues'] or 0
        resource_efficiency = max(0, 100 - (equipment_issues * 10))  # 10% penalty per issue
        
        return {
            'overall_efficiency': round((time_efficiency + quality_efficiency + resource_efficiency) / 3, 1),
            'time_efficiency': round(time_efficiency, 1),
            'quality_efficiency': round(quality_efficiency, 1),
            'resource_efficiency': round(resource_efficiency, 1),
            'completion_rate': round(avg_metrics['avg_completion_rate'] or 0, 1),
            'average_takes_ratio': round(takes_ratio, 1),
            'schedule_variance_minutes': round(schedule_variance, 0)
        }
    
    def get_schedule_status(self):
        """Get current schedule status and projections"""
        # Get production calendar
        try:
            calendar = self.production.calendar
            total_shooting_days = self.production.shooting_days.count()
            completed_days = self.production.shooting_days.filter(status='completed').count()
            
            # Calculate progress
            today = timezone.now().date()
            days_elapsed = max(0, (today - calendar.principal_start).days)
            total_production_days = (calendar.principal_end - calendar.principal_start).days
            
            # Expected vs actual progress
            expected_completion = (days_elapsed / total_production_days) * 100 if total_production_days > 0 else 0
            actual_completion = (completed_days / total_shooting_days) * 100 if total_shooting_days > 0 else 0
            
            # Schedule variance
            schedule_variance = actual_completion - expected_completion
            
            # Status determination
            if schedule_variance >= 5:
                status = 'ahead'
            elif schedule_variance >= -5:
                status = 'on_track'
            else:
                status = 'behind'
            
            return {
                'status': status,
                'completion_percentage': round(actual_completion, 1),
                'expected_completion_percentage': round(expected_completion, 1),
                'schedule_variance_percentage': round(schedule_variance, 1),
                'total_shooting_days': total_shooting_days,
                'completed_shooting_days': completed_days,
                'remaining_shooting_days': total_shooting_days - completed_days,
                'days_elapsed': days_elapsed,
                'total_production_days': total_production_days
            }
        
        except Exception:
            return {
                'status': 'unknown',
                'message': 'Calendar not configured'
            }
    
    def get_budget_status(self):
        """Get current budget status"""
        budget_data = BudgetTracking.objects.filter(
            production_id=self.production_id
        )
        
        if not budget_data.exists():
            return {'status': 'no_data', 'message': 'No budget tracking data'}
        
        totals = budget_data.aggregate(
            total_spent=Sum('total_daily_cost'),
            total_planned=Sum('planned_daily_budget')
        )
        
        total_spent = totals['total_spent'] or 0
        total_planned = totals['total_planned'] or 0
        
        if total_planned == 0:
            return {'status': 'no_budget', 'message': 'No planned budget set'}
        
        variance_amount = total_spent - total_planned
        variance_percent = (variance_amount / total_planned) * 100
        
        # Status determination
        if variance_percent <= -10:
            status = 'significantly_under'
        elif variance_percent <= -2:
            status = 'under_budget'
        elif variance_percent <= 2:
            status = 'on_budget'
        elif variance_percent <= 10:
            status = 'over_budget'
        else:
            status = 'significantly_over'
        
        return {
            'status': status,
            'total_spent': float(total_spent),
            'total_planned': float(total_planned),
            'variance_amount': float(variance_amount),
            'variance_percentage': round(variance_percent, 2),
            'spending_rate': float(total_spent / budget_data.count()) if budget_data.count() > 0 else 0
        }
    
    def get_crew_performance_summary(self):
        """Get crew performance overview"""
        recent_performance = CrewPerformance.objects.filter(
            production_id=self.production_id,
            date__gte=timezone.now().date() - timedelta(days=7)
        )
        
        if not recent_performance.exists():
            return {'status': 'no_data', 'message': 'No crew performance data'}
        
        # Calculate averages
        averages = recent_performance.aggregate(
            avg_punctuality=Avg('punctuality_rating'),
            avg_quality=Avg('quality_rating'),
            avg_teamwork=Avg('teamwork_rating'),
            avg_efficiency=Avg('efficiency_rating'),
            avg_late_minutes=Avg('late_minutes'),
            total_overtime=Sum('overtime_hours')
        )
        
        # Overall performance score
        overall_score = (
            (averages['avg_punctuality'] or 0) +
            (averages['avg_quality'] or 0) +
            (averages['avg_teamwork'] or 0) +
            (averages['avg_efficiency'] or 0)
        ) / 4
        
        return {
            'overall_score': round(overall_score, 1),
            'average_punctuality': round(averages['avg_punctuality'] or 0, 1),
            'average_quality': round(averages['avg_quality'] or 0, 1),
            'average_teamwork': round(averages['avg_teamwork'] or 0, 1),
            'average_efficiency': round(averages['avg_efficiency'] or 0, 1),
            'average_late_minutes': round(averages['avg_late_minutes'] or 0, 1),
            'total_overtime_hours': averages['total_overtime'] or 0,
            'crew_count': recent_performance.values('crew_member').distinct().count()
        }
    
    def get_recent_alerts(self):
        """Get recent alerts and issues"""
        # This would integrate with notifications system
        recent_metrics = ProductionMetrics.objects.filter(
            production_id=self.production_id,
            date__gte=timezone.now().date() - timedelta(days=3)
        )
        
        alerts = []
        
        for metric in recent_metrics:
            # Schedule alerts
            if metric.schedule_variance_minutes > 60:
                alerts.append({
                    'type': 'schedule_delay',
                    'severity': 'high' if metric.schedule_variance_minutes > 120 else 'medium',
                    'message': f'Running {metric.schedule_variance_minutes} minutes behind schedule',
                    'date': metric.date
                })
            
            # Efficiency alerts
            if metric.efficiency_score < 60:
                alerts.append({
                    'type': 'low_efficiency',
                    'severity': 'high' if metric.efficiency_score < 40 else 'medium',
                    'message': f'Low efficiency score: {metric.efficiency_score}%',
                    'date': metric.date
                })
            
            # Equipment alerts
            if metric.equipment_issues > 2:
                alerts.append({
                    'type': 'equipment_issues',
                    'severity': 'medium',
                    'message': f'{metric.equipment_issues} equipment issues reported',
                    'date': metric.date
                })
        
        return sorted(alerts, key=lambda x: x['date'], reverse=True)[:5]
    
    def get_completion_forecast(self):
        """Generate completion date forecast"""
        # Get recent velocity data
        recent_metrics = ProductionMetrics.objects.filter(
            production_id=self.production_id,
            date__gte=timezone.now().date() - timedelta(days=14)
        ).order_by('-date')
        
        if not recent_metrics.exists():
            return {'status': 'insufficient_data'}
        
        # Calculate average velocity
        avg_velocity = recent_metrics.aggregate(
            avg_pages_per_day=Avg('pages_shot'),
            avg_scenes_per_day=Avg('scenes_completed')
        )
        
        pages_per_day = avg_velocity['avg_pages_per_day'] or 0
        scenes_per_day = avg_velocity['avg_scenes_per_day'] or 0
        
        # Get remaining work
        total_scenes = self.production.scenes.count()
        completed_scenes = self.production.scenes.filter(status='completed').count()
        remaining_scenes = total_scenes - completed_scenes
        
        # Calculate estimated completion
        if scenes_per_day > 0:
            estimated_days_remaining = remaining_scenes / scenes_per_day
            estimated_completion_date = timezone.now().date() + timedelta(days=estimated_days_remaining)
        else:
            estimated_completion_date = None
        
        # Compare with planned completion
        try:
            planned_completion = self.production.calendar.principal_end
            if estimated_completion_date:
                variance_days = (estimated_completion_date - planned_completion).days
            else:
                variance_days = None
        except:
            planned_completion = None
            variance_days = None
        
        return {
            'estimated_completion_date': estimated_completion_date,
            'planned_completion_date': planned_completion,
            'variance_days': variance_days,
            'remaining_scenes': remaining_scenes,
            'current_velocity_scenes_per_day': round(scenes_per_day, 2),
            'current_velocity_pages_per_day': round(pages_per_day, 2),
            'confidence_level': self._calculate_forecast_confidence(recent_metrics)
        }
    
    def get_kpi_cards(self):
        """Get KPI cards data for dashboard"""
        summary = self.get_metrics_summary(7)  # Last 7 days
        schedule = self.get_schedule_status()
        budget = self.get_budget_status()
        
        cards = [
            {
                'title': 'Efficiency Score',
                'value': f"{summary['average_efficiency']}%",
                'trend': 'up' if summary['average_efficiency'] > 80 else 'down',
                'trend_percentage': 5.2,
                'status': 'good' if summary['average_efficiency'] > 80 else 'warning',
                'subtitle': 'Last 7 days average'
            },
            {
                'title': 'Schedule Status',
                'value': schedule['status'].replace('_', ' ').title(),
                'trend': 'stable',
                'trend_percentage': 0,
                'status': 'good' if schedule['status'] == 'on_track' else 'warning',
                'subtitle': f"{schedule.get('completion_percentage', 0)}% complete"
            },
            {
                'title': 'Budget Status',
                'value': budget['status'].replace('_', ' ').title(),
                'trend': 'up' if budget.get('variance_percentage', 0) > 0 else 'down',
                'trend_percentage': abs(budget.get('variance_percentage', 0)),
                'status': 'good' if budget['status'] == 'on_budget' else 'warning',
                'subtitle': f"${budget.get('total_spent', 0):,.0f} spent"
            },
            {
                'title': 'Pages Shot',
                'value': str(summary['total_pages_shot']),
                'trend': 'up',
                'trend_percentage': 15.3,
                'status': 'good',
                'subtitle': f"Velocity: {summary['average_velocity']} pages/day"
            }
        ]
        
        return cards
    
    def _empty_metrics_summary(self):
        """Return empty metrics summary structure"""
        return {
            'period_days': 0,
            'shooting_days': 0,
            'average_efficiency': 0,
            'average_velocity': 0,
            'total_pages_shot': 0,
            'total_scenes_completed': 0,
            'schedule_variance_minutes': 0,
            'total_delay_minutes': 0,
            'average_overtime_hours': 0
        }
    
    def _empty_efficiency_breakdown(self):
        """Return empty efficiency breakdown structure"""
        return {
            'overall_efficiency': 0,
            'time_efficiency': 0,
            'quality_efficiency': 0,
            'resource_efficiency': 0,
            'completion_rate': 0,
            'average_takes_ratio': 0,
            'schedule_variance_minutes': 0
        }
    
    def _calculate_velocity_trend(self):
        """Calculate velocity trend from raw metrics"""
        # Fallback calculation when VelocityTrend records don't exist
        recent_metrics = ProductionMetrics.objects.filter(
            production_id=self.production_id
        ).order_by('-date')[:14]  # Last 2 weeks
        
        if recent_metrics.count() < 7:
            return {'trend_data': [], 'overall_trend': 'insufficient_data', 'current_velocity': 0}
        
        # Simple trend calculation
        first_week = recent_metrics[7:]
        second_week = recent_metrics[:7]
        
        first_week_avg = first_week.aggregate(avg_pages=Avg('pages_shot'))['avg_pages'] or 0
        second_week_avg = second_week.aggregate(avg_pages=Avg('pages_shot'))['avg_pages'] or 0
        
        if first_week_avg == 0:
            trend = 'stable'
        elif second_week_avg > first_week_avg * 1.1:
            trend = 'increasing'
        elif second_week_avg < first_week_avg * 0.9:
            trend = 'decreasing'
        else:
            trend = 'stable'
        
        return {
            'trend_data': [],
            'overall_trend': trend,
            'current_velocity': second_week_avg
        }
    
    def _calculate_forecast_confidence(self, recent_metrics):
        """Calculate confidence level for forecast"""
        if recent_metrics.count() < 5:
            return 'low'
        
        # Check consistency of recent performance
        velocities = [float(m.velocity_score) for m in recent_metrics if m.velocity_score > 0]
        if not velocities:
            return 'low'
        
        # Calculate coefficient of variation
        import statistics
        if len(velocities) > 1:
            mean_velocity = statistics.mean(velocities)
            std_velocity = statistics.stdev(velocities)
            cv = std_velocity / mean_velocity if mean_velocity > 0 else 1
            
            if cv < 0.2:
                return 'high'
            elif cv < 0.4:
                return 'medium'
            else:
                return 'low'
        
        return 'medium'

class ReportGenerator:
    """Generate various analytics reports"""
    
    def __init__(self, production_id):
        self.production_id = production_id
        self.analytics_engine = AnalyticsEngine(production_id)
    
    def generate_progress_report(self, report_type, period_start, period_end):
        """Generate progress report for given period"""
        period_start = datetime.strptime(period_start, '%Y-%m-%d').date()
        period_end = datetime.strptime(period_end, '%Y-%m-%d').date()
        
        # Get metrics for the period
        period_metrics = ProductionMetrics.objects.filter(
            production_id=self.production_id,
            date__gte=period_start,
            date__lte=period_end
        )
        
        if not period_metrics.exists():
            return self._empty_progress_report()
        
        # Calculate aggregates
        aggregates = period_metrics.aggregate(
            total_shooting_days=Count('id'),
            total_scenes_shot=Sum('scenes_completed'),
            total_pages_shot=Sum('pages_shot'),
            avg_efficiency=Avg('efficiency_score'),
            avg_schedule_variance=Avg('schedule_variance_minutes'),
            total_equipment_issues=Sum('equipment_issues'),
            weather_delay_days=Count('id', filter=Q(weather_delays_minutes__gt=0))
        )
        
        # Budget data
        budget_data = BudgetTracking.objects.filter(
            production_id=self.production_id,
            date__gte=period_start,
            date__lte=period_end
        ).aggregate(
            total_spent=Sum('total_daily_cost'),
            total_planned=Sum('planned_daily_budget')
        )
        
        total_spent = budget_data['total_spent'] or 0
        total_planned = budget_data['total_planned'] or 0
        budget_variance = ((total_spent - total_planned) / total_planned * 100) if total_planned > 0 else 0
        
        # Generate summaries
        executive_summary = self._generate_executive_summary(aggregates, budget_variance)
        key_achievements = self._generate_key_achievements(aggregates)
        challenges_faced = self._generate_challenges(aggregates)
        
        return {
            'total_shooting_days': aggregates['total_shooting_days'],
            'total_scenes_shot': aggregates['total_scenes_shot'] or 0,
            'total_pages_shot': aggregates['total_pages_shot'] or 0,
            'average_pages_per_day': (aggregates['total_pages_shot'] or 0) / max(1, aggregates['total_shooting_days']),
            'days_on_schedule': max(0, aggregates['total_shooting_days'] - 
                                  period_metrics.filter(schedule_variance_minutes__gt=30).count()),
            'days_behind_schedule': period_metrics.filter(schedule_variance_minutes__gt=30).count(),
            'average_delay_minutes': aggregates['avg_schedule_variance'] or 0,
            'total_spent': total_spent,
            'budget_variance_percent': budget_variance,
            'average_efficiency_score': aggregates['avg_efficiency'] or 0,
            'equipment_issues_count': aggregates['total_equipment_issues'] or 0,
            'weather_delay_days': aggregates['weather_delay_days'] or 0,
            'script_completion_percent': self._calculate_script_completion(),
            'schedule_completion_percent': self._calculate_schedule_completion(),
            'executive_summary': executive_summary,
            'key_achievements': key_achievements,
            'challenges_faced': challenges_faced,
            'next_period_forecast': self._generate_forecast()
        }
    
    def _empty_progress_report(self):
        """Return empty progress report structure"""
        return {
            'total_shooting_days': 0,
            'total_scenes_shot': 0,
            'total_pages_shot': 0,
            'average_pages_per_day': 0,
            'days_on_schedule': 0,
            'days_behind_schedule': 0,
            'average_delay_minutes': 0,
            'total_spent': 0,
            'budget_variance_percent': 0,
            'average_efficiency_score': 0,
            'equipment_issues_count': 0,
            'weather_delay_days': 0,
            'script_completion_percent': 0,
            'schedule_completion_percent': 0,
            'executive_summary': 'No data available for this period.',
            'key_achievements': 'No achievements recorded.',
            'challenges_faced': 'No challenges recorded.',
            'next_period_forecast': 'Insufficient data for forecasting.'
        }
    
    def _generate_executive_summary(self, aggregates, budget_variance):
        """Generate executive summary text"""
        days = aggregates['total_shooting_days']
        pages = aggregates['total_pages_shot'] or 0
        efficiency = aggregates['avg_efficiency'] or 0
        
        summary = f"During this period, we completed {days} shooting days and shot {pages} script pages. "
        summary += f"Average efficiency score was {efficiency:.1f}%. "
        
        if budget_variance > 5:
            summary += f"Budget exceeded planned spending by {budget_variance:.1f}%. "
        elif budget_variance < -5:
            summary += f"Production came in {abs(budget_variance):.1f}% under budget. "
        else:
            summary += "Budget performance was on target. "
        
        return summary
    
    def _generate_key_achievements(self, aggregates):
        """Generate key achievements text"""
        achievements = []
        
        if aggregates['avg_efficiency'] and aggregates['avg_efficiency'] > 85:
            achievements.append("Maintained high efficiency scores above 85%")
        
        if aggregates['total_pages_shot'] and aggregates['total_shooting_days']:
            pages_per_day = aggregates['total_pages_shot'] / aggregates['total_shooting_days']
            if pages_per_day > 3:
                achievements.append(f"Achieved strong velocity of {pages_per_day:.1f} pages per day")
        
        if aggregates['total_equipment_issues'] == 0:
            achievements.append("Zero equipment issues reported")
        
        return " • ".join(achievements) if achievements else "Standard production progress maintained."
    
    def _generate_challenges(self, aggregates):
        """Generate challenges text"""
        challenges = []
        
        if aggregates['avg_schedule_variance'] and aggregates['avg_schedule_variance'] > 60:
            challenges.append(f"Schedule delays averaging {aggregates['avg_schedule_variance']:.0f} minutes per day")
        
        if aggregates['total_equipment_issues'] and aggregates['total_equipment_issues'] > 5:
            challenges.append(f"{aggregates['total_equipment_issues']} equipment issues impacted production")
        
        if aggregates['weather_delay_days'] and aggregates['weather_delay_days'] > 2:
            challenges.append(f"Weather delays affected {aggregates['weather_delay_days']} shooting days")
        
        return " • ".join(challenges) if challenges else "No major challenges encountered."
    
    def _generate_forecast(self):
        """Generate next period forecast"""
        forecast_data = self.analytics_engine.get_completion_forecast()
        
        if forecast_data.get('status') == 'insufficient_data':
            return "Insufficient data for reliable forecasting."
        
        velocity = forecast_data.get('current_velocity_pages_per_day', 0)
        remaining = forecast_data.get('remaining_scenes', 0)
        
        forecast = f"Based on current velocity of {velocity:.1f} pages per day, "
        forecast += f"estimated {remaining} remaining scenes should complete by "
        forecast += f"{forecast_data.get('estimated_completion_date', 'TBD')}."
        
        return forecast
    
    def _calculate_script_completion(self):
        """Calculate script completion percentage"""
        try:
            total_scenes = Scene.objects.filter(production_id=self.production_id).count()
            completed_scenes = Scene.objects.filter(
                production_id=self.production_id,
                status='completed'
            ).count()
            
            return (completed_scenes / total_scenes * 100) if total_scenes > 0 else 0
        except:
            return 0
    
    def _calculate_schedule_completion(self):
        """Calculate schedule completion percentage"""
        try:
            total_days = ShootingDay.objects.filter(production_id=self.production_id).count()
            completed_days = ShootingDay.objects.filter(
                production_id=self.production_id,
                status='completed'
            ).count()
            
            return (completed_days / total_days * 100) if total_days > 0 else 0
        except:
            return 0