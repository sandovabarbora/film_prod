import api from './api'

const analyticsApi = {
  // Dashboard endpoints
  getDashboardOverview(productionId, timeframe = '30d') {
    return api.get('/analytics/dashboard/overview/', {
      params: { production_id: productionId, timeframe }
    })
  },

  getVelocityAnalysis(productionId) {
    return api.get('/analytics/dashboard/velocity_analysis/', {
      params: { production_id: productionId }
    })
  },

  getEfficiencyBreakdown(productionId) {
    return api.get('/analytics/dashboard/efficiency_breakdown/', {
      params: { production_id: productionId }
    })
  },

  getPredictiveInsights(productionId) {
    return api.get('/analytics/dashboard/predictive_insights/', {
      params: { production_id: productionId }
    })
  },

  getRealTimeMetrics(productionId) {
    return api.get('/analytics/dashboard/real_time_metrics/', {
      params: { production_id: productionId }
    })
  },

  // Metrics calculation
  calculateDailyMetrics(productionId, date) {
    return api.post('/analytics/metrics/calculate_daily_metrics/', {
      production_id: productionId,
      date: date
    })
  },

  recalculateAllMetrics(productionId) {
    return api.post('/analytics/metrics/recalculate_all/', {
      production_id: productionId
    })
  },

  // Specific analytics endpoints
  getVelocityTrend(productionId, days = 30) {
    return api.get('/analytics/velocity/trend/', {
      params: { production_id: productionId, days }
    })
  },

  getEfficiencyScore(productionId) {
    return api.get('/analytics/efficiency/score/', {
      params: { production_id: productionId }
    })
  },

  getScheduleAnalysis(productionId) {
    return api.get('/analytics/schedule/analysis/', {
      params: { production_id: productionId }
    })
  },

  getCostAnalysis(productionId, timeframe = '30d') {
    return api.get('/analytics/costs/analysis/', {
      params: { production_id: productionId, timeframe }
    })
  },

  // Comparison and benchmarks
  getIndustryBenchmarks(productionType = 'feature') {
    return api.get('/analytics/benchmarks/', {
      params: { production_type: productionType }
    })
  },

  compareProductions(productionIds) {
    return api.post('/analytics/compare/', {
      production_ids: productionIds
    })
  },

  // Predictions and forecasts
  getCompletionForecast(productionId) {
    return api.get('/analytics/predictions/completion/', {
      params: { production_id: productionId }
    })
  },

  getBudgetForecast(productionId) {
    return api.get('/analytics/predictions/budget/', {
      params: { production_id: productionId }
    })
  },

  getRiskAnalysis(productionId) {
    return api.get('/analytics/predictions/risks/', {
      params: { production_id: productionId }
    })
  },

  // Optimization suggestions
  getScheduleOptimization(productionId) {
    return api.get('/analytics/optimization/schedule/', {
      params: { production_id: productionId }
    })
  },

  getResourceOptimization(productionId) {
    return api.get('/analytics/optimization/resources/', {
      params: { production_id: productionId }
    })
  },

  // Export and reporting
  exportMetrics(productionId, format = 'csv', timeframe = '30d') {
    return api.get('/analytics/export/metrics/', {
      params: { 
        production_id: productionId, 
        format,
        timeframe 
      },
      responseType: 'blob'
    })
  },

  generateReport(productionId, reportType = 'summary') {
    return api.post('/analytics/reports/generate/', {
      production_id: productionId,
      report_type: reportType
    })
  },

  getReportStatus(reportId) {
    return api.get(`/analytics/reports/${reportId}/status/`)
  },

  downloadReport(reportId) {
    return api.get(`/analytics/reports/${reportId}/download/`, {
      responseType: 'blob'
    })
  }
}

export default analyticsApi