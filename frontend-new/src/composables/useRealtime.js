// frontend/src/composables/useRealtime.js
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import WebSocketClient from '@/services/WebSocketClient'

export function useRealtime() {
  // Connection states
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const connectionError = ref(null)
  
  // Production state
  const productionState = reactive({
    id: null,
    title: '',
    activeConnections: 0,
    latestEvents: [],
    userPermissions: {}
  })
  
  // Recent events
  const realtimeEvents = ref([])
  const maxEvents = 50
  
  // Connection status
  const connectionStatus = computed(() => {
    if (isConnecting.value) return 'connecting'
    if (isConnected.value) return 'connected'
    if (connectionError.value) return 'error'
    return 'disconnected'
  })

  // Connect to production
  async function connectToProduction(productionId, token) {
    if (isConnecting.value) return
    
    isConnecting.value = true
    connectionError.value = null
    
    try {
      await WebSocketClient.connectToProduction(productionId, token)
      isConnected.value = true
      productionState.id = productionId
    } catch (error) {
      connectionError.value = error.message
      console.error('Failed to connect to production WebSocket:', error)
    } finally {
      isConnecting.value = false
    }
  }

  // Send production events
  function sendStatusUpdate(statusData) {
    WebSocketClient.sendStatusUpdate(statusData)
  }

  function sendShotProgress(shotData) {
    WebSocketClient.sendShotProgress(shotData)
  }

  function sendCrewCheckin(crewData) {
    WebSocketClient.sendCrewCheckin(crewData)
  }

  function sendCrewCheckout(crewData) {
    WebSocketClient.sendCrewCheckout(crewData)
  }

  function sendEquipmentAlert(alertData) {
    WebSocketClient.sendEquipmentAlert(alertData)
  }

  function sendScheduleChange(scheduleData) {
    WebSocketClient.sendScheduleChange(scheduleData)
  }

  function sendEmergencyAlert(emergencyData) {
    WebSocketClient.sendEmergencyAlert(emergencyData)
  }

  // Event handlers
  function handleConnected(data) {
    isConnected.value = true
    console.log('Connected to production:', data.productionId)
  }

  function handleDisconnected(data) {
    isConnected.value = false
    console.log('Disconnected from production:', data)
  }

  function handleProductionState(state) {
    Object.assign(productionState, state)
  }

  function handleRealtimeEvent(event) {
    // Add to events list (keep only latest events)
    realtimeEvents.value.unshift(event)
    if (realtimeEvents.value.length > maxEvents) {
      realtimeEvents.value = realtimeEvents.value.slice(0, maxEvents)
    }
  }

  function handleError(error) {
    connectionError.value = error.message || 'WebSocket error'
    console.error('WebSocket error:', error)
  }

  // Setup event listeners
  function setupEventListeners() {
    WebSocketClient.on('connected', handleConnected)
    WebSocketClient.on('disconnected', handleDisconnected)
    WebSocketClient.on('production_state', handleProductionState)
    WebSocketClient.on('realtime_event', handleRealtimeEvent)
    WebSocketClient.on('error', handleError)
  }

  // Remove event listeners
  function removeEventListeners() {
    WebSocketClient.off('connected', handleConnected)
    WebSocketClient.off('disconnected', handleDisconnected)
    WebSocketClient.off('production_state', handleProductionState)
    WebSocketClient.off('realtime_event', handleRealtimeEvent)
    WebSocketClient.off('error', handleError)
  }

  // Disconnect
  function disconnect() {
    WebSocketClient.disconnect()
    isConnected.value = false
    isConnecting.value = false
    connectionError.value = null
    realtimeEvents.value = []
    Object.assign(productionState, {
      id: null,
      title: '',
      activeConnections: 0,
      latestEvents: [],
      userPermissions: {}
    })
  }

  // Setup on mount, cleanup on unmount
  onMounted(() => {
    setupEventListeners()
  })

  onUnmounted(() => {
    removeEventListeners()
  })

  return {
    // State
    isConnected,
    isConnecting,
    connectionError,
    connectionStatus,
    productionState,
    realtimeEvents,
    
    // Methods
    connectToProduction,
    disconnect,
    sendStatusUpdate,
    sendShotProgress,
    sendCrewCheckin,
    sendCrewCheckout,
    sendEquipmentAlert,
    sendScheduleChange,
    sendEmergencyAlert,
    
    // Utilities
    getConnectionInfo: () => WebSocketClient.getConnectionInfo()
  }
}

