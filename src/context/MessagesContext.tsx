
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useMessages } from '@/hooks/useMessages';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { Message, ChatUser } from '@/types/messages';

interface MessagesContextType {
  // State
  activeConversation: string | null;
  isConnected: boolean;
  unreadCount: number;
  
  // Actions
  setActiveConversation: (userId: string | null) => void;
  markConversationAsRead: (userId: string) => Promise<void>;
  sendMessage: (recipientId: string, content: string, attachment?: File) => Promise<void>;
  clearConversation: (userId: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  
  // Notification system
  requestNotificationPermissions: () => Promise<boolean>;
  
  // Hooks for components
  useChatUsers: ReturnType<typeof useMessages>['useChatUsers'];
  useConversation: ReturnType<typeof useMessages>['useConversation'];
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

  const messagesHook = useMessages();
  const {
    useChatUsers,
    useConversation,
    useSendMessage,
    useMarkConversationAsRead,
    useClearConversation,
    useDeleteMessage,
    useEditMessage,
    showNotification,
    chatUsers,
    isLoadingChatUsers,
    getTotalUnreadCount
  } = messagesHook;

  // Inicializar sistema de notificações
  const {
    handleNewMessage: processNotification,
    requestPermissions,
    isInitialized: notificationSystemReady
  } = useNotificationSystem();

  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkConversationAsRead();
  const clearChatMutation = useClearConversation();
  const deleteMsgMutation = useDeleteMessage();
  const editMsgMutation = useEditMessage();

  // Handle new messages from realtime with enhanced notifications
  const handleNewMessage = useCallback(async (message: Message) => {
    console.log('🔔 New message in context:', message);
    
    // Show notification if not from current user
    if (message.sender_id !== user?.id) {
      // Get sender info for notification with proper ChatUser type
      const senderInfo = chatUsers.find(u => u.id === message.sender_id) || {
        id: message.sender_id,
        username: 'Usuário',
        full_name: 'Usuário',
        avatar_url: undefined,
        email: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        unread_count: 0
      } as ChatUser;

      // Process notification with sound and push
      if (notificationSystemReady) {
        await processNotification(message, senderInfo);
      }

      // Fallback to basic notification
      if (!activeConversation || message.sender_id !== activeConversation || document.hidden) {
        await showNotification(message);
      }
    }
    
    // Update unread count
    setUnreadCount(prev => prev + 1);
  }, [user?.id, activeConversation, chatUsers, processNotification, notificationSystemReady, showNotification]);

  // Setup realtime
  const { isConnected } = useRealtimeMessages({
    activeConversation: activeConversation || undefined,
    onNewMessage: handleNewMessage,
    onMessageUpdate: useCallback((message: Message) => {
      console.log('📝 Message updated in context:', message);
    }, [])
  });

  // Auto-request permissions when user logs in
  useEffect(() => {
    if (user && notificationSystemReady) {
      setTimeout(() => {
        requestPermissions();
      }, 2000);
    }
  }, [user, notificationSystemReady, requestPermissions]);

  const setActiveConversation = useCallback((userId: string | null) => {
    console.log('📱 Setting active conversation:', userId);
    setActiveConversationState(userId);
    
    // Mark as read when opening conversation
    if (userId) {
      setTimeout(() => {
        markAsReadMutation.mutate(userId, {
          onSuccess: () => {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        });
      }, 1000);
    }
  }, [markAsReadMutation]);

  const markConversationAsRead = useCallback(async (userId: string) => {
    return new Promise<void>((resolve, reject) => {
      markAsReadMutation.mutate(userId, {
        onSuccess: () => {
          setUnreadCount(prev => Math.max(0, prev - 1));
          resolve();
        },
        onError: reject
      });
    });
  }, [markAsReadMutation]);

  const sendMessage = useCallback(async (
    recipientId: string, 
    content: string, 
    attachment?: File
  ) => {
    console.log('📤 Sending message from context:', { recipientId, content: content.substring(0, 50) });
    
    return new Promise<void>((resolve, reject) => {
      sendMessageMutation.mutate({
        recipientId,
        content,
        attachmentUrl: attachment ? URL.createObjectURL(attachment) : undefined,
        fileName: attachment?.name,
        fileSize: attachment?.size
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
  }, [sendMessageMutation]);

  const clearConversation = useCallback(async (userId: string) => {
    return new Promise<void>((resolve, reject) => {
      clearChatMutation.mutate(userId, {
        onSuccess: () => resolve(),
        onError: reject
      });
    });
  }, [clearChatMutation]);

  const deleteMessage = useCallback(async (messageId: string) => {
    return new Promise<void>((resolve, reject) => {
      deleteMsgMutation.mutate(messageId, {
        onSuccess: () => resolve(),
        onError: reject
      });
    });
  }, [deleteMsgMutation]);

  const editMessage = useCallback(async (messageId: string, content: string) => {
    return new Promise<void>((resolve, reject) => {
      editMsgMutation.mutate({ messageId, content }, {
        onSuccess: () => resolve(),
        onError: reject
      });
    });
  }, [editMsgMutation]);

  return (
    <MessagesContext.Provider value={{
      activeConversation,
      isConnected,
      unreadCount,
      setActiveConversation,
      markConversationAsRead,
      sendMessage,
      clearConversation,
      deleteMessage,
      editMessage,
      requestNotificationPermissions: requestPermissions,
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
