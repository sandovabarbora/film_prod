<template>
  <div class="realtime-chat">
    <!-- Chat Header -->
    <div class="chat-header">
      <h3>Production Chat</h3>
      <div class="chat-status" :class="chatStatus">
        <span class="status-dot"></span>
        <span>{{ chatStatusText }}</span>
      </div>
    </div>

    <!-- Connection Error -->
    <div v-if="chatError" class="chat-error">
      {{ chatError }}
      <button @click="reconnectChat" class="btn btn-sm btn-primary">
        Reconnect
      </button>
    </div>

    <!-- Chat Messages -->
    <div v-if="isChatConnected" class="chat-container">
      <div ref="messagesContainer" class="messages-container">
        <div v-if="messages.length === 0" class="no-messages">
          No messages yet. Start the conversation!
        </div>
        
        <div 
          v-for="message in messages" 
          :key="message.id"
          class="message"
          :class="{
            'own-message': isOwnMessage(message),
            'reply-message': message.reply_to
          }"
        >
          <!-- Reply Reference -->
          <div v-if="message.reply_to" class="reply-reference">
            <span class="reply-user">{{ message.reply_to.user }}</span>
            <span class="reply-content">{{ message.reply_to.content }}</span>
          </div>
          
          <!-- Message Content -->
          <div class="message-content">
            <div class="message-header">
              <span class="message-user">{{ message.user.name }}</span>
              <span class="message-time">{{ formatTime(message.timestamp) }}</span>
              <span v-if="message.is_edited" class="edited-label">(edited)</span>
            </div>
            <div class="message-text">{{ message.content }}</div>
            
            <!-- Message Actions -->
            <div class="message-actions">
              <button 
                @click="startReply(message)" 
                class="action-btn"
                title="Reply"
              >
                ↩️
              </button>
              <button 
                v-if="canEdit(message)"
                @click="startEdit(message)" 
                class="action-btn"
                title="Edit"
              >
                ✏️
              </button>
              <button 
                @click="markAsRead(message.id)" 
                class="action-btn"
                title="Mark as read"
              >
                ✓
              </button>
            </div>
          </div>
        </div>

        <!-- Typing Indicator -->
        <div v-if="typingUsers.length > 0" class="typing-indicator">
          <span class="typing-text">
            {{ formatTypingUsers(typingUsers) }} 
            {{ typingUsers.length === 1 ? 'is' : 'are' }} typing...
          </span>
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <!-- Reply Preview -->
      <div v-if="replyingTo" class="reply-preview">
        <div class="reply-preview-content">
          <span class="reply-to-user">Replying to {{ replyingTo.user.name }}:</span>
          <span class="reply-to-text">{{ replyingTo.content }}</span>
        </div>
        <button @click="cancelReply" class="cancel-reply">×</button>
      </div>

      <!-- Edit Preview -->
      <div v-if="editingMessage" class="edit-preview">
        <div class="edit-preview-content">
          <span class="edit-label">Editing message:</span>
          <span class="edit-original">{{ editingMessage.content }}</span>
        </div>
        <button @click="cancelEdit" class="cancel-edit">×</button>
      </div>

      <!-- Message Input -->
      <div class="message-input-container">
        <form @submit.prevent="sendMessage" class="message-form">
          <textarea
            ref="messageInput"
            v-model="messageText"
            @input="onTyping"
            @keydown="onKeyDown"
            placeholder="Type your message... (Shift+Enter for new line)"
            class="message-input"
            rows="1"
          ></textarea>
          <button 
            type="submit" 
            :disabled="!messageText.trim()" 
            class="send-button"
          >
            {{ editingMessage ? '💾' : '📤' }}
          </button>
        </form>
      </div>
    </div>

    <!-- Connection Controls -->
    <div v-else class="connection-controls">
      <button 
        @click="connectChat" 
        :disabled="isChatConnecting"
        class="btn btn-primary"
      >
        {{ isChatConnecting ? 'Connecting...' : 'Connect to Chat' }}
      </button>
    </div>

    <!-- Unread Badge -->
    <div v-if="unreadCount > 0" class="unread-badge">
      {{ unreadCount }} unread
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRealtimeChat } from '@/composables/useRealtime'
import { useAuthStore } from '@/stores/auth'

// Props
const props = defineProps({
  roomId: {
    type: String,
    required: true
  }
})

// Composables
const authStore = useAuthStore()
const {
  isChatConnected,
  isChatConnecting,
  chatError,
  chatStatus,
  messages,
  typingUsers,
  unreadCount,
  connectToChat: connectToChatAction,
  disconnectChat,
  sendMessage: sendMessageAction,
  startTyping,
  stopTyping,
  markAsRead
} = useRealtimeChat()

// Refs
const messagesContainer = ref(null)
const messageInput = ref(null)
const messageText = ref('')
const replyingTo = ref(null)
const editingMessage = ref(null)
const typingTimer = ref(null)
const isTypingActive = ref(false)

// Computed
const chatStatusText = computed(() => {
  switch (chatStatus.value) {
    case 'connecting': return 'Connecting...'
    case 'connected': return 'Connected'
    case 'error': return 'Error'
    default: return 'Disconnected'
  }
})

// Methods
async function connectChat() {
  if (!authStore.token) {
    console.error('No auth token available')
    return
  }
  
  try {
    await connectToChatAction(props.roomId, authStore.token)
  } catch (error) {
    console.error('Failed to connect to chat:', error)
  }
}

