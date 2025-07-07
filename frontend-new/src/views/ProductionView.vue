<template>
  <div class="production-view">
    <!-- Header -->
    <div class="production-header">
      <h1>{{ production?.title || 'Loading...' }}</h1>
      <div class="header-actions">
        <button @click="toggleChat" class="btn btn-outline">
          💬 Chat {{ unreadCount > 0 ? `(${unreadCount})` : '' }}
        </button>
        <button @click="toggleDashboard" class="btn btn-outline">
          📊 Dashboard
        </button>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="content-grid">
      <!-- Left Panel - Production Content -->
      <div class="content-panel">
        <div class="production-content">
          <!-- Your existing production content here -->
          <div class="scenes-list">
            <h3>Scenes</h3>
            <!-- Scene components -->
          </div>
          
          <div class="shots-list">
            <h3>Shots</h3>
            <!-- Shot components -->
          </div>
        </div>
      </div>

      <!-- Right Panel - Realtime Dashboard -->
      <div v-if="showDashboard" class="sidebar-panel">
        <div class="panel-header">
          <h3>Realtime Dashboard</h3>
          <button @click="showDashboard = false" class="close-btn">×</button>
        </div>
        <RealtimeDashboard :production-id="productionId" />
      </div>

      <!-- Chat Panel (Overlay) -->
      <div v-if="showChat" class="chat-overlay" @click.self="showChat = false">
        <div class="chat-panel">
          <div class="panel-header">
            <h3>Production Chat</h3>
            <button @click="showChat = false" class="close-btn">×</button>
          </div>
          <RealtimeChat :room-id="chatRoomId" />
        </div>
      </div>
    </div>

    <!-- Status Bar -->
    <div class="status-bar">
      <div class="connection-indicators">
        <div class="indicator" :class="realtimeStatus">
          <span class="indicator-dot"></span>
          <span>Production: {{ realtimeStatusText }}</span>
        </div>
        <div class="indicator" :class="chatStatus">
          <span class="indicator-dot"></span>
          <span>Chat: {{ chatStatusText }}</span>
        </div>
      </div>
      
      <div class="quick-actions">
        <button 
          @click="quickStatusUpdate"
          :disabled="!isConnected"
          class="btn btn-sm btn-success"
        >
          📢 Quick Status
        </button>
        <button 
          @click="emergencyAlert"
          class="btn btn-sm btn-danger"
        >
          🚨 Emergency
        </button>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div class="toast-container">
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        class="toast"
        :class="`toast-${toast.type}`"
      >
        <div class="toast-content">
          <strong>{{ toast.title }}</strong>
          <p>{{ toast.message }}</p>
        </div>
        <button @click="removeToast(toast.id)" class="toast-close">×</button>
      </div>
    </div>

    <!-- Quick Status Modal -->
    <div v-if="showQuickStatus" class="modal-overlay" @click.self="showQuickStatus = false">
      <div class="modal">
        <div class="modal-header">
          <h3>Quick Status Update</h3>
          <button @click="showQuickStatus = false" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="sendQuickStatus">
            <div class="form-group">
              <label>Current Status:</label>
              <select v-model="quickStatus.status" class="form-control">
                <option value="prep">Preparing</option>
                <option value="rehearsal">Rehearsing</option>
                <option value="lighting">Lighting</option>
                <option value="rolling">Rolling</option>
                <option value="reset">Resetting</option>
                <option value="moving_on">Moving On</option>
                <option value="meal_break">Meal Break</option>
                <option value="wrapped">Wrapped</option>
              </select>
            </div>
            <div class="form-group">
              <label>Scene/Shot:</label>
              <input v-model="quickStatus.scene" placeholder="e.g., INT. 1A - 001" class="form-control">
            </div>
            <div class="form-group">
              <label>Notes:</label>
              <textarea v-model="quickStatus.notes" placeholder="Optional notes..." class="form-control"></textarea>
            </div>
            <div class="modal-actions">
              <button type="button" @click="showQuickStatus = false" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary">Send Update</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRealtime, useRealtimeChat, useRealtimeEvents } from '@/composables/useRealtime'
import { useAuthStore } from '@/stores/auth'
import { useProductionStore } from '@/stores/production'
import RealtimeDashboard from '@/components/RealtimeDashboard.vue'
import RealtimeChat from '@/components/RealtimeChat.vue'

// Stores and route
const route = useRoute()
const authStore = useAuthStore()
const productionStore = useProductionStore()
const productionId = route.params.id

// Composables
const {
  isConnected,
  connectionStatus,
  productionState,
  connectToProduction,
  sendStatusUpdate,
  sendEmergencyAlert,
  disconnect
} = useRealtime()

const {
  isChatConnected,
  chatStatus,
  unreadCount,
  connectToChat
} = useRealtimeChat()

const {
  emergencyAlerts,
  equipmentAlerts,
  broadcastMessages
} = useRealtimeEvents()

// Local state
const production = ref(null)
const chatRoomId = ref(null)
const showDashboard = ref(false)
const showChat = ref(false)
const showQuickStatus = ref(false)
const toasts = ref([])

// Quick status form
const quickStatus = ref({
  status: 'prep',
  scene: '',
  notes: ''
})

// Computed
const realtimeStatus = computed(() => connectionStatus.value)
const realtimeStatusText = computed(() => {
  switch (connectionStatus.value) {
    case 'connecting': return 'Connecting...'
    case 'connected': return 'Connected'
    case 'error': return 'Error'
    default: return 'Disconnected'
  }
})

