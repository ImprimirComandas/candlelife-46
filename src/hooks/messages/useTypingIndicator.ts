
import { useCallback, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { TypingStatus } from '@/types/messages';

export const useTypingIndicator = () => {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});

  const sendTypingStatus = useCallback(async (otherUserId: string, isTyping: boolean) => {
    if (!user) return;

    try {
      console.log('⌨️ Sending typing status:', { otherUserId, isTyping });
      
      await supabase.rpc('update_typing_status', {
        p_user_id: user.id,
        p_conversation_with_user_id: otherUserId,
        p_is_typing: isTyping
      });
    } catch (error) {
      console.error('❌ Error updating typing status:', error);
    }
  }, [user]);

  const isUserTyping = useCallback((userId: string) => {
    return typingUsers[userId] || false;
  }, [typingUsers]);

  // Subscribe to typing status changes
  useEffect(() => {
    if (!user) return;

    console.log('🎯 Setting up typing status subscription for user:', user.id);

    const channel = supabase
      .channel(`typing_status_${user.id}_${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_status',
          filter: `conversation_with_user_id.eq.${user.id}`
        },
        (payload) => {
          console.log('⌨️ Typing status realtime update:', payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newData = payload.new as TypingStatus;
            if (newData?.user_id && typeof newData.is_typing === 'boolean') {
              setTypingUsers(prev => ({
                ...prev,
                [newData.user_id]: newData.is_typing
              }));
            }
          } else if (payload.eventType === 'DELETE') {
            const oldData = payload.old as TypingStatus;
            if (oldData?.user_id) {
              setTypingUsers(prev => ({
                ...prev,
                [oldData.user_id]: false
              }));
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('⌨️ Typing status channel status:', status);
      });

    return () => {
      console.log('🧹 Cleaning up typing status subscription');
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    sendTypingStatus,
    isUserTyping
  };
};
