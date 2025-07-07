// src/components/features/RealTimeHub/RealtimeChat.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react'
import styled from 'styled-components'
import { useRealtimeChat } from '../../../hooks/useRealtime'
import { useAuth } from '../../../hooks/useAuth'
import { ChatMessage } from '../../../services/realtimeApi'

interface Props {
  roomId: string
}

const RealtimeChat: React.FC<Props> = ({ roomId }) => {
  const { user, token } = useAuth()
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
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const messageInputRef = useRef<HTMLTextAreaElement>(null)
  
  // Local state
  const [messageText, setMessageText] = useState('')
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null)
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null)
  const [typingTimer, setTypingTimer] = useState<NodeJS.Timeout | null>(null)
  const [isTypingActive, setIsTypingActive] = useState(false)

  // Computed values
  const chatStatusText = {
    connecting: 'Connecting...',
    connected: 'Connected',
    error: 'Error',
    disconnected: 'Disconnected'
  }[chatStatus] || 'Disconnected'

  // Effects
  useEffect(() => {
    if (token && roomId) {
      connectChat()
    }

    return () => {
      if (typingTimer) {
        clearTimeout(typingTimer)
      }
      stopTyping()
      disconnectChat()
    }
  }, [roomId, token])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Methods
  const connectChat = async () => {
    if (!token) {
      console.error('No auth token available')
      return
    }
    
    try {
      await connectToChatAction(roomId, token)
    } catch (error) {
      console.error('Failed to connect to chat:', error)
    }
  }

  const reconnectChat = async () => {
    await connectChat()
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    const content = messageText.trim()
    if (!content) return

    if (editingMessage) {
      // Handle edit (would need API endpoint)
      console.log('Edit message:', editingMessage.id, content)
      cancelEdit()
    } else {
      // Send new message
      sendMessageAction(content, replyingTo?.id)
      cancelReply()
    }
    
    setMessageText('')
    stopTyping()
    
    // Auto-resize textarea
    if (messageInputRef.current) {
      messageInputRef.current.style.height = 'auto'
    }
  }

  const startReply = (message: ChatMessage) => {
    setReplyingTo(message)
    focusInput()
  }

  const cancelReply = () => {
    setReplyingTo(null)
  }

  const startEdit = (message: ChatMessage) => {
    setEditingMessage(message)
    setMessageText(message.content)
    focusInput()
  }

  const cancelEdit = () => {
    setEditingMessage(null)
    setMessageText('')
  }

  const handleTyping = () => {
    if (!isTypingActive) {
      setIsTypingActive(true)
      startTyping()
    }
    
    // Clear existing timer
    if (typingTimer) {
      clearTimeout(typingTimer)
    }
    
    // Set timer to stop typing
    const timer = setTimeout(() => {
      setIsTypingActive(false)
      stopTyping()
    }, 2000)
    
    setTypingTimer(timer)
    
    // Auto-resize textarea
    autoResizeTextarea()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  const autoResizeTextarea = () => {
    if (messageInputRef.current) {
      messageInputRef.current.style.height = 'auto'
      messageInputRef.current.style.height = messageInputRef.current.scrollHeight + 'px'
    }
  }

  const focusInput = useCallback(() => {
    setTimeout(() => {
      if (messageInputRef.current) {
        messageInputRef.current.focus()
      }
    }, 0)
  }, [])

  const isOwnMessage = (message: ChatMessage) => {
    return message.user.id === user?.id
  }

  const canEdit = (message: ChatMessage) => {
    return (
      isOwnMessage(message) && 
      !message.is_deleted &&
      message.can_edit
    )
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / 60000)
    
    if (diffMinutes < 1) return 'just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatTypingUsers = (users: string[]) => {
    if (users.length === 1) return users[0]
    if (users.length === 2) return `${users[0]} and ${users[1]}`
    return `${users.slice(0, -1).join(', ')} and ${users[users.length - 1]}`
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
      }
    }, 0)
  }

  return (
    <Container>
      {/* Chat Header */}
      <ChatHeader>
        <h3>Production Chat</h3>
        <ChatStatus className={chatStatus}>
          <StatusDot />
          <span>{chatStatusText}</span>
        </ChatStatus>
      </ChatHeader>

      {/* Connection Error */}
      {chatError && (
        <ChatError>
          {chatError}
          <Button onClick={reconnectChat} variant="primary" size="sm">
            Reconnect
          </Button>
        </ChatError>
      )}

      {/* Chat Messages */}
      {isChatConnected ? (
        <ChatContainer>
          <MessagesContainer ref={messagesContainerRef}>
            {messages.length === 0 ? (
              <NoMessages>No messages yet. Start the conversation!</NoMessages>
            ) : (
              messages.map((message) => (
                <Message
                  key={message.id}
                  isOwn={isOwnMessage(message)}
                  hasReply={!!message.reply_to}
                >
                  {/* Reply Reference */}
                  {message.reply_to && (
                    <ReplyReference>
                      <ReplyUser>{message.reply_to.user}</ReplyUser>
                      <ReplyContent>{message.reply_to.content}</ReplyContent>
                    </ReplyReference>
                  )}
                  
                  {/* Message Content */}
                  <MessageContent isOwn={isOwnMessage(message)}>
                    <MessageHeader>
                      <MessageUser>{message.user.name}</MessageUser>
                      <MessageTime>{formatTime(message.created_at)}</MessageTime>
                      {message.is_edited && (
                        <EditedLabel>(edited)</EditedLabel>
                      )}
                    </MessageHeader>
                    <MessageText>{message.content}</MessageText>
                    
                    {/* Message Actions */}
                    <MessageActions>
                      <ActionBtn
                        onClick={() => startReply(message)}
                        title="Reply"
                      >
                        ↩️
                      </ActionBtn>
                      {canEdit(message) && (
                        <ActionBtn
                          onClick={() => startEdit(message)}
                          title="Edit"
                        >
                          ✏️
                        </ActionBtn>
                      )}
                      <ActionBtn
                        onClick={() => markAsRead(message.id)}
                        title="Mark as read"
                      >
                        ✓
                      </ActionBtn>
                    </MessageActions>
                  </MessageContent>
                </Message>
              ))
            )}

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <TypingIndicator>
                <TypingText>
                  {formatTypingUsers(typingUsers)} 
                  {' '}{typingUsers.length === 1 ? 'is' : 'are'} typing...
                </TypingText>
                <TypingDots>
                  <span></span>
                  <span></span>
                  <span></span>
                </TypingDots>
              </TypingIndicator>
            )}
          </MessagesContainer>

          {/* Reply Preview */}
          {replyingTo && (
            <ReplyPreview>
              <ReplyPreviewContent>
                <ReplyToUser>Replying to {replyingTo.user.name}:</ReplyToUser>
                <ReplyToText>{replyingTo.content}</ReplyToText>
              </ReplyPreviewContent>
              <CancelReply onClick={cancelReply}>×</CancelReply>
            </ReplyPreview>
          )}

          {/* Edit Preview */}
          {editingMessage && (
            <EditPreview>
              <EditPreviewContent>
                <EditLabel>Editing message:</EditLabel>
                <EditOriginal>{editingMessage.content}</EditOriginal>
              </EditPreviewContent>
              <CancelEdit onClick={cancelEdit}>×</CancelEdit>
            </EditPreview>
          )}

          {/* Message Input */}
          <MessageInputContainer>
            <MessageForm onSubmit={handleSendMessage}>
              <MessageInput
                ref={messageInputRef}
                value={messageText}
                onChange={(e) => {
                  setMessageText(e.target.value)
                  handleTyping()
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type your message... (Shift+Enter for new line)"
                rows={1}
              />
              <SendButton
                type="submit"
                disabled={!messageText.trim()}
              >
                {editingMessage ? '💾' : '📤'}
              </SendButton>
            </MessageForm>
          </MessageInputContainer>
        </ChatContainer>
      ) : (
        /* Connection Controls */
        <ConnectionControls>
          <Button
            onClick={connectChat}
            disabled={isChatConnecting}
            variant="primary"
          >
            {isChatConnecting ? 'Connecting...' : 'Connect to Chat'}
          </Button>
        </ConnectionControls>
      )}

      {/* Unread Badge */}
      {unreadCount > 0 && (
        <UnreadBadge>{unreadCount} unread</UnreadBadge>
      )}
    </Container>
  )
}

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 600px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
  position: relative;