export function useRealtimeChat() {
  // Chat connection state
  const isChatConnected = ref(false)
  const isChatConnecting = ref(false)
  const chatError = ref(null)
  const currentRoomId = ref(null)
  
  // Chat messages
  const messages = ref([])
  const typingUsers = ref([])
  const unreadCount = ref(0)
  
  // Chat status
  const chatStatus = computed(() => {
    if (isChatConnecting.value) return 'connecting'
    if (isChatConnected.value) return 'connected'
    if (chatError.value) return 'error'
    return 'disconnected'
  })

  // Connect to chat room
  async function connectToChat(roomId, token) {
    if (isChatConnecting.value) return
    
    isChatConnecting.value = true
    chatError.value = null
    
    try {
      await WebSocketClient.connectToChat(roomId, token)
      isChatConnected.value = true
      currentRoomId.value = roomId
      messages.value = [] // Clear previous messages
    } catch (error) {
      chatError.value = error.message
      console.error('Failed to connect to chat WebSocket:', error)
    } finally {
      isChatConnecting.value = false
    }
  }

  // Send chat message
  function sendMessage(content, replyToId = null) {
    if (!content.trim()) return
    
    WebSocketClient.sendChatMessage(content, replyToId)
  }

  // Typing indicators
  function startTyping() {
    WebSocketClient.sendTypingStart()
  }

  function stopTyping() {
    WebSocketClient.sendTypingStop()
  }

  // Mark message as read
  function markAsRead(messageId) {
    WebSocketClient.markMessageAsRead(messageId)
  }

  // Event handlers
  function handleChatConnected(data) {
    isChatConnected.value = true
    console.log('Connected to chat room:', data.roomId)
  }

  function handleChatDisconnected(data) {
    isChatConnected.value = false
    console.log('Disconnected from chat room:', data)
  }

  function handleChatMessage(message) {
    messages.value.push(message)
    
    // Increment unread count if not focused
    if (document.hidden) {
      unreadCount.value++
    }
  }

  function handleMessageHistory(messageHistory) {
    messages.value = messageHistory
  }

  function handleUserTypingStart(data) {
    if (!typingUsers.value.includes(data.user)) {
      typingUsers.value.push(data.user)
    }
  }

  function handleUserTypingStop(data) {
    const index = typingUsers.value.indexOf(data.user)
    if (index > -1) {
      typingUsers.value.splice(index, 1)
    }
  }

  function handleChatError(error) {
    chatError.value = error.message || 'Chat WebSocket error'
    console.error('Chat WebSocket error:', error)
  }

  // Setup chat event listeners
  function setupChatEventListeners() {
    WebSocketClient.on('chat_connected', handleChatConnected)
    WebSocketClient.on('chat_disconnected', handleChatDisconnected)
    WebSocketClient.on('chat_message', handleChatMessage)
    WebSocketClient.on('message_history', handleMessageHistory)
    WebSocketClient.on('user_typing_start', handleUserTypingStart)
    WebSocketClient.on('user_typing_stop', handleUserTypingStop)
    WebSocketClient.on('chat_error', handleChatError)
  }

  // Remove chat event listeners
  function removeChatEventListeners() {
    WebSocketClient.off('chat_connected', handleChatConnected)
    WebSocketClient.off('chat_disconnected', handleChatDisconnected)
    WebSocketClient.off('chat_message', handleChatMessage)
    WebSocketClient.off('message_history', handleMessageHistory)
    WebSocketClient.off('user_typing_start', handleUserTypingStart)
    WebSocketClient.off('user_typing_stop', handleUserTypingStop)
    WebSocketClient.off('chat_error', handleChatError)
  }

  // Clear unread count when window becomes visible
  function handleVisibilityChange() {
    if (!document.hidden) {
      unreadCount.value = 0
    }
  }

  // Disconnect from chat
  function disconnectChat() {
    if (WebSocketClient.chatSocket) {
      WebSocketClient.sendTypingStop()
      WebSocketClient.chatSocket.close()
    }
    isChatConnected.value = false
    isChatConnecting.value = false
    chatError.value = null
    currentRoomId.value = null
    messages.value = []
    typingUsers.value = []
    unreadCount.value = 0
  }

  // Setup on mount, cleanup on unmount
  onMounted(() => {
    setupChatEventListeners()
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onUnmounted(() => {
    removeChatEventListeners()
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

  return {
    // State
    isChatConnected,
    isChatConnecting,
    chatError,
    chatStatus,
    currentRoomId,
    messages,
    typingUsers,
    unreadCount,
    
    // Methods
    connectToChat,
    disconnectChat,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead
  }
}

// Specific event composables
export function useRealtimeEvents() {
  const statusUpdates = ref([])
  const shotProgress = ref([])
  const crewStatus = ref([])
  const equipmentAlerts = ref([])
  const scheduleChanges = ref([])
  const emergencyAlerts = ref([])
  const broadcastMessages = ref([])

  function handleStatusUpdate(data) {
    statusUpdates.value.unshift(data)
    if (statusUpdates.value.length > 20) {
      statusUpdates.value = statusUpdates.value.slice(0, 20)
    }
  }

  function handleShotProgress(data) {
    shotProgress.value.unshift(data)
    if (shotProgress.value.length > 20) {
      shotProgress.value = shotProgress.value.slice(0, 20)
    }
  }

  function handleCrewStatusChanged(data) {
    crewStatus.value.unshift(data)
    if (crewStatus.value.length > 20) {
      crewStatus.value = crewStatus.value.slice(0, 20)
    }
  }

  function handleEquipmentAlert(data) {
    equipmentAlerts.value.unshift(data)
    if (equipmentAlerts.value.length > 10) {
      equipmentAlerts.value = equipmentAlerts.value.slice(0, 10)
    }
  }

  function handleScheduleChanged(data) {
    scheduleChanges.value.unshift(data)
    if (scheduleChanges.value.length > 10) {
      scheduleChanges.value = scheduleChanges.value.slice(0, 10)
    }
  }

  function handleEmergencyAlert(data) {
    emergencyAlerts.value.unshift(data)
    // Keep all emergency alerts - they're important
  }

  function handleBroadcastMessage(data) {
    broadcastMessages.value.unshift(data)
    if (broadcastMessages.value.length > 10) {
      broadcastMessages.value = broadcastMessages.value.slice(0, 10)
    }
  }

  // Setup event listeners
  function setupSpecificEventListeners() {
    WebSocketClient.on('production_status_changed', handleStatusUpdate)
    WebSocketClient.on('shot_progress', handleShotProgress)
    WebSocketClient.on('crew_status_changed', handleCrewStatusChanged)
    WebSocketClient.on('equipment_alert', handleEquipmentAlert)
    WebSocketClient.on('schedule_changed', handleScheduleChanged)
    WebSocketClient.on('emergency_alert', handleEmergencyAlert)
    WebSocketClient.on('broadcast_message', handleBroadcastMessage)
  }

  // Remove event listeners
  function removeSpecificEventListeners() {
    WebSocketClient.off('production_status_changed', handleStatusUpdate)
    WebSocketClient.off('shot_progress', handleShotProgress)
    WebSocketClient.off('crew_status_changed', handleCrewStatusChanged)
    WebSocketClient.off('equipment_alert', handleEquipmentAlert)
    WebSocketClient.off('schedule_changed', handleScheduleChanged)
    WebSocketClient.off('emergency_alert', handleEmergencyAlert)
    WebSocketClient.off('broadcast_message', handleBroadcastMessage)
  }

  onMounted(() => {
    setupSpecificEventListeners()
  })

  onUnmounted(() => {
    removeSpecificEventListeners()
  })

  return {
    statusUpdates,
    shotProgress,
    crewStatus,
    equipmentAlerts,
    scheduleChanges,
    emergencyAlerts,
    broadcastMessages
  }
}