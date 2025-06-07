
import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { messageKeys } from '@/lib/query-keys';
import { Message } from '@/types/messages';
import { realtimeConnectionManager } from '@/services/RealtimeConnectionManager';

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
  const debounceRef = useRef<NodeJS.Timeout>();

  const cleanupChannel = useCallback(() => {
    if (channelRef.current) {
      console.log('🧹 Cleaning up realtime messages channel');
      try {
        const channelName = `messages_${user?.id}`;
        realtimeConnectionManager.removeChannel(channelName);
      } catch (error) {
        console.warn('Warning cleaning up channel:', error);
      }
      channelRef.current = null;
      setIsConnected(false);
    }
    isSetupRef.current = false;
  }, [user?.id]);

  const setupRealtimeSubscription = useCallback(() => {
    // Prevent multiple setups
    if (!user?.id || isSetupRef.current) {
      return;
    }

    // Clear any existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce the setup to prevent rapid recreation
    debounceRef.current = setTimeout(() => {
      if (isSetupRef.current) return;
      
      cleanupChannel();
      
      const channelName = `messages_${user.id}`;
      console.log('🔧 Setting up realtime messages channel with connection manager:', channelName);

      const channel = realtimeConnectionManager.createChannel(channelName);

      // Subscribe to sent messages
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `sender_id.eq.${user.id}`
        },
        (payload: any) => {
          console.log('💬 Sent message event:', payload);
          if (payload.eventType === 'INSERT' && payload.new) {
            queryClient.invalidateQueries({ queryKey: messageKeys.chatUsers() });
            queryClient.invalidateQueries({ 
              queryKey: messageKeys.conversation(payload.new.recipient_id) 
            });
          }
        }
      );

      // Subscribe to received messages
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id.eq.${user.id}`
        },
        (payload: any) => {
          console.log('💬 Received message event:', payload);
          
          if (payload.eventType === 'INSERT' && payload.new) {
            console.log('📩 New message received:', payload.new);
            onNewMessage?.(payload.new as Message);
            
            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: messageKeys.chatUsers() });
            queryClient.invalidateQueries({ 
              queryKey: messageKeys.conversation(payload.new.sender_id) 
            });
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            console.log('📝 Message updated:', payload.new);
            onMessageUpdate?.(payload.new as Message);
            queryClient.invalidateQueries({ 
              queryKey: messageKeys.conversation(payload.new.sender_id) 
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
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.log('❌ Realtime messages connection error or closed:', status);
          setIsConnected(false);
          isSetupRef.current = false;
        }
      });

      channelRef.current = channel;
    }, 500); // 500ms debounce
  }, [user?.id, onNewMessage, onMessageUpdate, queryClient, cleanupChannel]);

  useEffect(() => {
    if (user?.id) {
      setupRealtimeSubscription();
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      cleanupChannel();
    };
  }, [user?.id, setupRealtimeSubscription, cleanupChannel]);

  return {
    isConnected,
    channel: channelRef.current
  };
};
