// src/components/common/Notification.tsx
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import styled, { keyframes } from 'styled-components';

export interface NotificationItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: NotificationItem[];
  addNotification: (notification: Omit<NotificationItem, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

// Helper hooks for common notification types
export function useToast() {
  const { addNotification } = useNotifications();

  return {
    success: (title: string, message?: string) => 
      addNotification({ type: 'success', title, message, duration: 4000 }),
    
    error: (title: string, message?: string) => 
      addNotification({ type: 'error', title, message, duration: 6000 }),
    
    warning: (title: string, message?: string) => 
      addNotification({ type: 'warning', title, message, duration: 5000 }),
    
    info: (title: string, message?: string) => 
      addNotification({ type: 'info', title, message, duration: 4000 }),
  };
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = useCallback((notification: Omit<NotificationItem, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto remove after duration
    const duration = notification.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll,
    }}>
      {children}
      <NotificationContainer>
        {notifications.map(notification => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </NotificationContainer>
    </NotificationContext.Provider>
  );
}

interface NotificationToastProps {
  notification: NotificationItem;
  onClose: () => void;
}

function NotificationToast({ notification, onClose }: NotificationToastProps) {
  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '';
    }
  };

  return (
    <Toast type={notification.type}>
      <ToastContent>
        <ToastHeader>
          <ToastIcon>{getIcon(notification.type)}</ToastIcon>
          <ToastTitle>{notification.title}</ToastTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ToastHeader>
        
        {notification.message && (
          <ToastMessage>{notification.message}</ToastMessage>
        )}
        
        {notification.action && (
          <ToastAction onClick={notification.action.onClick}>
            {notification.action.label}
          </ToastAction>
        )}
      </ToastContent>
    </Toast>
  );
}

// Inline notification for forms/pages
interface InlineNotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  onClose?: () => void;
  className?: string;
}

export function InlineNotification({ 
  type, 
  title, 
  message, 
  onClose,
  className 
}: InlineNotificationProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '';
    }
  };

  return (
    <InlineNotificationContainer type={type} className={className}>
      <InlineIcon>{getIcon(type)}</InlineIcon>
      <InlineContent>
        <InlineTitle>{title}</InlineTitle>
        {message && <InlineMessage>{message}</InlineMessage>}
      </InlineContent>
      {onClose && (
        <InlineCloseButton onClick={onClose}>×</InlineCloseButton>
      )}
    </InlineNotificationContainer>
  );
}

// Styled components
const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const NotificationContainer = styled.div`
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 400px;
`;

const Toast = styled.div<{ type: string }>`
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-left: 4px solid ${props => {
    switch (props.type) {
      case 'success': return props.theme.colors.success;
      case 'error': return props.theme.colors.error;
      case 'warning': return props.theme.colors.warning;
      case 'info': return props.theme.colors.info;
      default: return props.theme.colors.primary;
    }
  }};
  animation: ${slideIn} 0.3s ease-out;
  max-width: 100%;
`;

const ToastContent = styled.div`
  padding: 1rem;
`;

const ToastHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
`;

const ToastIcon = styled.span`
  font-size: 1.25rem;
  flex-shrink: 0;
`;

const ToastTitle = styled.h4`
  margin: 0;
  flex: 1;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: ${props => props.theme.colors.textSecondary};
  padding: 0;
  line-height: 1;
  
  &:hover {
    color: ${props => props.theme.colors.text};
  }
`;

const ToastMessage = styled.p`
  margin: 0.5rem 0 0 2rem;
  font-size: 0.8rem;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.4;
`;

const ToastAction = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  margin: 0.5rem 0 0 2rem;
  padding: 0;
  
  &:hover {
    text-decoration: underline;
  }
`;

// Inline notification styles
const InlineNotificationContainer = styled.div<{ type: string }>`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid ${props => {
    switch (props.type) {
      case 'success': return props.theme.colors.success;
      case 'error': return props.theme.colors.error;
      case 'warning': return props.theme.colors.warning;
      case 'info': return props.theme.colors.info;
      default: return props.theme.colors.border;
    }
  }};
  background: ${props => {
    switch (props.type) {
      case 'success': return `${props.theme.colors.success}10`;
      case 'error': return `${props.theme.colors.error}10`;
      case 'warning': return `${props.theme.colors.warning}10`;
      case 'info': return `${props.theme.colors.info}10`;
      default: return props.theme.colors.background;
    }
  }};
`;

const InlineIcon = styled.span`
  font-size: 1.25rem;
  flex-shrink: 0;
`;

const InlineContent = styled.div`
  flex: 1;
`;

const InlineTitle = styled.h4`
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const InlineMessage = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.4;
`;

const InlineCloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: ${props => props.theme.colors.textSecondary};
  padding: 0;
  line-height: 1;
  
  &:hover {
    color: ${props => props.theme.colors.text};
  }
`;

export default NotificationProvider;
