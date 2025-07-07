// frontend/src/services/WebSocketClient.js
class WebSocketClient {
  constructor() {
    this.socket = null;
    this.chatSocket = null;
    this.productionId = null;
    this.token = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
    this.isConnecting = false;
    this.listeners = new Map();
    this.heartbeatInterval = null;
    this.typingTimer = null;
    this.isTyping = false;
  }

  // Connect to production WebSocket
  async connectToProduction(productionId, token) {
    if (this.isConnecting) return;
    
    this.productionId = productionId;
    this.token = token;
    this.isConnecting = true;

    try {
      const wsUrl = `${this.getWebSocketUrl()}/ws/production/${productionId}/?token=${token}`;
      console.log('Connecting to WebSocket:', wsUrl);
      
      this.socket = new WebSocket(wsUrl);
      this.setupProductionEventHandlers();
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'));
        }, 10000);

        this.socket.onopen = () => {
          clearTimeout(timeout);
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          console.log('WebSocket connected to production:', productionId);
          this.emit('connected', { productionId });
          resolve();
        };

        this.socket.onerror = (error) => {
          clearTimeout(timeout);
          this.isConnecting = false;
          console.error('WebSocket connection error:', error);
          reject(error);
        };
      });
    } catch (error) {
      this.isConnecting = false;
      throw error;
    }
  }

  // Connect to chat room
  async connectToChat(roomId, token) {
    if (this.chatSocket && this.chatSocket.readyState === WebSocket.OPEN) {
      this.chatSocket.close();
    }

    const wsUrl = `${this.getWebSocketUrl()}/ws/chat/${roomId}/?token=${token}`;
    console.log('Connecting to chat WebSocket:', wsUrl);
    
    this.chatSocket = new WebSocket(wsUrl);
    this.setupChatEventHandlers();
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Chat WebSocket connection timeout'));
      }, 10000);

      this.chatSocket.onopen = () => {
        clearTimeout(timeout);
        console.log('Chat WebSocket connected to room:', roomId);
        this.emit('chat_connected', { roomId });
        resolve(this.chatSocket);
      };

      this.chatSocket.onerror = (error) => {
        clearTimeout(timeout);
        console.error('Chat WebSocket error:', error);
        reject(error);
      };
    });
  }

  setupProductionEventHandlers() {
    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleProductionMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onclose = (event) => {
      console.log('Production WebSocket connection closed:', event.code, event.reason);
      this.stopHeartbeat();
      this.emit('disconnected', { code: event.code, reason: event.reason });
      
      // Auto-reconnect if not a clean close
      if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect();
      }
    };

    this.socket.onerror = (error) => {
      console.error('Production WebSocket error:', error);
      this.emit('error', error);
    };
  }

  setupChatEventHandlers() {
    this.chatSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleChatMessage(data);
      } catch (error) {
        console.error('Error parsing chat message:', error);
      }
    };

    this.chatSocket.onclose = (event) => {
      console.log('Chat WebSocket connection closed:', event.code, event.reason);
      this.emit('chat_disconnected', { code: event.code, reason: event.reason });
    };

    this.chatSocket.onerror = (error) => {
      console.error('Chat WebSocket error:', error);
      this.emit('chat_error', error);
    };
  }

  handleProductionMessage(data) {
    const { type } = data;

    switch (type) {
      case 'production_state':
        this.emit('production_state', data.state);
        break;
      
      case 'event':
        this.handleRealtimeEvent(data.event);
        break;
      
      case 'heartbeat':
        this.sendHeartbeatResponse();
        break;
      
      case 'error':
        console.error('WebSocket server error:', data.message);
        this.emit('server_error', data);
        break;
      
      default:
        console.log('Unknown production WebSocket message type:', type, data);
    }
  }

  handleChatMessage(data) {
    const { type } = data;

    switch (type) {
      case 'chat_message':
        this.emit('chat_message', data.message);
        break;
      
      case 'message_history':
        this.emit('message_history', data.messages);
        break;
      
      case 'typing_start':
        this.emit('user_typing_start', data);
        break;
      
      case 'typing_stop':
        this.emit('user_typing_stop', data);
        break;
      
      case 'error':
        console.error('Chat WebSocket server error:', data.message);
        this.emit('chat_server_error', data);
        break;
      
      default:
        console.log('Unknown chat WebSocket message type:', type, data);
    }
  }

  handleRealtimeEvent(event) {
    const { event_type, priority } = event;
    
    // Emit general realtime event
    this.emit('realtime_event', event);
    
    // Emit specific event types
    this.emit(`event_${event_type}`, event);
    
    // Handle priority events with special notifications
    if (priority === 'urgent' || priority === 'high') {
      this.emit('priority_event', event);
    }

    // Handle specific event types
    switch (event_type) {
      case 'status_update':
        this.emit('production_status_changed', event.data);
        break;
      
      case 'shot_started':
      case 'shot_completed':
        this.emit('shot_progress', event.data);
        break;
      
      case 'scene_started':
      case 'scene_completed':
        this.emit('scene_progress', event.data);
        break;
      
      case 'crew_checkin':
      case 'crew_checkout':
        this.emit('crew_status_changed', event.data);
        break;
      
      case 'equipment_alert':
        this.emit('equipment_alert', event.data);
        break;
      
      case 'schedule_change':
        this.emit('schedule_changed', event.data);
        break;
      
      case 'emergency':
        this.emit('emergency_alert', event.data);
        // Play urgent notification sound
        this.playNotificationSound('emergency');
        break;
      
      case 'broadcast':
        this.emit('broadcast_message', event.data);
        this.playNotificationSound('broadcast');
        break;
    }
  }

  // Production event senders
  sendStatusUpdate(statusData) {
    this.send({
      type: 'status_update',
      current_scene: statusData.scene,
      current_shot: statusData.shot,
      current_status: statusData.status,
      notes: statusData.notes || '',
      location: statusData.location || ''
    });
  }

  sendShotProgress(shotData) {
    this.send({
      type: 'shot_progress',
      shot_id: shotData.shotId,
      take_number: shotData.takeNumber,
      status: shotData.status, // setup, rolling, cut, complete
      notes: shotData.notes || ''
    });
  }

  sendCrewCheckin(crewData) {
    this.send({
      type: 'crew_checkin',
      crew_member: crewData.name,
      department: crewData.department,
      location: crewData.location || ''
    });
  }

  sendCrewCheckout(crewData) {
    this.send({
      type: 'crew_checkout',
      crew_member: crewData.name,
      department: crewData.department
    });
  }

  sendEquipmentAlert(alertData) {
    this.send({
      type: 'equipment_alert',
      equipment_id: alertData.equipmentId,
      alert_type: alertData.alertType, // malfunction, missing, maintenance
      description: alertData.description,
      severity: alertData.severity || 'medium'
    });
  }

  sendScheduleChange(scheduleData) {
    this.send({
      type: 'schedule_change',
      change_type: scheduleData.changeType, // scene_moved, scene_cancelled, break_extended
      affected_scenes: scheduleData.affectedScenes || [],
      new_time: scheduleData.newTime,
      reason: scheduleData.reason
    });
  }

  sendEmergencyAlert(emergencyData) {
    this.send({
      type: 'emergency',
      emergency_type: emergencyData.type,
      location: emergencyData.location,
      description: emergencyData.description,
      action_required: emergencyData.actionRequired
    });
  }

  // Chat functionality
  sendChatMessage(content, replyToId = null) {
    if (!this.chatSocket || this.chatSocket.readyState !== WebSocket.OPEN) {
      console.warn('Chat WebSocket not connected');
      return;
    }

    this.chatSocket.send(JSON.stringify({
      type: 'chat_message',
      content: content.trim(),
      reply_to: replyToId
    }));
  }

  sendTypingStart() {
    if (!this.chatSocket || this.chatSocket.readyState !== WebSocket.OPEN) return;
    
    if (!this.isTyping) {
      this.isTyping = true;
      this.chatSocket.send(JSON.stringify({ type: 'typing_start' }));
    }
    
    // Clear existing timer
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }
    
    // Set timer to stop typing indicator
    this.typingTimer = setTimeout(() => {
      this.sendTypingStop();
    }, 3000);
  }

  sendTypingStop() {
    if (!this.chatSocket || this.chatSocket.readyState !== WebSocket.OPEN) return;
    
    if (this.isTyping) {
      this.isTyping = false;
      this.chatSocket.send(JSON.stringify({ type: 'typing_stop' }));
    }
    
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
      this.typingTimer = null;
    }
  }

  markMessageAsRead(messageId) {
    if (!this.chatSocket || this.chatSocket.readyState !== WebSocket.OPEN) return;
    
    this.chatSocket.send(JSON.stringify({
      type: 'mark_read',
      message_id: messageId
    }));
  }

  // Generic send method
  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.warn('Production WebSocket not connected. Cannot send:', data);
    }
  }

  // Heartbeat handling
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      // Server sends heartbeat, we just respond
    }, 30000);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  sendHeartbeatResponse() {
    this.send({ type: 'heartbeat_response' });
  }

  // Reconnection logic
  scheduleReconnect() {
    setTimeout(() => {
      if (this.productionId && this.token) {
        this.reconnectAttempts++;
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connectToProduction(this.productionId, this.token).catch(() => {
          // Reconnection failed, will try again if attempts left
        });
      }
    }, this.reconnectInterval * this.reconnectAttempts);
  }

  // Notification sounds
  playNotificationSound(type = 'default') {
    if (!this.shouldPlaySound()) return;

    const audio = new Audio();
    switch (type) {
      case 'emergency':
        audio.src = '/sounds/emergency-alert.mp3';
        audio.volume = 0.8;
        break;
      case 'broadcast':
        audio.src = '/sounds/broadcast.mp3';
        audio.volume = 0.6;
        break;
      case 'message':
        audio.src = '/sounds/message.mp3';
        audio.volume = 0.4;
        break;
      default:
        audio.src = '/sounds/notification.mp3';
        audio.volume = 0.5;
    }
    
    audio.play().catch(e => {
      console.log('Could not play notification sound:', e.message);
    });
  }

  shouldPlaySound() {
    // Check if sounds are enabled in user preferences
    const soundEnabled = localStorage.getItem('realtime_sounds_enabled');
    return soundEnabled !== 'false'; // Default to enabled
  }

  setSoundEnabled(enabled) {
    localStorage.setItem('realtime_sounds_enabled', enabled.toString());
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket event callback:', error);
        }
      });
    }
  }

  // Utility methods
  getWebSocketUrl() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.VUE_APP_WS_HOST || window.location.host;
    return `${protocol}//${host}`;
  }

  disconnect() {
    this.stopHeartbeat();
    
    if (this.socket) {
      this.socket.close(1000); // Normal closure
      this.socket = null;
    }
    
    if (this.chatSocket) {
      this.sendTypingStop();
      this.chatSocket.close(1000);
      this.chatSocket = null;
    }
    
    this.productionId = null;
    this.token = null;
    this.reconnectAttempts = 0;
    this.isTyping = false;
    
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
      this.typingTimer = null;
    }
  }

  getConnectionState() {
    if (!this.socket) return 'disconnected';
    
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'disconnected';
      default: return 'unknown';
    }
  }

  getChatConnectionState() {
    if (!this.chatSocket) return 'disconnected';
    
    switch (this.chatSocket.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'disconnected';
      default: return 'unknown';
    }
  }

  // Debug methods
  getConnectionInfo() {
    return {
      production: {
        id: this.productionId,
        state: this.getConnectionState(),
        reconnectAttempts: this.reconnectAttempts
      },
      chat: {
        state: this.getChatConnectionState(),
        isTyping: this.isTyping
      },
      listeners: Array.from(this.listeners.keys()),
      settings: {
        soundEnabled: this.shouldPlaySound()
      }
    };
  }
}

// Export singleton instance
export default new WebSocketClient();