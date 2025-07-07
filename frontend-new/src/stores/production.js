// frontend/src/stores/production.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { productionAPI, crewAPI, scheduleAPI, realtimeAPI } from '@/services/api'

export const useProductionStore = defineStore('production', () => {
  // State
  const productions = ref([])
  const currentProduction = ref(null)
  const scenes = ref([])
  const shots = ref([])
  const crewMembers = ref([])
  const departments = ref([])
  const shootingDays = ref([])
  const schedule = ref([])
  const chatRooms = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const currentProductionId = computed(() => currentProduction.value?.id)
  const currentProductionTitle = computed(() => currentProduction.value?.title || '')
  const crewByDepartment = computed(() => {
    const grouped = {}
    crewMembers.value.forEach(member => {
      const dept = member.department?.name || 'Other'
      if (!grouped[dept]) grouped[dept] = []
      grouped[dept].push(member)
    })
    return grouped
  })

  // Productions
  async function fetchProductions() {
    isLoading.value = true
    error.value = null
    
    try {
      const data = await productionAPI.getProductions()
      productions.value = data.results || data
      return data
    } catch (err) {
      error.value = err.response?.data?.detail || 'Failed to load productions'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function getProduction(id) {
    isLoading.value = true
    error.value = null
    
    try {
      const data = await productionAPI.getProduction(id)
      currentProduction.value = data
      
      // Also load related data
      await Promise.all([
        fetchScenes(id),
        fetchCrewMembers(id),
        fetchChatRooms(id)
      ])
      
      return data
    } catch (err) {
      error.value = err.response?.data?.detail || 'Failed to load production'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createProduction(data) {
    isLoading.value = true
    error.value = null
    
    try {
      const newProduction = await productionAPI.createProduction(data)
      productions.value.push(newProduction)
      return newProduction
    } catch (err) {
      error.value = err.response?.data?.detail || 'Failed to create production'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateProduction(id, data) {
    isLoading.value = true
    error.value = null
    
    try {
      const updated = await productionAPI.updateProduction(id, data)
      
      // Update in productions list
      const index = productions.value.findIndex(p => p.id === id)
      if (index > -1) {
        productions.value[index] = updated
      }
      
      // Update current production if it's the same
      if (currentProduction.value?.id === id) {
        currentProduction.value = updated
      }
      
      return updated
    } catch (err) {
      error.value = err.response?.data?.detail || 'Failed to update production'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Scenes
  async function fetchScenes(productionId) {
    try {
      const data = await productionAPI.getScenes(productionId)
      scenes.value = data.results || data
      return data
    } catch (err) {
      console.error('Failed to load scenes:', err)
      throw err
    }
  }

  async function createScene(data) {
    try {
      const newScene = await productionAPI.createScene(data)
      scenes.value.push(newScene)
      return newScene
    } catch (err) {
      error.value = err.response?.data?.detail || 'Failed to create scene'
      throw err
    }
  }

  // Shots
  async function fetchShots(sceneId) {
    try {
      const data = await productionAPI.getShots(sceneId)
      shots.value = data.results || data
      return data
    } catch (err) {
      console.error('Failed to load shots:', err)
      throw err
    }
  }

  async function createShot(data) {
    try {
      const newShot = await productionAPI.createShot(data)
      shots.value.push(newShot)
      return newShot
    } catch (err) {
      error.value = err.response?.data?.detail || 'Failed to create shot'
      throw err
    }
  }

  // Crew
  async function fetchCrewMembers(productionId) {
    try {
      const data = await crewAPI.getCrewMembers(productionId)
      crewMembers.value = data.results || data
      return data
    } catch (err) {
      console.error('Failed to load crew members:', err)
      throw err
    }
  }

  async function addCrewMember(data) {
    try {
      const newMember = await crewAPI.addCrewMember(data)
      crewMembers.value.push(newMember)
      return newMember
    } catch (err) {
      error.value = err.response?.data?.detail || 'Failed to add crew member'
      throw err
    }
  }

  async function fetchDepartments() {
    try {
      const data = await crewAPI.getDepartments()
      departments.value = data.results || data
      return data
    } catch (err) {
      console.error('Failed to load departments:', err)
      throw err
    }
  }

  // Schedule
  async function fetchShootingDays(productionId) {
    try {
      const data = await scheduleAPI.getShootingDays(productionId)
      shootingDays.value = data.results || data
      return data
    } catch (err) {
      console.error('Failed to load shooting days:', err)
      throw err
    }
  }

  async function createShootingDay(data) {
    try {
      const newDay = await scheduleAPI.createShootingDay(data)
      shootingDays.value.push(newDay)
      return newDay
    } catch (err) {
      error.value = err.response?.data?.detail || 'Failed to create shooting day'
      throw err
    }
  }

  async function fetchSchedule(productionId, date) {
    try {
      const data = await scheduleAPI.getSchedule(productionId, date)
      schedule.value = data.results || data
      return data
    } catch (err) {
      console.error('Failed to load schedule:', err)
      throw err
    }
  }

  // Chat Rooms
  async function fetchChatRooms(productionId) {
    try {
      const data = await realtimeAPI.getChatRooms(productionId)
      chatRooms.value = data.results || data
      return data
    } catch (err) {
      console.error('Failed to load chat rooms:', err)
      throw err
    }
  }

  async function createChatRoom(data) {
    try {
      const newRoom = await realtimeAPI.createChatRoom(data)
      chatRooms.value.push(newRoom)
      return newRoom
    } catch (err) {
      error.value = err.response?.data?.detail || 'Failed to create chat room'
      throw err
    }
  }

  async function joinChatRoom(roomId) {
    try {
      await realtimeAPI.joinChatRoom(roomId)
      
      // Update room membership locally
      const room = chatRooms.value.find(r => r.id === roomId)
      if (room) {
        room.is_member = true
      }
    } catch (err) {
      error.value = err.response?.data?.detail || 'Failed to join chat room'
      throw err
    }
  }

  // Utility functions
  function setCurrentProduction(production) {
    currentProduction.value = production
  }

  function clearCurrentProduction() {
    currentProduction.value = null
    scenes.value = []
    shots.value = []
    crewMembers.value = []
    shootingDays.value = []
    schedule.value = []
    chatRooms.value = []
  }

  function clearError() {
    error.value = null
  }

  // Scene helpers
  function getSceneById(sceneId) {
    return scenes.value.find(scene => scene.id === sceneId)
  }

  function getScenesByShootingDay(shootingDayId) {
    return scenes.value.filter(scene => scene.shooting_day === shootingDayId)
  }

  // Shot helpers
  function getShotsByScene(sceneId) {
    return shots.value.filter(shot => shot.scene === sceneId)
  }

  // Crew helpers
  function getCrewMemberById(memberId) {
    return crewMembers.value.find(member => member.id === memberId)
  }

  function getCrewByRole(role) {
    return crewMembers.value.filter(member => member.role === role)
  }

  return {
    // State
    productions,
    currentProduction,
    scenes,
    shots,
    crewMembers,
    departments,
    shootingDays,
    schedule,
    chatRooms,
    isLoading,
    error,
    
    // Getters
    currentProductionId,
    currentProductionTitle,
    crewByDepartment,
    
    // Actions
    fetchProductions,
    getProduction,
    createProduction,
    updateProduction,
    fetchScenes,
    createScene,
    fetchShots,
    createShot,
    fetchCrewMembers,
    addCrewMember,
    fetchDepartments,
    fetchShootingDays,
    createShootingDay,
    fetchSchedule,
    fetchChatRooms,
    createChatRoom,
    joinChatRoom,
    setCurrentProduction,
    clearCurrentProduction,
    clearError,
    
    // Helpers
    getSceneById,
    getScenesByShootingDay,
    getShotsByScene,
    getCrewMemberById,
    getCrewByRole
  }
})