`

const ChatHeader = styled.div`
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

const ChatStatus = styled.div`
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

  &.error {
    color: #f44336;
  }
`

const StatusDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
`

const ChatError = styled.div`
  padding: 15px 20px;
  background: #f8d7da;
  color: #721c24;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  scroll-behavior: smooth;
`

const NoMessages = styled.div`
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 40px 20px;
`

const Message = styled.div<{ isOwn: boolean; hasReply: boolean }>`
  margin-bottom: 15px;
  max-width: 70%;
  
  ${({ isOwn }) => isOwn && `
    margin-left: auto;
  `}

  ${({ hasReply }) => hasReply && `
    margin-top: 20px;
  `}
`

const ReplyReference = styled.div`
  background: #e3f2fd;
  padding: 8px 12px;
  border-radius: 8px 8px 0 0;
  font-size: 0.85em;
  border-left: 3px solid #2196F3;
`

const ReplyUser = styled.span`
  font-weight: bold;
  color: #2196F3;
`

const ReplyContent = styled.span`
  color: #666;
  margin-left: 8px;
`

const MessageContent = styled.div<{ isOwn: boolean }>`
  background: #f5f5f5;
  padding: 12px 15px;
  border-radius: 18px;
  position: relative;

  ${({ isOwn }) => isOwn && `
    background: #2196F3;
    color: white;
  `}

  &:hover {
    .message-actions {
      display: flex;
    }
  }
