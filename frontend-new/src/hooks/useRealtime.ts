// src/hooks/useRealtime.ts
import { useState, useEffect, useCallback, useRef } from 'react'
import WebSocketClient from '../services/WebSocketClient'
import { RealtimeEvent, ChatMessage } from '../services/realtimeApi'

export interface ProductionState {
  id: string | null
  title: string
  activeConnections: number
  latestEvents: RealtimeEvent[]
  userPermissions: {
    can_broadcast: boolean
    can_moderate: boolean
  }
}

export interface StatusUpdateData {
  scene: string
  shot: string
  status: string
  notes?: string
  location?: string
}

export interface ShotProgressData {
  shotId: string
  takeNumber: number
  status: 'setup' | 'rolling' | 'cut' | 'complete'
  notes?: string
}

export interface CrewData {
  name: string
  department: string
  location?: string
}

export interface EquipmentAlertData {
  equipmentId: string
  alertType: 'malfunction' | 'missing' | 'maintenance'
  description: string
  severity: 'low' | 'medium' | 'high'
}

export interface EmergencyData {
  type: string
  location: string
  description: string
  actionRequired: string
}

export interface ScheduleChangeData {
  changeType: 'scene_moved' | 'scene_cancelled' | 'break_extended'
  affectedScenes: string[]
  newTime?: string
  reason: string
}

// Main realtime hook
export const useRealtime = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [productionState, setProductionState] = useState<ProductionState>({
    id: null,
    title: '',
    activeConnections: 0,
    latestEvents: [],
    userPermissions: {
      can_broadcast: false,
      can_moderate: false
    }
  })
  const [realtimeEvents, setRealtimeEvents] = useState<RealtimeEvent[]>([])

  const maxEvents = 50
  const eventListeners = useRef(new Map())

  // Connection status
  const connectionStatus = isConnecting ? 'connecting' : 
                         isConnected ? 'connected' : 
                         connectionError ? 'error' : 'disconnected'

  // Connect to production
  const connectToProduction = useCallback(async (productionId: string, token: string) => {
    if (isConnecting) return

    setIsConnecting(true)
    setConnectionError(null)

    try {
      await WebSocketClient.connectToProduction(productionId, token)
      setIsConnected(true)
      setProductionState(prev => ({ ...prev, id: productionId }))
    } catch (error: any) {
      setConnectionError(error.message)
      console.error('Failed to connect to production WebSocket:', error)
    } finally {
      setIsConnecting(false)
    }
  }, [isConnecting])

  // Send functions
  const sendStatusUpdate = useCallback((data: StatusUpdateData) => {
    WebSocketClient.sendStatusUpdate(data)
  }, [])

  const sendShotProgress = useCallback((data: ShotProgressData) => {
    WebSocketClient.sendShotProgress(data)
  }, [])

  const sendCrewCheckin = useCallback((data: CrewData) => {
    WebSocketClient.sendCrewCheckin(data)
  }, [])

  const sendCrewCheckout = useCallback((data: CrewData) => {
    WebSocketClient.sendCrewCheckout(data)
  }, [])

  const sendEquipmentAlert = useCallback((data: EquipmentAlertData) => {
    WebSocketClient.sendEquipmentAlert(data)
  }, [])

  const sendScheduleChange = useCallback((data: ScheduleChangeData) => {
    WebSocketClient.sendScheduleChange(data)
  }, [])

  const sendEmergencyAlert = useCallback((data: EmergencyData) => {
    WebSocketClient.sendEmergencyAlert(data)
  }, [])

  // Event handlers
  const handleConnected = useCallback((data: any) => {
    setIsConnected(true)
    console.log('Connected to production:', data.productionId)
  }, [])

  const handleDisconnected = useCallback((data: any) => {
    setIsConnected(false)
    console.log('Disconnected from production:', data)
  }, [])

  const handleProductionState = useCallback((state: any) => {
    setProductionState(prev => ({ ...prev, ...state }))
  }, [])

  const handleRealtimeEvent = useCallback((event: RealtimeEvent) => {
    setRealtimeEvents(prev => {
      const newEvents = [event, ...prev]
      return newEvents.slice(0, maxEvents)
    })
  }, [maxEvents])

  const handleError = useCallback((error: any) => {
    setConnectionError(error.message || 'WebSocket error')
    console.error('WebSocket error:', error)
  }, [])

  // Disconnect
  const disconnect = useCallback(() => {
    WebSocketClient.disconnect()
    setIsConnected(false)
    setIsConnecting(false)
    setConnectionError(null)
    setRealtimeEvents([])
    setProductionState({
      id: null,
      title: '',
      activeConnections: 0,
      latestEvents: [],
      userPermissions: {
        can_broadcast: false,
        can_moderate: false
      }
    })
  }, [])

  // Setup event listeners
  useEffect(() => {
    const setupListeners = () => {
      WebSocketClient.on('connected', handleConnected)
      WebSocketClient.on('disconnected', handleDisconnected)
      WebSocketClient.on('production_state', handleProductionState)
      WebSocketClient.on('realtime_event', handleRealtimeEvent)
      WebSocketClient.on('error', handleError)
    }

    const removeListeners = () => {
      WebSocketClient.off('connected', handleConnected)
      WebSocketClient.off('disconnected', handleDisconnected)
      WebSocketClient.off('production_state', handleProductionState)
      WebSocketClient.off('realtime_event', handleRealtimeEvent)
      WebSocketClient.off('error', handleError)
    }

    setupListeners()
    return removeListeners
  }, [handleConnected, handleDisconnected, handleProductionState, handleRealtimeEvent, handleError])

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
    getConnectionInfo: () => WebSocketClient.getConnectionInfo?.() || {}
  }
}

