// src/services/realtimeApi.ts
import api from './api'

export interface WebSocketConnection {
  id: string
  user: {
    id: number
    name: string
    username: string
  }
  production_title: string
  connected_at: string
  last_ping: string
  status: 'connected' | 'disconnected' | 'inactive'
  can_broadcast: boolean
  can_moderate: boolean
}

export interface RealtimeEvent {
  id: string
  event_type: string
  title: string
  description?: string
  event_data: Record<string, any>
  priority: 'low' | 'normal' | 'high' | 'urgent'
  is_broadcast: boolean
  created_at: string
  user: {
    id: number
    name: string
  }
  production_title: string
}

export interface ChatRoom {
  id: string
  name: string
  description?: string
  room_type: 'general' | 'department' | 'emergency' | 'private'
  is_public: boolean
  production_title: string
  created_by: {
    id: number
    name: string
  }
  created_at: string
  updated_at: string
  is_active: boolean
  message_count: number
  unread_count: number
  last_message?: {
    id: string
    content: string
    user: string
    created_at: string
    message_type: string
  }
  member_count: number
  is_member: boolean
}

export interface ChatMessage {
  id: string
  room: string
  user: {
    id: number
    name: string
    username: string
  }
  content: string
  message_type: 'text' | 'image' | 'file' | 'system' | 'alert'
  created_at: string
  updated_at: string
  is_edited: boolean
  is_deleted: boolean
  reply_to?: {
    id: string
    content: string
    user: string
    created_at: string
  }
  attachments: any[]
  read_count: number
  is_read_by_user: boolean
  time_since_created: number
  can_edit: boolean
  can_delete: boolean
}

export interface DashboardOverview {
  productions: Array<{
    id: string
    title: string
    active_connections: number
    events_today: number
    messages_today: number
    recent_events: RealtimeEvent[]
  }>
  total_active_connections: number
  total_events_today: number
  total_messages_today: number
}

export interface BroadcastMessage {
  production_id: string
  message: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  event_type?: string
  title?: string
}

// API functions
export const realtimeApi = {
  // Connections
  async getActiveConnections(productionId: string): Promise<WebSocketConnection[]> {
    const response = await api.get(`/realtime/connections/active/?production_id=${productionId}`)
    return response.data
  },

  async getConnectionsByProduction(productionId: string): Promise<WebSocketConnection[]> {
    const response = await api.get(`/realtime/connections/by_production/?production_id=${productionId}`)
    return response.data
  },

  // Events
  async getRecentEvents(productionId: string, hours: number = 24): Promise<RealtimeEvent[]> {
    const response = await api.get(`/realtime/events/recent/?production_id=${productionId}&hours=${hours}`)
    return response.data
  },

  async getEventsByType(eventType: string): Promise<RealtimeEvent[]> {
    const response = await api.get(`/realtime/events/by_type/?type=${eventType}`)
    return response.data
  },

  async createEvent(data: Partial<RealtimeEvent>): Promise<RealtimeEvent> {
    const response = await api.post('/realtime/events/', data)
    return response.data
  },

  async markEventDelivered(eventId: string): Promise<void> {
    await api.post(`/realtime/events/${eventId}/mark_delivered/`)
  },

  // Chat Rooms
  async getChatRooms(productionId?: string): Promise<ChatRoom[]> {
    const url = productionId 
      ? `/realtime/chat-rooms/?production=${productionId}`
      : '/realtime/chat-rooms/'
    const response = await api.get(url)
    return response.data.results || response.data
  },

  async getChatRoom(roomId: string): Promise<ChatRoom> {
    const response = await api.get(`/realtime/chat-rooms/${roomId}/`)
    return response.data
  },

  async createChatRoom(data: {
    production: string
    name: string
    description?: string
    room_type: string
    is_public: boolean
  }): Promise<ChatRoom> {
    const response = await api.post('/realtime/chat-rooms/', data)
    return response.data
  },

  async joinChatRoom(roomId: string): Promise<void> {
    await api.post(`/realtime/chat-rooms/${roomId}/join/`)
  },

  async leaveChatRoom(roomId: string): Promise<void> {
    await api.post(`/realtime/chat-rooms/${roomId}/leave/`)
  },

  async addMemberToChatRoom(roomId: string, userId: number): Promise<void> {
    await api.post(`/realtime/chat-rooms/${roomId}/add_member/`, {
      user_id: userId
    })
  },

  async getChatRoomMembers(roomId: string): Promise<Array<{
    id: number
    username: string
    first_name: string
    last_name: string
  }>> {
    const response = await api.get(`/realtime/chat-rooms/${roomId}/members/`)
    return response.data
  },

  // Messages
  async getChatMessages(roomId: string, limit: number = 50, offset: number = 0): Promise<ChatMessage[]> {
    const response = await api.get(`/realtime/messages/by_room/?room_id=${roomId}&limit=${limit}&offset=${offset}`)
    return response.data
  },

  async createChatMessage(data: {
    room: string
    content: string
    reply_to?: string
  }): Promise<ChatMessage> {
    const response = await api.post('/realtime/messages/', data)
    return response.data
  },

  async markMessageAsRead(messageId: string): Promise<void> {
    await api.post(`/realtime/messages/${messageId}/mark_read/`)
  },

  async editMessage(messageId: string, content: string): Promise<ChatMessage> {
    const response = await api.patch(`/realtime/messages/${messageId}/edit/`, {
      content
    })
    return response.data
  },

  // Dashboard
  async getDashboardOverview(productionId?: string): Promise<DashboardOverview> {
    const url = productionId 
      ? `/realtime/dashboard/overview/?production_id=${productionId}`
      : '/realtime/dashboard/overview/'
    const response = await api.get(url)
    return response.data
  },

  async sendBroadcast(data: BroadcastMessage): Promise<{ status: string; event_id: string }> {
    const response = await api.post('/realtime/dashboard/send_broadcast/', data)
    return response.data
  },

  // Metrics
  async getMetrics(productionId: string, days: number = 7): Promise<any> {
    const response = await api.get(`/realtime/dashboard/metrics/?production_id=${productionId}&days=${days}`)
    return response.data
  }
}

export default realtimeApi