
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useHybridMessages } from '@/hooks/useHybridMessages';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { Message, ChatUser } from '@/types/messages';
import { audioService } from '@/services/AudioService';

interface MessagesContextType {
  // State
  activeConversation: string | null;
  isConnected: boolean;
  unreadCount: number;
  
  // Actions
  setActiveConversation: (userId: string | null) => void;
  markConversationAsRead: (userId: string) => Promise<void>;
  sendMessage: (recipientId: string, content: string) => Promise<void>;
  clearConversation: (userId: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  
  // Notification system
  requestNotificationPermissions: () => Promise<boolean>;
  
  // Hooks for components
  useChatUsers: () => { data: ChatUser[]; isLoading: boolean };
  useConversation: (userId: string, searchQuery?: string) => any;
  showNotification: (message: Message) => Promise<void>;
  
  // Direct data access
  chatUsers: ChatUser[];
  isLoadingChatUsers: boolean;
  getTotalUnreadCount: () => number;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const MessagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activeConversation, setActiveConversationState] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Use hybrid system as the main data source
  const {
    chatUsers,
    isLoadingChatUsers,
    getConversation,
    getTotalUnreadCount,
    sendMessage: sendHybridMessage,
    markAsRead: markAsReadHybrid,
    isConnected
  } = useHybridMessages({
    activeConversation: activeConversation || undefined,
    enableTypingIndicators: true,
    pollingInterval: 3000
  });

  // Simple notification function
  const showNotification = useCallback(async (message: Message) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    try {
      const notification = new Notification('Nova mensagem', {
        body: message.content,
        icon: '/favicon.ico',
        tag: `message-${message.id}`,
        requireInteraction: false
      });

      setTimeout(() => notification.close(), 5000);
      
      // Play notification sound
      audioService.playMessageSound();
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }, []);

  // Handle new messages from realtime
  const handleNewMessage = useCallback(async (message: Message) => {
    console.log('🔔 New message in context:', message);
    
    // Show notification if not from current user
    if (message.sender_id !== user?.id) {
      if (!activeConversation || message.sender_id !== activeConversation || document.hidden) {
        await showNotification(message);
      }
    }
    
    // Update unread count
    setUnreadCount(prev => prev + 1);
  }, [user?.id, activeConversation, showNotification]);

  // Setup realtime
  const { isConnected: realtimeConnected } = useRealtimeMessages({
    activeConversation: activeConversation || undefined,
    onNewMessage: handleNewMessage,
    onMessageUpdate: useCallback((message: Message) => {
      console.log('📝 Message updated in context:', message);
    }, [])
  });

  // Request notification permissions
  const requestNotificationPermissions = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;
    
    if (Notification.permission === 'granted') return true;
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }, []);

  // Auto-request permissions when user logs in
  useEffect(() => {
    if (user) {
      console.log('👤 User logged in, setting up notifications...');
      setTimeout(() => {
        requestNotificationPermissions().then(granted => {
          console.log('🔔 Notification permissions requested:', granted);
        });
      }, 2000);
    }
  }, [user, requestNotificationPermissions]);

  const setActiveConversation = useCallback((userId: string | null) => {
    console.log('📱 Setting active conversation:', userId);
    setActiveConversationState(userId);
    
    // Mark as read when opening conversation
    if (userId) {
      setTimeout(() => {
        markAsReadHybrid.mutate(userId, {
          onSuccess: () => {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        });
      }, 1000);
    }
  }, [markAsReadHybrid]);

  const markConversationAsRead = useCallback(async (userId: string) => {
    return new Promise<void>((resolve, reject) => {
      markAsReadHybrid.mutate(userId, {
        onSuccess: () => {
          setUnreadCount(prev => Math.max(0, prev - 1));
          resolve();
        },
        onError: reject
      });
    });
  }, [markAsReadHybrid]);

  const sendMessage = useCallback(async (
    recipientId: string, 
    content: string
  ) => {
    console.log('📤 Sending message from context:', { recipientId, content: content.substring(0, 50) });
    
    return new Promise<void>((resolve, reject) => {
      sendHybridMessage.mutate({
        recipientId,
        content
      }, {
        onSuccess: () => {
          console.log('✅ Message sent successfully from context');
          resolve();
        },
        onError: (error) => {
          console.error('❌ Error sending message from context:', error);
          reject(error);
        }
      });
    });
  }, [sendHybridMessage]);

  // Simplified hooks for compatibility
  const useChatUsers = useCallback(() => {
    return { data: chatUsers, isLoading: isLoadingChatUsers };
  }, [chatUsers, isLoadingChatUsers]);

  const useConversation = useCallback((userId: string, searchQuery?: string) => {
    return getConversation(userId, searchQuery);
  }, [getConversation]);

  // Placeholder functions for compatibility
  const clearConversation = useCallback(async (userId: string) => {
    console.log('Clear conversation not implemented in hybrid system');
  }, []);

  const deleteMessage = useCallback(async (messageId: string) => {
    console.log('Delete message not implemented in hybrid system');
  }, []);

  const editMessage = useCallback(async (messageId: string, content: string) => {
    console.log('Edit message not implemented in hybrid system');
  }, []);

  return (
    <MessagesContext.Provider value={{
      activeConversation,
      isConnected: isConnected && realtimeConnected,
      unreadCount,
      setActiveConversation,
      markConversationAsRead,
      sendMessage,
      clearConversation,
      deleteMessage,
      editMessage,
      requestNotificationPermissions,
      useChatUsers,
      useConversation,
      showNotification,
      chatUsers,
      isLoadingChatUsers,
      getTotalUnreadCount
    }}>
      {children}
    </MessagesContext.Provider>
  );
};

export const useMessagesContext = () => {
  const context = useContext(MessagesContext);
  if (context === undefined) {
    throw new Error('useMessagesContext must be used within a MessagesProvider');
  }
  return context;
};
