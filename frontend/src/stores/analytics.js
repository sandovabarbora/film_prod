import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import analyticsApi from '@/utils/analytics-api'

export const useAnalyticsStore = defineStore('analytics', () => {
  // State
  const dashboardData = ref({})
  const velocityData = ref({})
  const efficiencyData = ref({})
  const predictiveData = ref({})
  const realTimeMetrics = ref({})
  const isLoading = ref(false)
  const error = ref(null)

  // Computed
  const chartData = computed(() => ({
    velocity: dashboardData.value.timeline_data?.map(item => ({
      date: item.date,
      pages: item.pages_shot,
      trend: item.pages_shot // Could add moving average
    })) || [],
    
    efficiency: dashboardData.value.timeline_data?.map(item => ({
      date: item.date,
      score: item.efficiency_score,
      shootRatio: item.shoot_ratio
    })) || [],
    
    costs: dashboardData.value.timeline_data?.map(item => ({
      date: item.date,
      costPerPage: item.cost_per_page,
      totalCost: item.cost_per_page * item.pages_shot
    })) || []
  }))

  const currentVelocity = computed(() => {
    return dashboardData.value.velocity?.current || 0
  })

  const efficiencyScore = computed(() => {
    return dashboardData.value.efficiency?.score || 0
  })

  const scheduleStatus = computed(() => {
    const variance = dashboardData.value.schedule?.variance_days || 0
    return {
      variance,
      status: variance > 0 ? 'behind' : variance < 0 ? 'ahead' : 'on-track',
      message: variance > 0 ? `${variance} days behind` : 
               variance < 0 ? `${Math.abs(variance)} days ahead` : 
               'On schedule'
    }
  })

  // Actions
  const loadDashboardData = async ({ productionId, timeframe = '30d' }) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await analyticsApi.getDashboardOverview(productionId, timeframe)
      dashboardData.value = response.data
    } catch (err) {
      error.value = err.message
      console.error('Failed to load dashboard data:', err)
    } finally {
      isLoading.value = false
    }
  }

  const loadVelocityAnalysis = async (productionId) => {
    try {
      const response = await analyticsApi.getVelocityAnalysis(productionId)
      velocityData.value = response.data
    } catch (err) {
      error.value = err.message
      console.error('Failed to load velocity analysis:', err)
    }
  }

  const loadEfficiencyBreakdown = async (productionId) => {
    try {
      const response = await analyticsApi.getEfficiencyBreakdown(productionId)
      efficiencyData.value = response.data
    } catch (err) {
      error.value = err.message
      console.error('Failed to load efficiency breakdown:', err)
    }
  }

  const loadPredictiveInsights = async (productionId) => {
    try {
      const response = await analyticsApi.getPredictiveInsights(productionId)
      predictiveData.value = response.data
    } catch (err) {
      error.value = err.message
      console.error('Failed to load predictive insights:', err)
    }
  }

  const updateRealTimeMetrics = async (productionId) => {
    try {
      const response = await analyticsApi.getRealTimeMetrics(productionId)
      realTimeMetrics.value = response.data
    } catch (err) {
      console.error('Failed to update real-time metrics:', err)
    }
  }

  const calculateDailyMetrics = async (productionId, date) => {
    try {
      const response = await analyticsApi.calculateDailyMetrics(productionId, date)
      
      // Update dashboard data if it's for today
      const today = new Date().toISOString().split('T')[0]
      if (date === today && response.data.metrics) {
        // Update the current day's metrics in timeline data
        const timelineData = dashboardData.value.timeline_data || []
        const existingIndex = timelineData.findIndex(item => item.date === date)
        
        if (existingIndex >= 0) {
          timelineData[existingIndex] = {
            ...timelineData[existingIndex],
            ...response.data.metrics
          }
        } else {
          timelineData.push({
            date,
            ...response.data.metrics
          })
        }
        
        dashboardData.value.timeline_data = timelineData
      }
      
      return response.data
    } catch (err) {
      error.value = err.message
      console.error('Failed to calculate daily metrics:', err)
      throw err
    }
  }

  const recalculateAllMetrics = async (productionId) => {
    try {
      const response = await analyticsApi.recalculateAllMetrics(productionId)
      
      // Reload dashboard data after recalculation
      await loadDashboardData({ productionId })
      
      return response.data
    } catch (err) {
      error.value = err.message
      console.error('Failed to recalculate metrics:', err)
      throw err
    }
  }

  const clearData = () => {
    dashboardData.value = {}
    velocityData.value = {}
    efficiencyData.value = {}
    predictiveData.value = {}
    realTimeMetrics.value = {}
    error.value = null
  }

  // Real-time updates
  const setupRealTimeUpdates = (productionId) => {
    // Update metrics every 30 seconds
    const interval = setInterval(() => {
      updateRealTimeMetrics(productionId)
    }, 30000)

    // Return cleanup function
    return () => {
      clearInterval(interval)
    }
  }

  // Utility functions for data processing
  const processTimelineData = (rawData) => {
    return rawData.map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString(),
      efficiency_score: item.efficiency_score || 0,
      pages_shot: Number(item.pages_shot) || 0
    }))
  }

  const calculateTrends = (data, metric) => {
    if (!data || data.length < 2) return null
    
    const values = data.map(item => item[metric]).filter(val => val != null)
    if (values.length < 2) return null
    
    const recent = values.slice(-3).reduce((sum, val) => sum + val, 0) / 3
    const previous = values.slice(-6, -3).reduce((sum, val) => sum + val, 0) / 3
    
    return previous > 0 ? ((recent - previous) / previous * 100) : 0
  }

  const getInsightSummary = computed(() => {
    const insights = dashboardData.value.insights || []
    return {
      total: insights.length,
      critical: insights.filter(i => i.priority === 'high').length,
      recommendations: insights.filter(i => i.type === 'recommendation').length
    }
  })

  return {
    // State
    dashboardData,
    velocityData,
    efficiencyData,
    predictiveData,
    realTimeMetrics,
    isLoading,
    error,
    
    // Computed
    chartData,
    currentVelocity,
    efficiencyScore,
    scheduleStatus,
    getInsightSummary,
    
    // Actions
    loadDashboardData,
    loadVelocityAnalysis,
    loadEfficiencyBreakdown,
    loadPredictiveInsights,
    updateRealTimeMetrics,
    calculateDailyMetrics,
    recalculateAllMetrics,
    clearData,
    setupRealTimeUpdates,
    
    // Utilities
    processTimelineData,
    calculateTrends
  }
})