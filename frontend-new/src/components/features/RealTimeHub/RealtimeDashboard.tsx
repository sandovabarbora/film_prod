// src/components/features/RealTimeHub/RealtimeDashboard.tsx
import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useRealtime, useRealtimeEvents } from '../../../hooks/useRealtime'
import { useAuth } from '../../../hooks/useAuth'

interface Props {
  productionId: string
}

interface StatusForm {
  scene: string
  shot: string
  status: string
  notes: string
  location: string
}

interface ShotForm {
  shotId: string
  takeNumber: number
  status: string
}

interface AlertForm {
  equipmentId: string
  alertType: string
  severity: string
  description: string
}

const RealtimeDashboard: React.FC<Props> = ({ productionId }) => {
  const { user, token } = useAuth()
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

  // Forms state
  const [statusForm, setStatusForm] = useState<StatusForm>({
    scene: '',
    shot: '',
    status: 'prep',
    notes: '',
    location: ''
  })

  const [shotForm, setShotForm] = useState<ShotForm>({
    shotId: '',
    takeNumber: 1,
    status: 'setup'
  })

  const [alertForm, setAlertForm] = useState<AlertForm>({
    equipmentId: '',
    alertType: 'malfunction',
    severity: 'medium',
    description: ''
  })

  // Computed values
  const connectionStatusText = {
    connecting: 'Connecting...',
    connected: 'Connected',
    error: 'Connection Error',
    disconnected: 'Disconnected'
  }[connectionStatus] || 'Disconnected'

  const canBroadcast = productionState.userPermissions?.can_broadcast || false

  // Effects
  useEffect(() => {
    if (token && productionId) {
      connectToProduction(productionId, token)
    }

    return () => {
      disconnect()
    }
  }, [productionId, token, connectToProduction, disconnect])

  // Form handlers
  const handleStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    sendStatusUpdateAction({
      scene: statusForm.scene,
      shot: statusForm.shot,
      status: statusForm.status,
      notes: statusForm.notes,
      location: statusForm.location
    })

    // Clear form
    setStatusForm({
      scene: '',
      shot: '',
      status: 'prep',
      notes: '',
      location: ''
    })
  }

  const handleShotProgress = (e: React.FormEvent) => {
    e.preventDefault()
    sendShotProgressAction({
      shotId: shotForm.shotId,
      takeNumber: shotForm.takeNumber,
      status: shotForm.status as any
    })

    // Increment take number for next shot
    if (shotForm.status === 'complete') {
      setShotForm(prev => ({
        ...prev,
        takeNumber: 1,
        shotId: ''
      }))
    } else {
      setShotForm(prev => ({
        ...prev,
        takeNumber: prev.takeNumber + 1
      }))
    }
  }

  const handleEquipmentAlert = (e: React.FormEvent) => {
    e.preventDefault()
    sendEquipmentAlertAction({
      equipmentId: alertForm.equipmentId,
      alertType: alertForm.alertType as any,
      severity: alertForm.severity as any,
      description: alertForm.description
    })

    // Clear form
    setAlertForm({
      equipmentId: '',
      alertType: 'malfunction',
      severity: 'medium',
      description: ''
    })
  }

  const formatEventType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <Container>
      {/* Connection Status */}
      <ConnectionStatus className={connectionStatus}>
        <StatusIndicator>
          <StatusDot />
          <StatusText>{connectionStatusText}</StatusText>
        </StatusIndicator>
        
        {connectionError && (
          <ErrorMessage>{connectionError}</ErrorMessage>
        )}
      </ConnectionStatus>

      {/* Production Info */}
      {isConnected && (
        <ProductionInfo>
          <h2>{productionState.title}</h2>
          <ProductionStats>
            <Stat>
              <StatLabel>Active Connections:</StatLabel>
              <StatValue>{productionState.activeConnections}</StatValue>
            </Stat>
          </ProductionStats>
        </ProductionInfo>
      )}

      {/* Control Panel */}
      {isConnected && canBroadcast && (
        <ControlPanel>
          <h3>Production Controls</h3>
          
          {/* Status Update Form */}
          <StatusForm onSubmit={handleStatusUpdate}>
            <h4>Status Update</h4>
            <FormRow>
              <FormInput
                value={statusForm.scene}
                onChange={(e) => setStatusForm(prev => ({...prev, scene: e.target.value}))}
                placeholder="Scene (e.g., INT. 1A)"
              />
              <FormInput
                value={statusForm.shot}
                onChange={(e) => setStatusForm(prev => ({...prev, shot: e.target.value}))}
                placeholder="Shot (e.g., 001)"
              />
            </FormRow>
            <FormRow>
              <FormSelect
                value={statusForm.status}
                onChange={(e) => setStatusForm(prev => ({...prev, status: e.target.value}))}
              >
                <option value="prep">Preparing</option>
                <option value="rehearsal">Rehearsing</option>
                <option value="lighting">Lighting</option>
                <option value="rolling">Rolling</option>
                <option value="reset">Resetting</option>
                <option value="moving_on">Moving On</option>
                <option value="meal_break">Meal Break</option>
                <option value="wrapped">Wrapped</option>
              </FormSelect>
            </FormRow>
            <FormTextarea
              value={statusForm.notes}
              onChange={(e) => setStatusForm(prev => ({...prev, notes: e.target.value}))}
              placeholder="Notes (optional)"
            />
            <Button type="submit" variant="primary">Send Status Update</Button>
          </StatusForm>

          {/* Shot Progress Form */}
          <ShotFormContainer onSubmit={handleShotProgress}>
            <h4>Shot Progress</h4>
            <FormRow>
              <FormInput
                value={shotForm.shotId}
                onChange={(e) => setShotForm(prev => ({...prev, shotId: e.target.value}))}
                placeholder="Shot ID"
              />
              <FormInput
                type="number"
                value={shotForm.takeNumber}
                onChange={(e) => setShotForm(prev => ({...prev, takeNumber: parseInt(e.target.value)}))}
                placeholder="Take"
              />
            </FormRow>
            <FormRow>
              <FormSelect
                value={shotForm.status}
                onChange={(e) => setShotForm(prev => ({...prev, status: e.target.value}))}
              >
                <option value="setup">Setup</option>
                <option value="rolling">Rolling</option>
                <option value="cut">Cut</option>
                <option value="complete">Complete</option>
              </FormSelect>
            </FormRow>
            <Button type="submit" variant="primary">Send Shot Progress</Button>
          </ShotFormContainer>

          {/* Equipment Alert Form */}
          <AlertFormContainer onSubmit={handleEquipmentAlert}>
            <h4>Equipment Alert</h4>
            <FormRow>
              <FormInput
                value={alertForm.equipmentId}
                onChange={(e) => setAlertForm(prev => ({...prev, equipmentId: e.target.value}))}
                placeholder="Equipment ID"
              />
              <FormSelect
                value={alertForm.alertType}
                onChange={(e) => setAlertForm(prev => ({...prev, alertType: e.target.value}))}
              >
                <option value="malfunction">Malfunction</option>
                <option value="missing">Missing</option>
                <option value="maintenance">Maintenance</option>
              </FormSelect>
            </FormRow>
            <FormRow>
              <FormSelect
                value={alertForm.severity}
                onChange={(e) => setAlertForm(prev => ({...prev, severity: e.target.value}))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </FormSelect>
            </FormRow>
            <FormTextarea
              value={alertForm.description}
              onChange={(e) => setAlertForm(prev => ({...prev, description: e.target.value}))}
              placeholder="Description"
              required
            />
            <Button type="submit" variant="warning">Send Equipment Alert</Button>
          </AlertFormContainer>
        </ControlPanel>
      )}

      {/* Recent Events */}
      {isConnected && (
        <RecentEvents>
          <h3>Recent Events</h3>
          {realtimeEvents.length === 0 ? (
            <NoEvents>No recent events</NoEvents>
          ) : (
            <EventsList>
              {realtimeEvents.slice(0, 10).map((event) => (
                <EventItem key={event.id} priority={event.priority}>
                  <EventHeader>
                    <EventType>{formatEventType(event.event_type)}</EventType>
                    <EventTime>{formatTime(event.created_at)}</EventTime>
                  </EventHeader>
                  <EventTitle>{event.title}</EventTitle>
                  {event.event_data && Object.keys(event.event_data).length > 0 && (
                    <EventData>
                      <pre>{JSON.stringify(event.event_data, null, 2)}</pre>
                    </EventData>
                  )}
                </EventItem>
              ))}
            </EventsList>
          )}
        </RecentEvents>
      )}

      {/* Specific Event Lists */}
      {isConnected && (
        <SpecificEvents>
          {/* Emergency Alerts */}
          {emergencyAlerts.length > 0 && (
            <EmergencyAlerts>
              <h3>🚨 Emergency Alerts</h3>
              {emergencyAlerts.map((alert, index) => (
                <EmergencyAlert key={index}>
                  <strong>{alert.emergency_type}</strong>
                  <p>{alert.description}</p>
                  <small>{alert.location} - {formatTime(alert.timestamp)}</small>
                </EmergencyAlert>
              ))}
            </EmergencyAlerts>
          )}

          {/* Equipment Alerts */}
          {equipmentAlerts.length > 0 && (
            <EquipmentAlerts>
              <h3>⚠️ Equipment Alerts</h3>
              {equipmentAlerts.map((alert, index) => (
                <EquipmentAlert key={index} severity={alert.severity}>
                  <strong>{alert.equipment_id}</strong> - {alert.alert_type}
                  <p>{alert.description}</p>
                </EquipmentAlert>
              ))}
            </EquipmentAlerts>
          )}
        </SpecificEvents>
      )}
    </Container>
  )
}

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`

const ConnectionStatus = styled.div<{ className: string }>`
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #ccc;

  &.connected {
    background: #e8f5e8;
    border-color: #4CAF50;
  }

  &.connecting {
    background: #fff3cd;
    border-color: #ffc107;
  }

  &.error {
    background: #f8d7da;
    border-color: #dc3545;
  }
