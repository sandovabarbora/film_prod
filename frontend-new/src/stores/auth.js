// frontend/src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(localStorage.getItem('auth_token'))
  const refreshToken = ref(localStorage.getItem('refresh_token'))
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userFullName = computed(() => {
    if (!user.value) return ''
    return `${user.value.first_name} ${user.value.last_name}`.trim() || user.value.username
  })

  // Actions
  async function login(credentials) {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await authAPI.login(credentials)
      
      // Store tokens
      token.value = response.access
      refreshToken.value = response.refresh
      localStorage.setItem('auth_token', response.access)
      localStorage.setItem('refresh_token', response.refresh)
      
      // Get user data
      await getCurrentUser()
      
      return response
    } catch (err) {
      error.value = err.response?.data?.detail || 'Login failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function register(userData) {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await authAPI.register(userData)
      
      // Auto-login after registration
      if (response.access) {
        token.value = response.access
        refreshToken.value = response.refresh
        localStorage.setItem('auth_token', response.access)
        localStorage.setItem('refresh_token', response.refresh)
        
        await getCurrentUser()
      }
      
      return response
    } catch (err) {
      error.value = err.response?.data?.detail || 'Registration failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function getCurrentUser() {
    if (!token.value) return null
    
    try {
      const userData = await authAPI.getCurrentUser()
      user.value = userData
      return userData
    } catch (err) {
      console.error('Failed to get current user:', err)
      if (err.response?.status === 401) {
        await logout()
      }
      throw err
    }
  }

  async function refreshTokens() {
    if (!refreshToken.value) {
      await logout()
      return false
    }
    
    try {
      const response = await authAPI.refreshToken(refreshToken.value)
      
      token.value = response.access
      localStorage.setItem('auth_token', response.access)
      
      if (response.refresh) {
        refreshToken.value = response.refresh
        localStorage.setItem('refresh_token', response.refresh)
      }
      
      return true
    } catch (err) {
      console.error('Token refresh failed:', err)
      await logout()
      return false
    }
  }

  async function logout() {
    try {
      if (refreshToken.value) {
        await authAPI.logout()
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      // Clear all auth data
      user.value = null
      token.value = null
      refreshToken.value = null
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      
      // Redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
  }

  async function initializeAuth() {
    if (token.value) {
      try {
        await getCurrentUser()
      } catch (err) {
        console.error('Auth initialization failed:', err)
        await logout()
      }
    }
  }

  function clearError() {
    error.value = null
  }

  // Auto-refresh token before it expires
  let refreshInterval = null
  
  function startTokenRefresh() {
    // Refresh token every 50 minutes (tokens expire in 60 minutes)
    refreshInterval = setInterval(async () => {
      if (isAuthenticated.value) {
        await refreshTokens()
      }
    }, 50 * 60 * 1000)
  }

  function stopTokenRefresh() {
    if (refreshInterval) {
      clearInterval(refreshInterval)
      refreshInterval = null
    }
  }

  // Start auto-refresh when store is initialized
  if (isAuthenticated.value) {
    startTokenRefresh()
  }

  return {
    // State
    user,
    token,
    refreshToken,
    isLoading,
    error,
    
    // Getters
    isAuthenticated,
    userFullName,
    
    // Actions
    login,
    register,
    logout,
    getCurrentUser,
    refreshTokens,
    initializeAuth,
    clearError,
    startTokenRefresh,
    stopTokenRefresh
  }
})