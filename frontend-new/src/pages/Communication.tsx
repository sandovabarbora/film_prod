// src/pages/Communication.tsx
import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useParams } from 'react-router-dom'
import RealtimeDashboard from '../components/features/RealTimeHub/RealtimeDashboard'
import RealtimeChat from '../components/features/RealTimeHub/RealtimeChat'
import { useRealtime, useRealtimeChat, useRealtimeEvents } from '../hooks/useRealtime'
import { useProduction } from '../hooks/useProduction'
import { useAuth } from '../hooks/useAuth'
import { realtimeApi } from '../services/realtimeApi'

interface ToastNotification {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
}

const Communication: React.FC = () => {
  const { productionId } = useParams<{ productionId: string }>()
  const { user, token } = useAuth()
  const { currentProduction, getProduction } = useProduction()
  
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
  const [showDashboard, setShowDashboard] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showQuickStatus, setShowQuickStatus] = useState(false)
  const [chatRoomId, setChatRoomId] = useState<string | null>(null)
  const [toasts, setToasts] = useState<ToastNotification[]>([])
  const [chatRooms, setChatRooms] = useState<any[]>([])

  // Quick status form
  const [quickStatus, setQuickStatus] = useState({
    status: 'prep',
    scene: '',
    notes: ''
  })

  // Computed values
  const realtimeStatusText = {
    connecting: 'Connecting...',
    connected: 'Connected',
    error: 'Error',
    disconnected: 'Disconnected'
  }[connectionStatus] || 'Disconnected'

  const chatStatusText = {
    connecting: 'Connecting...',
    connected: 'Connected',
    error: 'Error',
    disconnected: 'Disconnected'
  }[chatStatus] || 'Disconnected'

  // Effects
  useEffect(() => {
    if (productionId && token) {
      initializePage()
    }

    return () => {
      disconnect()
    }
  }, [productionId, token])

  // Setup realtime event handlers
  useEffect(() => {
    const handleEmergencyAlert = (data: any) => {
      addToast('error', '🚨 EMERGENCY', data.description)
      // Play urgent sound
      playNotificationSound('emergency')
    }
    
    const handleEquipmentAlert = (data: any) => {
      addToast('warning', '⚠️ Equipment Alert', 
        `${data.equipment_id}: ${data.description}`)
    }
    
    const handleBroadcastMessage = (data: any) => {
      addToast('info', '📢 Broadcast', data.message)
    }

    // These would need to be added to the WebSocket client
    // WebSocketClient.on('emergency_alert', handleEmergencyAlert)
    // WebSocketClient.on('equipment_alert', handleEquipmentAlert)
    // WebSocketClient.on('broadcast_message', handleBroadcastMessage)

    return () => {
      // Cleanup listeners
    }
  }, [])

  // Methods
  const initializePage = async () => {
    if (!productionId || !token) return

    try {
      // Load production data
      const production = await getProduction(productionId)
      
      // Load chat rooms
      const rooms = await realtimeApi.getChatRooms(productionId)
      setChatRooms(rooms)
      
      // Set default chat room
      const defaultRoom = rooms.find(room => room.room_type === 'general') || rooms[0]
      if (defaultRoom) {
        setChatRoomId(defaultRoom.id)
      }
      
      // Connect to realtime services
      await connectToProduction(productionId, token)
      
      // Auto-connect to chat if user preference
      if (defaultRoom && localStorage.getItem('auto_connect_chat') !== 'false') {
        await connectToChat(defaultRoom.id, token)
      }
    } catch (error) {
      console.error('Failed to initialize communication page:', error)
      addToast('error', 'Connection Error', 'Failed to connect to realtime services')
    }
  }

  const toggleDashboard = () => {
    setShowDashboard(!showDashboard)
    if (showChat && !showDashboard) {
      setShowChat(false) // Close chat if dashboard opens
    }
  }

  const toggleChat = () => {
    setShowChat(!showChat)
    if (showDashboard && !showChat) {
      setShowDashboard(false) // Close dashboard if chat opens
    }
    
    // Connect to chat if not already connected
    if (!showChat && !isChatConnected && chatRoomId && token) {
      connectToChat(chatRoomId, token)
    }
  }

  const quickStatusUpdate = () => {
    setShowQuickStatus(true)
  }

  const handleQuickStatus = (e: React.FormEvent) => {
    e.preventDefault()
    const [scene, shot] = quickStatus.scene.split(' - ')
    
    sendStatusUpdate({
      scene: scene || '',
      shot: shot || '',
      status: quickStatus.status,
      notes: quickStatus.notes
    })
    
    setShowQuickStatus(false)
    setQuickStatus({ status: 'prep', scene: '', notes: '' })
    
    addToast('success', 'Status Updated', `Status changed to ${quickStatus.status}`)
  }

  const emergencyAlert = () => {
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

  const addToast = (type: ToastNotification['type'], title: string, message: string) => {
    const toast: ToastNotification = {
      id: Date.now(),
      type,
      title,
      message
    }
    
    setToasts(prev => [...prev, toast])
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeToast(toast.id)
    }, 5000)
  }

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const playNotificationSound = (type: string) => {
    try {
      const audio = new Audio(`/sounds/${type}.mp3`)
      audio.play().catch(() => {})
    } catch (error) {
      console.log('Could not play notification sound')
    }
  }

  const switchChatRoom = (roomId: string) => {
    setChatRoomId(roomId)
    if (isChatConnected && token) {
      connectToChat(roomId, token)
    }
  }

  if (!productionId) {
    return (
      <Container>
        <ErrorMessage>No production selected</ErrorMessage>
      </Container>
    )
  }

  return (
    <Container>
      {/* Header */}
      <Header>
        <h1>Communication Center</h1>
        <HeaderActions>
          <ChatRoomSelector>
            <label>Chat Room:</label>
            <select 
              value={chatRoomId || ''} 
              onChange={(e) => switchChatRoom(e.target.value)}
            >
              {chatRooms.map(room => (
                <option key={room.id} value={room.id}>
                  {room.name} {room.unread_count > 0 && `(${room.unread_count})`}
                </option>
              ))}
            </select>
          </ChatRoomSelector>
          
          <Button onClick={toggleChat} variant="outline">
            💬 Chat {unreadCount > 0 && `(${unreadCount})`}
          </Button>
          <Button onClick={toggleDashboard} variant="outline">
            📊 Dashboard
          </Button>
        </HeaderActions>
      </Header>

      {/* Main Content Area */}
      <ContentGrid>
        {/* Left Panel - Production Overview */}
        <ContentPanel>
          <ProductionOverview>
            <h2>{currentProduction?.title || 'Loading...'}</h2>
            <div className="production-stats">
              <div className="stat">
                <span className="stat-label">Status:</span>
                <span className="stat-value">{productionState.title || 'Not Connected'}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Active Users:</span>
                <span className="stat-value">{productionState.activeConnections}</span>
              </div>
            </div>
          </ProductionOverview>

          {/* Recent Activity */}
          <RecentActivity>
            <h3>Recent Activity</h3>
            {emergencyAlerts.length > 0 && (
              <div className="emergency-section">
                <h4>🚨 Emergency Alerts</h4>
                {emergencyAlerts.slice(0, 3).map((alert, index) => (
                  <div key={index} className="alert-item emergency">
                    <strong>{alert.emergency_type}</strong>
                    <p>{alert.description}</p>
                    <small>{alert.location}</small>
                  </div>
                ))}
              </div>
            )}

            {equipmentAlerts.length > 0 && (
              <div className="equipment-section">
                <h4>⚠️ Equipment Alerts</h4>
                {equipmentAlerts.slice(0, 3).map((alert, index) => (
                  <div key={index} className="alert-item equipment">
                    <strong>{alert.equipment_id}</strong> - {alert.alert_type}
                    <p>{alert.description}</p>
                  </div>
                ))}
              </div>
            )}

            {broadcastMessages.length > 0 && (
              <div className="broadcast-section">
                <h4>📢 Broadcasts</h4>
                {broadcastMessages.slice(0, 3).map((msg, index) => (
                  <div key={index} className="alert-item broadcast">
                    <p>{msg.message}</p>
                  </div>
                ))}
              </div>
            )}
          </RecentActivity>
        </ContentPanel>

        {/* Right Panel - Realtime Dashboard */}
        {showDashboard && (
          <SidebarPanel>
            <PanelHeader>
              <h3>Realtime Dashboard</h3>
              <CloseBtn onClick={() => setShowDashboard(false)}>×</CloseBtn>
            </PanelHeader>
            <RealtimeDashboard productionId={productionId} />
          </SidebarPanel>
        )}

        {/* Chat Panel (Overlay) */}
        {showChat && chatRoomId && (
          <ChatOverlay onClick={(e) => e.target === e.currentTarget && setShowChat(false)}>
            <ChatPanel>
              <PanelHeader>
                <h3>Production Chat</h3>
                <CloseBtn onClick={() => setShowChat(false)}>×</CloseBtn>
              </PanelHeader>
              <RealtimeChat roomId={chatRoomId} />
            </ChatPanel>
          </ChatOverlay>
        )}
      </ContentGrid>

      {/* Status Bar */}
      <StatusBar>
        <ConnectionIndicators>
          <Indicator className={connectionStatus}>
            <IndicatorDot />
            <span>Production: {realtimeStatusText}</span>
          </Indicator>
          <Indicator className={chatStatus}>
            <IndicatorDot />
            <span>Chat: {chatStatusText}</span>
          </Indicator>
        </ConnectionIndicators>
        
        <QuickActions>
          <Button
            onClick={quickStatusUpdate}
            disabled={!isConnected}
            variant="success"
            size="sm"
          >
            📢 Quick Status
          </Button>
          <Button
            onClick={emergencyAlert}
            variant="danger"
            size="sm"
          >
            🚨 Emergency
          </Button>
        </QuickActions>
      </StatusBar>

      {/* Toast Notifications */}
      <ToastContainer>
        {toasts.map((toast) => (
          <Toast key={toast.id} type={toast.type}>
            <ToastContent>
              <strong>{toast.title}</strong>
              <p>{toast.message}</p>
            </ToastContent>
            <ToastClose onClick={() => removeToast(toast.id)}>×</ToastClose>
          </Toast>
        ))}
      </ToastContainer>

      {/* Quick Status Modal */}
      {showQuickStatus && (
        <ModalOverlay onClick={(e) => e.target === e.currentTarget && setShowQuickStatus(false)}>
          <Modal>
            <ModalHeader>
              <h3>Quick Status Update</h3>
              <CloseBtn onClick={() => setShowQuickStatus(false)}>×</CloseBtn>
            </ModalHeader>
            <ModalBody>
              <form onSubmit={handleQuickStatus}>
                <FormGroup>
                  <label>Current Status:</label>
                  <select 
                    value={quickStatus.status} 
                    onChange={(e) => setQuickStatus(prev => ({...prev, status: e.target.value}))}
                  >
                    <option value="prep">Preparing</option>
                    <option value="rehearsal">Rehearsing</option>
                    <option value="lighting">Lighting</option>
                    <option value="rolling">Rolling</option>
                    <option value="reset">Resetting</option>
                    <option value="moving_on">Moving On</option>
                    <option value="meal_break">Meal Break</option>
                    <option value="wrapped">Wrapped</option>
                  </select>
                </FormGroup>
                <FormGroup>
                  <label>Scene/Shot:</label>
                  <input 
                    value={quickStatus.scene}
                    onChange={(e) => setQuickStatus(prev => ({...prev, scene: e.target.value}))}
                    placeholder="e.g., INT. 1A - 001" 
                  />
                </FormGroup>
                <FormGroup>
                  <label>Notes:</label>
                  <textarea 
                    value={quickStatus.notes}
                    onChange={(e) => setQuickStatus(prev => ({...prev, notes: e.target.value}))}
                    placeholder="Optional notes..." 
                  />
                </FormGroup>
                <ModalActions>
                  <Button type="button" onClick={() => setShowQuickStatus(false)} variant="secondary">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    Send Update
                  </Button>
                </ModalActions>
              </form>
            </ModalBody>
          </Modal>
        </ModalOverlay>
      )}
    </Container>
  )
}