// Chat hook
export const useRealtimeChat = () => {
  const [isChatConnected, setIsChatConnected] = useState(false)
  const [isChatConnecting, setIsChatConnecting] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const chatStatus = isChatConnecting ? 'connecting' :
                    isChatConnected ? 'connected' :
                    chatError ? 'error' : 'disconnected'

  // Connect to chat room
  const connectToChat = useCallback(async (roomId: string, token: string) => {
    if (isChatConnecting) return

    setIsChatConnecting(true)
    setChatError(null)

    try {
      await WebSocketClient.connectToChat(roomId, token)
      setIsChatConnected(true)
      setCurrentRoomId(roomId)
      setMessages([]) // Clear previous messages
    } catch (error: any) {
      setChatError(error.message)
      console.error('Failed to connect to chat WebSocket:', error)
    } finally {
      setIsChatConnecting(false)
    }
  }, [isChatConnecting])

  // Send chat message
  const sendMessage = useCallback((content: string, replyToId?: string) => {
    if (!content.trim()) return
    WebSocketClient.sendChatMessage(content, replyToId)
  }, [])

  // Typing indicators
  const startTyping = useCallback(() => {
    WebSocketClient.sendTypingStart()
  }, [])

  const stopTyping = useCallback(() => {
    WebSocketClient.sendTypingStop()
  }, [])

  // Mark message as read
  const markAsRead = useCallback((messageId: string) => {
    WebSocketClient.markMessageAsRead(messageId)
  }, [])

  // Event handlers
  const handleChatConnected = useCallback((data: any) => {
    setIsChatConnected(true)
    console.log('Connected to chat room:', data.roomId)
  }, [])

  const handleChatDisconnected = useCallback((data: any) => {
    setIsChatConnected(false)
    console.log('Disconnected from chat room:', data)
  }, [])

  const handleChatMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message])
    
    // Increment unread count if document is hidden
    if (document.hidden) {
      setUnreadCount(prev => prev + 1)
    }
  }, [])

  const handleMessageHistory = useCallback((messageHistory: ChatMessage[]) => {
    setMessages(messageHistory)
  }, [])

  const handleUserTypingStart = useCallback((data: any) => {
    setTypingUsers(prev => {
      if (!prev.includes(data.user)) {
        return [...prev, data.user]
      }
      return prev
    })
  }, [])

  const handleUserTypingStop = useCallback((data: any) => {
    setTypingUsers(prev => prev.filter(user => user !== data.user))
  }, [])

  const handleChatError = useCallback((error: any) => {
    setChatError(error.message || 'Chat WebSocket error')
    console.error('Chat WebSocket error:', error)
  }, [])

  // Clear unread count when window becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setUnreadCount(0)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Disconnect from chat
  const disconnectChat = useCallback(() => {
    if (WebSocketClient.chatSocket) {
      WebSocketClient.sendTypingStop()
      WebSocketClient.chatSocket.close()
    }
    setIsChatConnected(false)
    setIsChatConnecting(false)
    setChatError(null)
    setCurrentRoomId(null)
    setMessages([])
    setTypingUsers([])
    setUnreadCount(0)
  }, [])

  // Setup chat event listeners
  useEffect(() => {
    const setupListeners = () => {
      WebSocketClient.on('chat_connected', handleChatConnected)
      WebSocketClient.on('chat_disconnected', handleChatDisconnected)
      WebSocketClient.on('chat_message', handleChatMessage)
      WebSocketClient.on('message_history', handleMessageHistory)
      WebSocketClient.on('user_typing_start', handleUserTypingStart)
      WebSocketClient.on('user_typing_stop', handleUserTypingStop)
      WebSocketClient.on('chat_error', handleChatError)
    }

    const removeListeners = () => {
      WebSocketClient.off('chat_connected', handleChatConnected)
      WebSocketClient.off('chat_disconnected', handleChatDisconnected)
      WebSocketClient.off('chat_message', handleChatMessage)
      WebSocketClient.off('message_history', handleMessageHistory)
      WebSocketClient.off('user_typing_start', handleUserTypingStart)
      WebSocketClient.off('user_typing_stop', handleUserTypingStop)
      WebSocketClient.off('chat_error', handleChatError)
    }

    setupListeners()
    return removeListeners
  }, [
    handleChatConnected,
    handleChatDisconnected,
    handleChatMessage,
    handleMessageHistory,
    handleUserTypingStart,
    handleUserTypingStop,
    handleChatError
  ])

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

