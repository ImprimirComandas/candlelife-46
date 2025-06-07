import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Message } from '@/types/messages';
import { notificationService } from '@/services/NotificationService';

export const useAdvancedMessages = () => {
  const { user } = useAuth();
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

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
    getTotalUnreadCount,
  };
};