// Styled Components
const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-bottom: 1px solid #ddd;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  h1 {
    margin: 0;
  }
`

const HeaderActions = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
`

const ChatRoomSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  label {
    font-weight: 500;
  }

  select {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
  }
`

const ContentGrid = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`

const ContentPanel = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`

const ProductionOverview = styled.div`
  background: white;
  padding: 25px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  h2 {
    margin: 0 0 15px 0;
  }

  .production-stats {
    display: flex;
    gap: 30px;
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
    font-size: 1.3em;
    font-weight: bold;
    color: #2196F3;
  }
`

const RecentActivity = styled.div`
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  h3 {
    margin: 0 0 20px 0;
  }

  h4 {
    margin: 20px 0 10px 0;
    font-size: 1.1em;
  }

  .alert-item {
    padding: 15px;
    margin-bottom: 10px;
    border-radius: 6px;
    border-left: 4px solid #ccc;

    &.emergency {
      background: #ffebee;
      border-color: #f44336;
    }

    &.equipment {
      background: #fff3e0;
      border-color: #ff9800;
    }

    &.broadcast {
      background: #e3f2fd;
      border-color: #2196F3;
    }

    strong {
      display: block;
      margin-bottom: 5px;
    }

    p {
      margin: 5px 0;
      color: #666;
    }

    small {
      color: #999;
    }
  }
