
import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { messageKeys } from '@/lib/query-keys';
import { Message, RealtimeMessageEvent } from '@/types/messages';

interface UseRealtimeMessagesConfig {
  activeConversation?: string;
  onNewMessage?: (message: Message) => void;
  onMessageUpdate?: (message: Message) => void;
}

export const useRealtimeMessages = ({ 
  activeConversation, 
  onNewMessage, 
  onMessageUpdate 
}: UseRealtimeMessagesConfig = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const isSetupRef = useRef(false);

  const cleanupChannel = useCallback(() => {
    if (channelRef.current) {
      console.log('🧹 Cleaning up realtime channel');
      try {
        supabase.removeChannel(channelRef.current);
      } catch (error) {
        console.warn('Warning cleaning up channel:', error);
      }
      channelRef.current = null;
      isSetupRef.current = false;
      setIsConnected(false);
    }
  }, []);

  const setupRealtimeSubscription = useCallback(() => {
    if (!user?.id || isSetupRef.current) return;

    cleanupChannel();
    
    const channelName = `messages_${user.id}_${Date.now()}`;
    console.log('🔧 Setting up realtime messages channel:', channelName);

    const channel = supabase.channel(channelName);

    // Subscribe to messages
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `or(sender_id.eq.${user.id},recipient_id.eq.${user.id})`
      },
      (payload: RealtimeMessageEvent) => {
        console.log('💬 Realtime message event:', payload);
        
        if (payload.eventType === 'INSERT' && payload.new) {
          console.log('📩 New message received:', payload.new);
          onNewMessage?.(payload.new);
          
          // Invalidate queries
          queryClient.invalidateQueries({ queryKey: messageKeys.chatUsers() });
          
          const otherUserId = payload.new.sender_id === user.id 
            ? payload.new.recipient_id 
            : payload.new.sender_id;
          
          queryClient.invalidateQueries({ 
            queryKey: messageKeys.conversation(otherUserId) 
          });
        } else if (payload.eventType === 'UPDATE' && payload.new) {
          console.log('📝 Message updated:', payload.new);
          onMessageUpdate?.(payload.new);
          
          const otherUserId = payload.new.sender_id === user.id 
            ? payload.new.recipient_id 
            : payload.new.sender_id;
            
          queryClient.invalidateQueries({ 
            queryKey: messageKeys.conversation(otherUserId) 
          });
        }
      }
    );

    // Subscribe to channel
    channel.subscribe(async (status) => {
      console.log('📡 Realtime messages channel status:', status);
      
      if (status === 'SUBSCRIBED') {
        console.log('✅ Realtime messages connected successfully');
        setIsConnected(true);
        isSetupRef.current = true;
        
        // Update user presence
        try {
          await supabase.rpc('update_user_presence', {
            p_user_id: user.id,
            p_status: 'online',
            p_conversation_id: activeConversation || undefined
          });
        } catch (error) {
          console.error('❌ Error updating presence:', error);
        }
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        console.log('❌ Realtime messages connection error or closed:', status);
        setIsConnected(false);
        isSetupRef.current = false;
      }
    });

    channelRef.current = channel;
  }, [user?.id, activeConversation, onNewMessage, onMessageUpdate, queryClient, cleanupChannel]);

  useEffect(() => {
    if (user?.id && !isSetupRef.current) {
      setupRealtimeSubscription();
    }

    return cleanupChannel;
  }, [user?.id, activeConversation, setupRealtimeSubscription, cleanupChannel]);

  // Update presence when going offline
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (user?.id) {
        try {
          await supabase.rpc('update_user_presence', {
            p_user_id: user.id,
            p_status: 'offline'
          });
        } catch (error) {
          console.error('Error updating presence on unload:', error);
        }
      }
    };

    const handleVisibilityChange = async () => {
      if (user?.id) {
        try {
          const status = document.hidden ? 'away' : 'online';
          await supabase.rpc('update_user_presence', {
            p_user_id: user.id,
            p_status: status,
            p_conversation_id: activeConversation || undefined
          });
        } catch (error) {
          console.error('Error updating presence on visibility change:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id, activeConversation]);

  return {
    isConnected,
    channel: channelRef.current
  };
};