`

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const StatusDot = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ccc;

  ${ConnectionStatus}.connected & {
    background: #4CAF50;
    animation: pulse 2s infinite;
  }

  ${ConnectionStatus}.connecting & {
    background: #ffc107;
    animation: blink 1s infinite;
  }

  ${ConnectionStatus}.error & {
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
`

const StatusText = styled.span``

const ErrorMessage = styled.div`
  color: #721c24;
  margin-top: 10px;
`

const ProductionInfo = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`

const ProductionStats = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 10px;
`

const Stat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`

const StatLabel = styled.span`
  font-size: 0.9em;
  color: #666;
`

const StatValue = styled.span`
  font-size: 1.5em;
  font-weight: bold;
  color: #2196F3;
`

const ControlPanel = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`

const StatusForm = styled.form`
  margin-bottom: 30px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
`

const ShotFormContainer = styled.form`
  margin-bottom: 30px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
`

const AlertFormContainer = styled.form`
  margin-bottom: 30px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
`

const FormRow = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
`

const FormInput = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  flex: 1;
`

const FormSelect = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  flex: 1;
`

const FormTextarea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  margin-bottom: 15px;
`

const Button = styled.button<{ variant: string }>`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;

  ${({ variant }) => {
    if (variant === 'primary') return 'background: #2196F3; color: white;'
    if (variant === 'warning') return 'background: #ff9800; color: white;'
    return 'background: #ccc; color: #333;'
  }}

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const RecentEvents = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`