`

const SidebarPanel = styled.div`
  width: 400px;
  background: white;
  border-left: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const ChatOverlay = styled.div`
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
`

const ChatPanel = styled.div`
  width: 600px;
  height: 700px;
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;

  h3 {
    margin: 0;
  }
`

const CloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #f0f0f0;
    border-radius: 4px;
  }
`

const StatusBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: white;
  border-top: 1px solid #ddd;
`

const ConnectionIndicators = styled.div`
  display: flex;
  gap: 20px;
`

const Indicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9em;

  &.connected {
    color: #4CAF50;
  }

  &.connecting {
    color: #ff9800;
  }

  &.error, &.disconnected {
    color: #f44336;
  }
`

const IndicatorDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
`

const QuickActions = styled.div`
  display: flex;
  gap: 10px;
`

const Button = styled.button<{ variant?: string; size?: string }>`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;

  ${({ variant }) => {
    switch (variant) {
      case 'primary': return 'background: #2196F3; color: white;'
      case 'secondary': return 'background: #6c757d; color: white;'
      case 'success': return 'background: #4CAF50; color: white;'
      case 'danger': return 'background: #f44336; color: white;'
      case 'outline': return 'background: transparent; border: 1px solid #ddd; color: #333;'
      default: return 'background: #e0e0e0; color: #333;'
    }
  }}

  ${({ size }) => {
    if (size === 'sm') return 'padding: 5px 10px; font-size: 12px;'
    return ''
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    opacity: 0.9;
  }
`

const ToastContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 2000;
`

const Toast = styled.div<{ type: string }>`
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

  ${({ type }) => {
    switch (type) {
      case 'success': return 'border-color: #4CAF50;'
      case 'error': return 'border-color: #f44336;'
      case 'warning': return 'border-color: #ff9800;'
      case 'info': return 'border-color: #2196F3;'
      default: return ''
    }
  }}
`

const ToastContent = styled.div`
  strong {
    display: block;
    margin-bottom: 5px;
  }

  p {
    margin: 0;
    color: #666;
  }
`

const ToastClose = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
  color: #666;
  margin-left: 10px;
  padding: 0;
`

const ModalOverlay = styled.div`
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
`

const Modal = styled.div`
  background: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #ddd;

  h3 {
    margin: 0;
  }
`

const ModalBody = styled.div`
  padding: 20px;
`

const FormGroup = styled.div`
  margin-bottom: 20px;

  label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
  }

  input, select, textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    box-sizing: border-box;

    &:focus {
      outline: none;
      border-color: #2196F3;
    }
  }

  textarea {
    min-height: 80px;
    resize: vertical;
  }
`

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`

const ErrorMessage = styled.div`
  text-align: center;
  color: #f44336;
  font-size: 1.2em;
  padding: 40px;
`

export default Communication