const chatStatusText = computed(() => {
  switch (chatStatus.value) {
    case 'connecting': return 'Connecting...'
    case 'connected': return 'Connected'
    case 'error': return 'Error'
    default: return 'Disconnected'
  }
})

// Methods
async function initializeProduction() {
  try {
    // Load production data
    production.value = await productionStore.getProduction(productionId)
    
    // Get default chat room for this production
    chatRoomId.value = production.value.default_chat_room_id || `production-${productionId}`
    
    // Connect to realtime services
    if (authStore.token) {
      await connectToProduction(productionId, authStore.token)
      
      // Auto-connect to chat if user preference
      if (localStorage.getItem('auto_connect_chat') !== 'false') {
        await connectToChat(chatRoomId.value, authStore.token)
      }
    }
  } catch (error) {
    console.error('Failed to initialize production:', error)
    addToast('error', 'Connection Error', 'Failed to connect to realtime services')
  }
}

function toggleDashboard() {
  showDashboard.value = !showDashboard.value
  if (showChat.value && showDashboard.value) {
    showChat.value = false // Close chat if dashboard opens
  }
}

function toggleChat() {
  showChat.value = !showChat.value
  if (showDashboard.value && showChat.value) {
    showDashboard.value = false // Close dashboard if chat opens
  }
  
  // Connect to chat if not already connected
  if (showChat.value && !isChatConnected.value && authStore.token) {
    connectToChat(chatRoomId.value, authStore.token)
  }
}

function quickStatusUpdate() {
  showQuickStatus.value = true
}

function sendQuickStatus() {
  const [scene, shot] = quickStatus.value.scene.split(' - ')
  
  sendStatusUpdate({
    scene: scene || '',
    shot: shot || '',
    status: quickStatus.value.status,
    notes: quickStatus.value.notes
  })
  
  showQuickStatus.value = false
  quickStatus.value = { status: 'prep', scene: '', notes: '' }
  
  addToast('success', 'Status Updated', `Status changed to ${quickStatus.value.status}`)
}

function emergencyAlert() {
  const message = prompt('Emergency Alert Message:')
  if (message) {
    sendEmergencyAlert({
      type: 'general',
      location: 'Set',
      description: message,
      actionRequired: 'Immediate attention required'
    })
    
    addToast('warning', 'Emergency Alert Sent', message)
  }
}

function addToast(type, title, message) {
  const toast = {
    id: Date.now(),
    type,
    title,
    message
  }
  
  toasts.value.push(toast)
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    removeToast(toast.id)
  }, 5000)
}

function removeToast(id) {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

// Event handlers for realtime events
function setupRealtimeEventHandlers() {
  // Emergency alerts
  const handleEmergencyAlert = (data) => {
    addToast('error', '🚨 EMERGENCY', data.description)
    
    // Play urgent sound
    const audio = new Audio('/sounds/emergency.mp3')
    audio.play().catch(() => {})
  }
  
  // Equipment alerts
  const handleEquipmentAlert = (data) => {
    addToast('warning', '⚠️ Equipment Alert', 
      `${data.equipment_id}: ${data.description}`)
  }
  
  // Broadcast messages
  const handleBroadcastMessage = (data) => {
    addToast('info', '📢 Broadcast', data.message)
  }
  
  // Setup listeners using WebSocket client directly
  import('@/services/WebSocketClient').then(({ default: WebSocketClient }) => {
    WebSocketClient.on('emergency_alert', handleEmergencyAlert)
    WebSocketClient.on('equipment_alert', handleEquipmentAlert)
    WebSocketClient.on('broadcast_message', handleBroadcastMessage)
  })
}

// Lifecycle
onMounted(() => {
  initializeProduction()
  setupRealtimeEventHandlers()
})

onUnmounted(() => {
  disconnect()
})
</script>

<style scoped>
.production-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.production-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-bottom: 1px solid #ddd;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-actions {
  display: flex;
  gap: 10px;
}

.content-grid {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.content-panel {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.sidebar-panel {
  width: 400px;
  background: white;
  border-left: 1px solid #ddd;
  display: flex;
  flex-direction: column;
}

.chat-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.chat-panel {
  width: 600px;
  height: 700px;
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  color: #666;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: white;
  border-top: 1px solid #ddd;
}

.connection-indicators {
  display: flex;
  gap: 20px;
}

.indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9em;
}

.indicator.connected {
  color: #4CAF50;
}

.indicator.connecting {
  color: #ff9800;
}

.indicator.error, .indicator.disconnected {
  color: #f44336;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.quick-actions {
  display: flex;
  gap: 10px;
}

.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 2000;
}

.toast {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  margin-bottom: 10px;
  padding: 15px;
  min-width: 300px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-left: 4px solid #ccc;
}

.toast-success {
  border-color: #4CAF50;
}

.toast-error {
  border-color: #f44336;
}

.toast-warning {
  border-color: #ff9800;
}

.toast-info {
  border-color: #2196F3;
}

.toast-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
  color: #666;
  margin-left: 10px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90vw;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #ddd;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-control:focus {
  outline: none;
  border-color: #2196F3;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background: #2196F3;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-outline {
  background: transparent;
  border: 1px solid #ddd;
  color: #333;
}

.btn-success {
  background: #4CAF50;
  color: white;
}

.btn-danger {
  background: #f44336;
  color: white;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 12px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn:hover:not(:disabled) {
  opacity: 0.9;
}
</style>