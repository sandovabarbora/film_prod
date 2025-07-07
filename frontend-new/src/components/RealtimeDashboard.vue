<template>
  <div class="realtime-dashboard">
    <!-- Connection Status -->
    <div class="connection-status" :class="connectionStatus">
      <div class="status-indicator">
        <span class="status-dot"></span>
        <span class="status-text">
          {{ connectionStatusText }}
        </span>
      </div>
      
      <div v-if="connectionError" class="error-message">
        {{ connectionError }}
      </div>
    </div>

    <!-- Production Info -->
    <div v-if="isConnected" class="production-info">
      <h2>{{ productionState.title }}</h2>
      <div class="production-stats">
        <div class="stat">
          <span class="stat-label">Active Connections:</span>
          <span class="stat-value">{{ productionState.activeConnections }}</span>
        </div>
      </div>
    </div>

    <!-- Control Panel -->
    <div v-if="isConnected && canBroadcast" class="control-panel">
      <h3>Production Controls</h3>
      
      <!-- Status Update Form -->
      <form @submit.prevent="sendStatusUpdate" class="status-form">
        <h4>Status Update</h4>
        <div class="form-row">
          <input 
            v-model="statusForm.scene" 
            placeholder="Scene (e.g., INT. 1A)"
            class="form-input"
          />
          <input 
            v-model="statusForm.shot" 
            placeholder="Shot (e.g., 001)"
            class="form-input"
          />
        </div>
        <div class="form-row">
          <select v-model="statusForm.status" class="form-select">
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
        <textarea 
          v-model="statusForm.notes" 
          placeholder="Notes (optional)"
          class="form-textarea"
        ></textarea>
        <button type="submit" class="btn btn-primary">Send Status Update</button>
      </form>

      <!-- Shot Progress Form -->
      <form @submit.prevent="sendShotProgress" class="shot-form">
        <h4>Shot Progress</h4>
        <div class="form-row">
          <input 
            v-model="shotForm.shotId" 
            placeholder="Shot ID"
            class="form-input"
          />
          <input 
            v-model.number="shotForm.takeNumber" 
            type="number"
            placeholder="Take"
            class="form-input"
          />
        </div>
        <div class="form-row">
          <select v-model="shotForm.status" class="form-select">
            <option value="setup">Setup</option>
            <option value="rolling">Rolling</option>
            <option value="cut">Cut</option>
            <option value="complete">Complete</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary">Send Shot Progress</button>
      </form>

      <!-- Equipment Alert Form -->
      <form @submit.prevent="sendEquipmentAlert" class="alert-form">
        <h4>Equipment Alert</h4>
        <div class="form-row">
          <input 
            v-model="alertForm.equipmentId" 
            placeholder="Equipment ID"
            class="form-input"
          />
          <select v-model="alertForm.alertType" class="form-select">
            <option value="malfunction">Malfunction</option>
            <option value="missing">Missing</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
        <div class="form-row">
          <select v-model="alertForm.severity" class="form-select">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <textarea 
          v-model="alertForm.description" 
          placeholder="Description"
          class="form-textarea"
          required
        ></textarea>
        <button type="submit" class="btn btn-warning">Send Equipment Alert</button>
      </form>
    </div>

    <!-- Recent Events -->
    <div v-if="isConnected" class="recent-events">
      <h3>Recent Events</h3>
      <div v-if="realtimeEvents.length === 0" class="no-events">
        No recent events
      </div>
      <div v-else class="events-list">
        <div 
          v-for="event in realtimeEvents.slice(0, 10)" 
          :key="event.id"
          class="event-item"
          :class="`priority-${event.priority}`"
        >
          <div class="event-header">
            <span class="event-type">{{ formatEventType(event.event_type) }}</span>
            <span class="event-time">{{ formatTime(event.timestamp) }}</span>
          </div>
          <div class="event-title">{{ event.title }}</div>
          <div v-if="event.data && Object.keys(event.data).length" class="event-data">
            <pre>{{ JSON.stringify(event.data, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>

    <!-- Specific Event Lists -->
    <div v-if="isConnected" class="specific-events">
      <!-- Emergency Alerts -->
      <div v-if="emergencyAlerts.length > 0" class="emergency-alerts">
        <h3>🚨 Emergency Alerts</h3>
        <div 
          v-for="alert in emergencyAlerts" 
          :key="alert.timestamp"
          class="emergency-alert"
        >
          <strong>{{ alert.emergency_type }}</strong>
          <p>{{ alert.description }}</p>
          <small>{{ alert.location }} - {{ formatTime(alert.timestamp) }}</small>
        </div>
      </div>

      <!-- Equipment Alerts -->
      <div v-if="equipmentAlerts.length > 0" class="equipment-alerts">
        <h3>⚠️ Equipment Alerts</h3>
        <div 
          v-for="alert in equipmentAlerts" 
          :key="alert.timestamp"
          class="equipment-alert"
          :class="`severity-${alert.severity}`"
        >
          <strong>{{ alert.equipment_id }}</strong> - {{ alert.alert_type }}
          <p>{{ alert.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRealtime, useRealtimeEvents } from '@/composables/useRealtime'
import { useAuthStore } from '@/stores/auth' // Assuming you have auth store

// Props
const props = defineProps({
  productionId: {
    type: String,
    required: true
  }
})

// Composables
const authStore = useAuthStore()
const { 
  isConnected, 
  isConnecting, 
  connectionError, 
  connectionStatus,
  productionState,
  realtimeEvents,
  connectToProduction,
  sendStatusUpdate: sendStatusUpdateAction,
  sendShotProgress: sendShotProgressAction,
  sendEquipmentAlert: sendEquipmentAlertAction,
  disconnect
} = useRealtime()

const {
  emergencyAlerts,
  equipmentAlerts
} = useRealtimeEvents()

// Forms
const statusForm = ref({
  scene: '',
  shot: '',
  status: 'prep',
  notes: '',
  location: ''
})

const shotForm = ref({
  shotId: '',
  takeNumber: 1,
  status: 'setup'
})

const alertForm = ref({
  equipmentId: '',
  alertType: 'malfunction',
  severity: 'medium',
  description: ''
})

// Computed
const connectionStatusText = computed(() => {
  switch (connectionStatus.value) {
    case 'connecting': return 'Connecting...'
    case 'connected': return 'Connected'
    case 'error': return 'Connection Error'
    default: return 'Disconnected'
  }
})

const canBroadcast = computed(() => {
  return productionState.userPermissions?.can_broadcast || false
})

// Methods
function sendStatusUpdate() {
  sendStatusUpdateAction({
    scene: statusForm.value.scene,
    shot: statusForm.value.shot,
    status: statusForm.value.status,
    notes: statusForm.value.notes,
    location: statusForm.value.location
  })
  
  // Clear form
  statusForm.value = {
    scene: '',
    shot: '',
    status: 'prep',
    notes: '',
    location: ''
  }
}

function sendShotProgress() {
  sendShotProgressAction({
    shotId: shotForm.value.shotId,
    takeNumber: shotForm.value.takeNumber,
    status: shotForm.value.status
  })
  
  // Increment take number for next shot
  if (shotForm.value.status === 'complete') {
    shotForm.value.takeNumber = 1
    shotForm.value.shotId = ''
  } else {
    shotForm.value.takeNumber++
  }
}

function sendEquipmentAlert() {
  sendEquipmentAlertAction({
    equipmentId: alertForm.value.equipmentId,
    alertType: alertForm.value.alertType,
    severity: alertForm.value.severity,
    description: alertForm.value.description
  })
  
  // Clear form
  alertForm.value = {
    equipmentId: '',
    alertType: 'malfunction',
    severity: 'medium',
    description: ''
  }
}

function formatEventType(type) {
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString()
}

// Lifecycle
onMounted(async () => {
  if (authStore.token) {
    await connectToProduction(props.productionId, authStore.token)
  }
})

// Cleanup on unmount
onUnmounted(() => {
  disconnect()
})
</script>

<style scoped>
.realtime-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.connection-status {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #ccc;
}

.connection-status.connected {
  background: #e8f5e8;
  border-color: #4CAF50;
}

.connection-status.connecting {
  background: #fff3cd;
  border-color: #ffc107;
}

.connection-status.error {
  background: #f8d7da;
  border-color: #dc3545;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ccc;
}

.connected .status-dot {
  background: #4CAF50;
  animation: pulse 2s infinite;
}

.connecting .status-dot {
  background: #ffc107;
  animation: blink 1s infinite;
}

.error .status-dot {
  background: #dc3545;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.production-info {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.production-stats {
  display: flex;
  gap: 20px;
  margin-top: 10px;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-label {
  font-size: 0.9em;
  color: #666;
}

.stat-value {
  font-size: 1.5em;
  font-weight: bold;
  color: #2196F3;
}

.control-panel {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.status-form, .shot-form, .alert-form {
  margin-bottom: 30px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.form-row {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.form-input, .form-select, .form-textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-input, .form-select {
  flex: 1;
}

.form-textarea {
  width: 100%;
  min-height: 80px;
  resize: vertical;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
}

.btn-primary {
  background: #2196F3;
  color: white;
}

.btn-warning {
  background: #ff9800;
  color: white;
}

.btn:hover {
  opacity: 0.9;
}

.recent-events {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.events-list {
  max-height: 400px;
  overflow-y: auto;
}

.event-item {
  padding: 15px;
  margin-bottom: 10px;
  background: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid #ccc;
}

.event-item.priority-high {
  border-color: #ff9800;
  background: #fff3e0;
}

.event-item.priority-urgent {
  border-color: #f44336;
  background: #ffebee;
}

.event-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 5px;
}

.event-type {
  font-weight: bold;
  text-transform: capitalize;
}

.event-time {
  font-size: 0.9em;
  color: #666;
}

.event-data {
  margin-top: 10px;
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  font-size: 0.8em;
}

.emergency-alerts {
  background: #ffebee;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 2px solid #f44336;
}

.emergency-alert {
  background: white;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
}

.equipment-alerts {
  background: #fff3e0;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 2px solid #ff9800;
}

.equipment-alert {
  background: white;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
}

.equipment-alert.severity-high {
  border-left: 4px solid #f44336;
}

.equipment-alert.severity-medium {
  border-left: 4px solid #ff9800;
}

.equipment-alert.severity-low {
  border-left: 4px solid #4CAF50;
}
</style>