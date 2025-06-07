import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Message, ChatUser } from '@/types/messages';
import { notificationService } from '@/services/notificationService';

export const useAdvancedMessages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Add all the required methods
  const useConversation = (userId: string, searchTerm?: string) => {
    // Implementation
  };

  const useSendMessage = () => {
    return useMutation({
      mutationFn: async ({ content, recipientId }: { content: string; recipientId: string }) => {
        // Implementation
      }
    });
  };

  const useEditMessage = () => {
    return useMutation({
      mutationFn: async ({ messageId, content }: { messageId: string; content: string }) => {
        // Implementation
      }
    });
  };

  const useDeleteMessage = () => {
    return useMutation({
      mutationFn: async (messageId: string) => {
        // Implementation
      }
    });
  };

  const useMarkConversationAsRead = () => {
    return useMutation({
      mutationFn: async (userId: string) => {
        // Implementation
      }
    });
  };

  const useClearConversation = () => {
    return useMutation({
      mutationFn: async (userId: string) => {
        // Implementation
      }
    });
  };

  const updateUnreadCount = useCallback(() => {
    const unread = notificationService.getUnreadCount();
    setTotalUnreadCount(unread);
  }, []);

  useEffect(() => {
    updateUnreadCount();
    const unsubscribe = notificationService.subscribe(() => {
      updateUnreadCount();
    });

    return () => {
      unsubscribe();
    };
  }, [updateUnreadCount]);

  useEffect(() => {
    if (!user || !supabase) return;

    const messageChannel = supabase
      .channel('messages_realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${user.id}`
      }, async (payload) => {
        const newMessage = payload.new as Message;
        
        // Buscar dados do remetente para a notificação
        const { data: senderData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', newMessage.sender_id)
          .single();

        if (senderData) {
          // Adicionar notificação
          notificationService.addMessageNotification(newMessage, {
            id: senderData.id,
            username: senderData.username,
            full_name: senderData.full_name,
            avatar_url: senderData.avatar_url,
            email: senderData.email || '',
            created_at: senderData.created_at,
            updated_at: senderData.updated_at
          });
        }

        updateUnreadCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
    };
  }, [user, supabase, updateUnreadCount]);

  const getTotalUnreadCount = () => {
    return totalUnreadCount;
  };

  return {
    useConversation,
    useSendMessage,
    useEditMessage,
    useDeleteMessage,
    useMarkConversationAsRead,
    useClearConversation,
    getTotalUnreadCount
  };
};