async function reconnectChat() {
  await connectChat()
}

function sendMessage() {
  const content = messageText.value.trim()
  if (!content) return

  if (editingMessage.value) {
    // Handle edit (would need API endpoint)
    console.log('Edit message:', editingMessage.value.id, content)
    cancelEdit()
  } else {
    // Send new message
    sendMessageAction(content, replyingTo.value?.id)
    cancelReply()
  }
  
  messageText.value = ''
  stopTyping()
  
  // Auto-resize textarea
  if (messageInput.value) {
    messageInput.value.style.height = 'auto'
  }
}

function startReply(message) {
  replyingTo.value = message
  focusInput()
}

function cancelReply() {
  replyingTo.value = null
}

function startEdit(message) {
  editingMessage.value = message
  messageText.value = message.content
  focusInput()
}

function cancelEdit() {
  editingMessage.value = null
  messageText.value = ''
}

function onTyping() {
  if (!isTypingActive.value) {
    isTypingActive.value = true
    startTyping()
  }
  
  // Clear existing timer
  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
  }
  
  // Set timer to stop typing
  typingTimer.value = setTimeout(() => {
    isTypingActive.value = false
    stopTyping()
  }, 2000)
  
  // Auto-resize textarea
  autoResizeTextarea()
}

function onKeyDown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

function autoResizeTextarea() {
  if (messageInput.value) {
    messageInput.value.style.height = 'auto'
    messageInput.value.style.height = messageInput.value.scrollHeight + 'px'
  }
}

function focusInput() {
  nextTick(() => {
    if (messageInput.value) {
      messageInput.value.focus()
    }
  })
}

function isOwnMessage(message) {
  return message.user.id === authStore.user?.id
}

function canEdit(message) {
  return (
    isOwnMessage(message) && 
    !message.is_deleted &&
    message.can_edit
  )
}

function formatTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMinutes = Math.floor(diffMs / 60000)
  
  if (diffMinutes < 1) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`
  
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatTypingUsers(users) {
  if (users.length === 1) return users[0]
  if (users.length === 2) return `${users[0]} and ${users[1]}`
  return `${users.slice(0, -1).join(', ')} and ${users[users.length - 1]}`
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// Watchers
watch(messages, () => {
  scrollToBottom()
}, { deep: true })

// Lifecycle
onMounted(() => {
  if (authStore.token) {
    connectChat()
  }
})

onUnmounted(() => {
  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
  }
  stopTyping()
  disconnectChat()
})
</script>

<style scoped>
.realtime-chat {
  display: flex;
  flex-direction: column;
  height: 600px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.chat-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9em;
}

.chat-status.connected {
  color: #4CAF50;
}

.chat-status.connecting {
  color: #ff9800;
}

.chat-status.error {
  color: #f44336;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.chat-error {
  padding: 15px 20px;
  background: #f8d7da;
  color: #721c24;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  scroll-behavior: smooth;
}

.no-messages {
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 40px 20px;
}

.message {
  margin-bottom: 15px;
  max-width: 70%;
}

.message.own-message {
  margin-left: auto;
}

.message.own-message .message-content {
  background: #2196F3;
  color: white;
}

.message.reply-message {
  margin-top: 20px;
}

.reply-reference {
  background: #e3f2fd;
  padding: 8px 12px;
  border-radius: 8px 8px 0 0;
  font-size: 0.85em;
  border-left: 3px solid #2196F3;
}

.reply-user {
  font-weight: bold;
  color: #2196F3;
}

.reply-content {
  color: #666;
  margin-left: 8px;
}

.message-content {
  background: #f5f5f5;
  padding: 12px 15px;
  border-radius: 18px;
  position: relative;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
  font-size: 0.85em;
}

.message-user {
  font-weight: bold;
  color: #2196F3;
}

.message-time {
  color: #666;
}

.edited-label {
  color: #999;
  font-style: italic;
}

.message-text {
  word-wrap: break-word;
  white-space: pre-wrap;
}

.message-actions {
  display: none;
  position: absolute;
  top: -10px;
  right: 10px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  padding: 5px;
}

.message:hover .message-actions {
  display: flex;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px 8px;
  border-radius: 15px;
  font-size: 0.9em;
}

.action-btn:hover {
  background: #f0f0f0;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #666;
  font-style: italic;
  padding: 10px 0;
}

.typing-dots {
  display: flex;
  gap: 3px;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  background: #666;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.reply-preview, .edit-preview {
  padding: 10px 20px;
  background: #e3f2fd;
  border-top: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reply-preview-content, .edit-preview-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.reply-to-user, .edit-label {
  font-weight: bold;
  color: #2196F3;
  font-size: 0.9em;
}

.reply-to-text, .edit-original {
  color: #666;
  font-size: 0.85em;
}

.cancel-reply, .cancel-edit {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
  color: #666;
  padding: 5px 10px;
}

.message-input-container {
  padding: 15px 20px;
  border-top: 1px solid #ddd;
  background: #f9f9f9;
}

.message-form {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.message-input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 20px;
  resize: none;
  font-family: inherit;
  line-height: 1.4;
  max-height: 120px;
}

.message-input:focus {
  outline: none;
  border-color: #2196F3;
}

.send-button {
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.connection-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 40px;
}

.unread-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #f44336;
  color: white;
  border-radius: 15px;
  padding: 2px 8px;
  font-size: 0.8em;
  font-weight: bold;
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

.btn-sm {
  padding: 5px 10px;
  font-size: 12px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>