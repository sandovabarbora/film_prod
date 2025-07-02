import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/utils/api'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const user = ref(null)

  const login = async (username, password) => {
    try {
      // Pro MVP - jednoduché session auth
      const response = await api.post('/auth/login/', { username, password })
      isAuthenticated.value = true
      user.value = response.data.user
      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  const quickAuth = async () => {
    // Pro MVP - nastav jako authenticated
    isAuthenticated.value = true
    user.value = { username: 'demo_user' }
  }

  return {
    isAuthenticated,
    user,
    login,
    quickAuth
  }
})

export const useProductionStore = defineStore('production', () => {
  const productions = ref([])
  const currentProduction = ref(null)
  const liveData = ref(null)
  const isLoading = ref(false)

  const activeProduction = computed(() => {
    return productions.value.find(p => p.status === 'shoot') || productions.value[0]
  })

  const fetchProductions = async () => {
    isLoading.value = true
    try {
      const response = await api.get('/production/productions/')
      productions.value = response.data.results || response.data
    } catch (error) {
      console.error('Error fetching productions:', error)
      // Pro MVP - použij mock data pokud API selže
      productions.value = [{
        id: '1',
        title: 'The Last Stand',
        director: 'Jane Smith',
        producer: 'Bob Johnson',
        status: 'shoot',
        scenes_count: 5,
        completion_percentage: 40,
        start_date: '2025-06-27',
        end_date: '2025-07-27'
      }]
    } finally {
      isLoading.value = false
    }
  }

  const fetchProduction = async (id) => {
    isLoading.value = true
    try {
      const response = await api.get(`/production/productions/${id}/`)
      currentProduction.value = response.data
      return response.data
    } catch (error) {
      console.error('Error fetching production:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const fetchLiveDashboard = async (id) => {
    try {
      const response = await api.get(`/production/productions/${id}/dashboard/`)
      liveData.value = response.data
      return response.data
    } catch (error) {
      console.error('Error fetching live dashboard:', error)
      throw error
    }
  }

  const updateStatus = async (productionId, statusData) => {
    try {
      const response = await api.post(`/production/productions/${productionId}/update_status/`, statusData)
      await fetchLiveDashboard(productionId)
      return response.data
    } catch (error) {
      console.error('Error updating status:', error)
      throw error
    }
  }

  return {
    productions,
    currentProduction,
    liveData,
    isLoading,
    activeProduction,
    fetchProductions,
    fetchProduction,
    fetchLiveDashboard,
    updateStatus
  }
})

export const useSceneStore = defineStore('scene', () => {
  const scenes = ref([])
  const currentScene = ref(null)
  const isLoading = ref(false)

  const scenesByStatus = computed(() => {
    return scenes.value.reduce((acc, scene) => {
      acc[scene.status] = acc[scene.status] || []
      acc[scene.status].push(scene)
      return acc
    }, {})
  })

  const fetchScenes = async (productionId) => {
    isLoading.value = true
    try {
      const response = await api.get('/production/scenes/', {
        params: { production: productionId }
      })
      scenes.value = response.data.results || response.data
    } catch (error) {
      console.error('Error fetching scenes:', error)
    } finally {
      isLoading.value = false
    }
  }

  const markSceneCompleted = async (sceneId) => {
    try {
      await api.post(`/production/scenes/${sceneId}/mark_completed/`)
      const scene = scenes.value.find(s => s.id === sceneId)
      if (scene) {
        scene.status = 'completed'
      }
    } catch (error) {
      console.error('Error marking scene completed:', error)
      throw error
    }
  }

  return {
    scenes,
    currentScene,
    isLoading,
    scenesByStatus,
    fetchScenes,
    markSceneCompleted
  }
})

export const useShotStore = defineStore('shot', () => {
  const shots = ref([])
  const currentShot = ref(null)
  const isLoading = ref(false)

  const fetchShots = async (sceneId) => {
    isLoading.value = true
    try {
      const response = await api.get('/production/shots/', {
        params: { scene: sceneId }
      })
      shots.value = response.data.results || response.data
    } catch (error) {
      console.error('Error fetching shots:', error)
    } finally {
      isLoading.value = false
    }
  }

  const updateShotStatus = async (shotId, status) => {
    try {
      const response = await api.post(`/production/shots/${shotId}/update_status/`, { status })
      const shot = shots.value.find(s => s.id === shotId)
      if (shot) {
        shot.status = status
      }
      return response.data
    } catch (error) {
      console.error('Error updating shot status:', error)
      throw error
    }
  }

  const addTake = async (shotId, takeData) => {
    try {
      const response = await api.post(`/production/shots/${shotId}/add_take/`, takeData)
      const shot = shots.value.find(s => s.id === shotId)
      if (shot) {
        shot.takes_completed += 1
        if (takeData.result === 'good' || takeData.result === 'print') {
          shot.takes_good += 1
        }
      }
      return response.data
    } catch (error) {
      console.error('Error adding take:', error)
      throw error
    }
  }

  return {
    shots,
    currentShot,
    isLoading,
    fetchShots,
    updateShotStatus,
    addTake
  }
})

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const activeNotifications = computed(() => {
    return notifications.value.filter(n => !n.dismissed)
  })

  const addNotification = (notification) => {
    const id = Date.now() + Math.random()
    notifications.value.push({
      id,
      ...notification,
      timestamp: new Date(),
      dismissed: false
    })

    if (notification.autoClose !== false) {
      setTimeout(() => {
        dismissNotification(id)
      }, notification.duration || 5000)
    }

    return id
  }

  const dismissNotification = (id) => {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.dismissed = true
    }
  }

  const showSuccess = (title, message) => {
    return addNotification({ type: 'success', title, message })
  }

  const showError = (title, message) => {
    return addNotification({ type: 'error', title, message, autoClose: false })
  }

  const showWarning = (title, message) => {
    return addNotification({ type: 'warning', title, message })
  }

  const showInfo = (title, message) => {
    return addNotification({ type: 'info', title, message })
  }

  return {
    notifications,
    activeNotifications,
    addNotification,
    dismissNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
})