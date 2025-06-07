
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Message, ChatUser, MessageType } from '@/types/messages';
import { useHybridMessages } from './useHybridMessages';

export const useSimpleChat = () => {
  const [conversations, setConversations] = useState<ChatUser[]>([]);
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
    return useQuery({
      queryKey: ['conversations'],
      queryFn: async () => chatUsers,
      enabled: false, // Use hybrid system instead
    });
  };

  const getConversationMessages = (userId: string) => {
    return getHybridConversation(userId);
  };

  const sendMessage = useMutation({
    mutationFn: async ({ 
      recipientId, 
      content 
    }: { 
      recipientId: string; 
      content: string; 
    }) => {
      return sendHybridMessage.mutateAsync({ recipientId, content });
    },
    onSuccess: () => {
      // Hybrid system handles invalidation
    }
  });

  const markAsRead = useMutation({
    mutationFn: async (userId: string) => {
      return markAsReadHybrid.mutateAsync(userId);
    },
    onSuccess: () => {
      // Hybrid system handles invalidation
    },
  });

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
