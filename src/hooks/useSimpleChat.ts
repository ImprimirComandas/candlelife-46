
import { useState } from 'react';
import { useAuth } from "@/context/AuthContext";
import { Message, ChatUser } from '@/types/messages';
import { useHybridMessages } from './useHybridMessages';

export const useSimpleChat = () => {
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const { user } = useAuth();

  // Use hybrid system for optimized performance
  const {
    chatUsers,
    isLoadingChatUsers,
    getConversation: getHybridConversation,
    sendMessage: sendHybridMessage,
    markAsRead: markAsReadHybrid,
    getTotalUnreadCount,
    isConnected,
    sendTypingStatus
  } = useHybridMessages({
    activeConversation: activeConversation || undefined,
    enableTypingIndicators: true,
    pollingInterval: 3000
  });

  const getConversations = () => {
    return {
      data: chatUsers,
      isLoading: isLoadingChatUsers,
      error: null,
      refetch: () => {}
    };
  };

  const getConversationMessages = (userId: string) => {
    return getHybridConversation(userId);
  };

  const sendMessage = {
    mutateAsync: async ({ 
      recipientId, 
      content 
    }: { 
      recipientId: string; 
      content: string; 
    }) => {
      return sendHybridMessage.mutateAsync({ recipientId, content });
    },
    isPending: sendHybridMessage.isPending
  };

  const markAsRead = {
    mutate: (userId: string, options?: { onSuccess?: () => void; onError?: (error: any) => void }) => {
      markAsReadHybrid.mutate(userId, options);
    },
    isPending: markAsReadHybrid.isPending
  };

  // Set active conversation for polling optimization
  const setActiveConversationId = (userId: string | null) => {
    console.log('📱 Setting active conversation:', userId);
    setActiveConversation(userId);
  };

  return {
    conversations: chatUsers,
    getConversations,
    getConversationMessages,
    sendMessage,
    markAsRead,
    chatUsers,
    isLoadingChatUsers,
    getTotalUnreadCount,
    isConnected,
    sendTypingStatus,
    setActiveConversation: setActiveConversationId,
    activeConversation
  };
};