`

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
  font-size: 0.85em;
`

const MessageUser = styled.span`
  font-weight: bold;
  color: #2196F3;

  ${MessageContent}[data-own="true"] & {
    color: rgba(255,255,255,0.9);
  }
`

const MessageTime = styled.span`
  color: #666;

  ${MessageContent}[data-own="true"] & {
    color: rgba(255,255,255,0.7);
  }
`

const EditedLabel = styled.span`
  color: #999;
  font-style: italic;

  ${MessageContent}[data-own="true"] & {
    color: rgba(255,255,255,0.7);
  }
`

const MessageText = styled.div`
  word-wrap: break-word;
  white-space: pre-wrap;
`

const MessageActions = styled.div.attrs({ className: 'message-actions' })`
  display: none;
  position: absolute;
  top: -10px;
  right: 10px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  padding: 5px;
`

const ActionBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px 8px;
  border-radius: 15px;
  font-size: 0.9em;

  &:hover {
    background: #f0f0f0;
  }
`

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #666;
  font-style: italic;
  padding: 10px 0;
`

const TypingText = styled.span``

const TypingDots = styled.div`
  display: flex;
  gap: 3px;

  span {
    width: 6px;
    height: 6px;
    background: #666;
    border-radius: 50%;
    animation: typing 1.4s infinite ease-in-out;

    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
  }

  @keyframes typing {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }
`

const ReplyPreview = styled.div`
  padding: 10px 20px;
  background: #e3f2fd;
  border-top: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const ReplyPreviewContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`

const ReplyToUser = styled.span`
  font-weight: bold;
  color: #2196F3;
  font-size: 0.9em;
`

const ReplyToText = styled.span`
  color: #666;
  font-size: 0.85em;
`

const CancelReply = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
  color: #666;
  padding: 5px 10px;
`

const EditPreview = styled(ReplyPreview)``
const EditPreviewContent = styled(ReplyPreviewContent)``
const EditLabel = styled(ReplyToUser)``
const EditOriginal = styled(ReplyToText)``
const CancelEdit = styled(CancelReply)``

const MessageInputContainer = styled.div`
  padding: 15px 20px;
  border-top: 1px solid #ddd;
  background: #f9f9f9;
`

const MessageForm = styled.form`
  display: flex;
  gap: 10px;
  align-items: flex-end;
`

const MessageInput = styled.textarea`
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 20px;
  resize: none;
  font-family: inherit;
  line-height: 1.4;
  max-height: 120px;

  &:focus {
    outline: none;
    border-color: #2196F3;
  }
`

const SendButton = styled.button`
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

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`

const ConnectionControls = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 40px;
`

const UnreadBadge = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  background: #f44336;
  color: white;
  border-radius: 15px;
  padding: 2px 8px;
  font-size: 0.8em;
  font-weight: bold;
`

const Button = styled.button<{ variant?: string; size?: string }>`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  ${({ variant }) => {
    if (variant === 'primary') return 'background: #2196F3; color: white;'
    return 'background: #ccc; color: #333;'
  }}

  ${({ size }) => {
    if (size === 'sm') return 'padding: 5px 10px; font-size: 12px;'
    return ''
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

export default RealtimeChat