// frontend/src/services/api.js
import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:8000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  async login(credentials) {
    const response = await api.post('/auth/login/', credentials)
    return response.data
  },
  
  async register(userData) {
    const response = await api.post('/auth/register/', userData)
    return response.data
  },
  
  async refreshToken(refreshToken) {
    const response = await api.post('/auth/token/refresh/', {
      refresh: refreshToken
    })
    return response.data
  },
  
  async getCurrentUser() {
    const response = await api.get('/auth/user/')
    return response.data
  },
  
  async logout() {
    const refreshToken = localStorage.getItem('refresh_token')
    if (refreshToken) {
      await api.post('/auth/logout/', { refresh: refreshToken })
    }
  }
}

// Production API
export const productionAPI = {
  async getProductions() {
    const response = await api.get('/production/productions/')
    return response.data
  },
  
  async getProduction(id) {
    const response = await api.get(`/production/productions/${id}/`)
    return response.data
  },
  
  async createProduction(data) {
    const response = await api.post('/production/productions/', data)
    return response.data
  },
  
  async updateProduction(id, data) {
    const response = await api.patch(`/production/productions/${id}/`, data)
    return response.data
  },
  
  async deleteProduction(id) {
    await api.delete(`/production/productions/${id}/`)
  },
  
  // Scenes
  async getScenes(productionId) {
    const response = await api.get(`/production/scenes/?production=${productionId}`)
    return response.data
  },
  
  async createScene(data) {
    const response = await api.post('/production/scenes/', data)
    return response.data
  },
  
  // Shots
  async getShots(sceneId) {
    const response = await api.get(`/production/shots/?scene=${sceneId}`)
    return response.data
  },
  
  async createShot(data) {
    const response = await api.post('/production/shots/', data)
    return response.data
  }
}

// Crew API
export const crewAPI = {
  async getCrewMembers(productionId) {
    const response = await api.get(`/crew/members/?production=${productionId}`)
    return response.data
  },
  
  async addCrewMember(data) {
    const response = await api.post('/crew/members/', data)
    return response.data
  },
  
  async updateCrewMember(id, data) {
    const response = await api.patch(`/crew/members/${id}/`, data)
    return response.data
  },
  
  async getDepartments() {
    const response = await api.get('/crew/departments/')
    return response.data
  }
}

// Schedule API
export const scheduleAPI = {
  async getShootingDays(productionId) {
    const response = await api.get(`/schedule/shooting-days/?production=${productionId}`)
    return response.data
  },
  
  async createShootingDay(data) {
    const response = await api.post('/schedule/shooting-days/', data)
    return response.data
  },
  
  async getSchedule(productionId, date) {
    const response = await api.get(`/schedule/scene-schedules/?production=${productionId}&date=${date}`)
    return response.data
  }
}

// Realtime API
export const realtimeAPI = {
  // Connections
  async getActiveConnections(productionId) {
    const response = await api.get(`/realtime/connections/active/?production_id=${productionId}`)
    return response.data
  },
  
  // Events
  async getRecentEvents(productionId, hours = 24) {
    const response = await api.get(`/realtime/events/recent/?production_id=${productionId}&hours=${hours}`)
    return response.data
  },
  
  async createEvent(data) {
    const response = await api.post('/realtime/events/', data)
    return response.data
  },
  
  // Chat Rooms
  async getChatRooms(productionId) {
    const response = await api.get(`/realtime/chat-rooms/?production=${productionId}`)
    return response.data
  },
  
  async createChatRoom(data) {
    const response = await api.post('/realtime/chat-rooms/', data)
    return response.data
  },
  
  async joinChatRoom(roomId) {
    const response = await api.post(`/realtime/chat-rooms/${roomId}/join/`)
    return response.data
  },
  
  // Messages
  async getChatMessages(roomId, limit = 50, offset = 0) {
    const response = await api.get(`/realtime/messages/by_room/?room_id=${roomId}&limit=${limit}&offset=${offset}`)
    return response.data
  },
  
  async markMessageAsRead(messageId) {
    const response = await api.post(`/realtime/messages/${messageId}/mark_read/`)
    return response.data
  },
  
  // Dashboard
  async getDashboardOverview(productionId) {
    const response = await api.get(`/realtime/dashboard/overview/?production_id=${productionId}`)
    return response.data
  },
  
  async sendBroadcast(data) {
    const response = await api.post('/realtime/dashboard/send_broadcast/', data)
    return response.data
  }
}

// Notifications API
export const notificationsAPI = {
  async getNotifications() {
    const response = await api.get('/notifications/notifications/')
    return response.data
  },
  
  async markAsRead(notificationId) {
    const response = await api.patch(`/notifications/notifications/${notificationId}/`, {
      is_read: true
    })
    return response.data
  },
  
  async markAllAsRead() {
    const response = await api.post('/notifications/notifications/mark_all_read/')
    return response.data
  }
}

// Export default api instance for custom requests
export default api