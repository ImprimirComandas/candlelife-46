
import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useMessages } from '@/hooks/useMessages';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
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
  
  // Hooks for components
  useChatUsers: ReturnType<typeof useMessages>['useChatUsers'];
  useConversation: ReturnType<typeof useMessages>['useConversation'];
  showNotification: (message: Message) => Promise<void>;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const MessagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activeConversation, setActiveConversationState] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const {
    useChatUsers,
    useConversation,
    useSendMessage,
    useMarkConversationAsRead,
    useClearConversation,
    showNotification
  } = useMessages();

  const sendMessage = useSendMessage();
  const markAsRead = useMarkConversationAsRead();
  const clearChat = useClearConversation();

  // Handle new messages from realtime
  const handleNewMessage = useCallback((message: Message) => {
    console.log('🔔 New message in context:', message);
    
    // Show notification if not from current user and not in active conversation
    if (message.sender_id !== user?.id) {
      if (!activeConversation || message.sender_id !== activeConversation || document.hidden) {
        showNotification(message);
      }
    }
    
    // Update unread count
    setUnreadCount(prev => prev + 1);
  }, [user?.id, activeConversation, showNotification]);

  const handleMessageUpdate = useCallback((message: Message) => {
    console.log('📝 Message updated in context:', message);
  }, []);

  // Setup realtime
  const { isConnected } = useRealtimeMessages({
    activeConversation: activeConversation || undefined,
    onNewMessage: handleNewMessage,
    onMessageUpdate: handleMessageUpdate
  });

  const setActiveConversation = useCallback((userId: string | null) => {
    console.log('📱 Setting active conversation:', userId);
    setActiveConversationState(userId);
    
    // Mark as read when opening conversation
    if (userId) {
      setTimeout(() => {
        markAsRead.mutate(userId, {
          onSuccess: () => {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        });
      }, 1000);
    }
  }, [markAsRead]);

  const markConversationAsRead = useCallback(async (userId: string) => {
    return new Promise<void>((resolve, reject) => {
      markAsRead.mutate(userId, {
        onSuccess: () => {
          setUnreadCount(prev => Math.max(0, prev - 1));
          resolve();
        },
        onError: reject
      });
    });
  }, [markAsRead]);

  const sendMessageAction = useCallback(async (
    recipientId: string, 
    content: string, 
    attachment?: File
  ) => {
    return new Promise<void>((resolve, reject) => {
      sendMessage.mutate({
        recipientId,
        content,
        attachmentUrl: attachment ? URL.createObjectURL(attachment) : undefined,
        fileName: attachment?.name,
        fileSize: attachment?.size
      }, {
        onSuccess: () => resolve(),
        onError: reject
      });
    });
  }, [sendMessage]);

  const clearConversation = useCallback(async (userId: string) => {
    return new Promise<void>((resolve, reject) => {
      clearChat.mutate(userId, {
        onSuccess: () => resolve(),
        onError: reject
      });
    });
  }, [clearChat]);

  return (
    <MessagesContext.Provider value={{
      activeConversation,
      isConnected,
      unreadCount,
      setActiveConversation,
      markConversationAsRead,
      sendMessage: sendMessageAction,
      clearConversation,
      useChatUsers,
      useConversation,
      showNotification
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