const NoEvents = styled.div`
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 40px 0;
`

const EventsList = styled.div`
  max-height: 400px;
  overflow-y: auto;
`

const EventItem = styled.div<{ priority: string }>`
  padding: 15px;
  margin-bottom: 10px;
  background: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid #ccc;

  ${({ priority }) => {
    if (priority === 'high') return 'border-color: #ff9800; background: #fff3e0;'
    if (priority === 'urgent') return 'border-color: #f44336; background: #ffebee;'
    return ''
  }}
`

const EventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
`

const EventType = styled.span`
  font-weight: bold;
  text-transform: capitalize;
`

const EventTime = styled.span`
  font-size: 0.9em;
  color: #666;
`

const EventTitle = styled.div`
  font-weight: 500;
  margin-bottom: 5px;
`

const EventData = styled.div`
  margin-top: 10px;
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  font-size: 0.8em;

  pre {
    margin: 0;
    white-space: pre-wrap;
  }
`

const SpecificEvents = styled.div``

const EmergencyAlerts = styled.div`
  background: #ffebee;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 2px solid #f44336;
`

const EmergencyAlert = styled.div`
  background: white;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
`

const EquipmentAlerts = styled.div`
  background: #fff3e0;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 2px solid #ff9800;
`

const EquipmentAlert = styled.div<{ severity: string }>`
  background: white;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;

  ${({ severity }) => {
    if (severity === 'high') return 'border-left: 4px solid #f44336;'
    if (severity === 'medium') return 'border-left: 4px solid #ff9800;'
    if (severity === 'low') return 'border-left: 4px solid #4CAF50;'
    return ''
  }}
`

export default RealtimeDashboard