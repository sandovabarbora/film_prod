# apps/analytics/serializers/__init__.py
from .dashboard import *

__all__ = [
    'DashboardDataSerializer',
    'VelocityAnalysisSerializer',
    'EfficiencyBreakdownSerializer',
    'PredictiveInsightsSerializer',
    'RealTimeMetricsSerializer',
    'ProductionMetricsSerializer',
    'VelocityTrendSerializer'
]