// Specific events hook
export const useRealtimeEvents = () => {
  const [statusUpdates, setStatusUpdates] = useState<any[]>([])
  const [shotProgress, setShotProgress] = useState<any[]>([])
  const [crewStatus, setCrewStatus] = useState<any[]>([])
  const [equipmentAlerts, setEquipmentAlerts] = useState<any[]>([])
  const [scheduleChanges, setScheduleChanges] = useState<any[]>([])
  const [emergencyAlerts, setEmergencyAlerts] = useState<any[]>([])
  const [broadcastMessages, setBroadcastMessages] = useState<any[]>([])

  const handleStatusUpdate = useCallback((data: any) => {
    setStatusUpdates(prev => {
      const newList = [data, ...prev]
      return newList.slice(0, 20)
    })
  }, [])

  const handleShotProgress = useCallback((data: any) => {
    setShotProgress(prev => {
      const newList = [data, ...prev]
      return newList.slice(0, 20)
    })
  }, [])

  const handleCrewStatusChanged = useCallback((data: any) => {
    setCrewStatus(prev => {
      const newList = [data, ...prev]
      return newList.slice(0, 20)
    })
  }, [])

  const handleEquipmentAlert = useCallback((data: any) => {
    setEquipmentAlerts(prev => {
      const newList = [data, ...prev]
      return newList.slice(0, 10)
    })
  }, [])

  const handleScheduleChanged = useCallback((data: any) => {
    setScheduleChanges(prev => {
      const newList = [data, ...prev]
      return newList.slice(0, 10)
    })
  }, [])

  const handleEmergencyAlert = useCallback((data: any) => {
    setEmergencyAlerts(prev => [data, ...prev])
  }, [])

  const handleBroadcastMessage = useCallback((data: any) => {
    setBroadcastMessages(prev => {
      const newList = [data, ...prev]
      return newList.slice(0, 10)
    })
  }, [])

  // Setup event listeners
  useEffect(() => {
    const setupListeners = () => {
      WebSocketClient.on('production_status_changed', handleStatusUpdate)
      WebSocketClient.on('shot_progress', handleShotProgress)
      WebSocketClient.on('crew_status_changed', handleCrewStatusChanged)
      WebSocketClient.on('equipment_alert', handleEquipmentAlert)
      WebSocketClient.on('schedule_changed', handleScheduleChanged)
      WebSocketClient.on('emergency_alert', handleEmergencyAlert)
      WebSocketClient.on('broadcast_message', handleBroadcastMessage)
    }

    const removeListeners = () => {
      WebSocketClient.off('production_status_changed', handleStatusUpdate)
      WebSocketClient.off('shot_progress', handleShotProgress)
      WebSocketClient.off('crew_status_changed', handleCrewStatusChanged)
      WebSocketClient.off('equipment_alert', handleEquipmentAlert)
      WebSocketClient.off('schedule_changed', handleScheduleChanged)
      WebSocketClient.off('emergency_alert', handleEmergencyAlert)
      WebSocketClient.off('broadcast_message', handleBroadcastMessage)
    }

    setupListeners()
    return removeListeners
  }, [
    handleStatusUpdate,
    handleShotProgress,
    handleCrewStatusChanged,
    handleEquipmentAlert,
    handleScheduleChanged,
    handleEmergencyAlert,
    handleBroadcastMessage
  ])

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