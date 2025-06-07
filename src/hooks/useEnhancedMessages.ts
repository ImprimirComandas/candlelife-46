
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from './use-toast';
import { useRealtimeChat } from './useRealtimeChat';

export interface EnhancedMessage {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  created_at: string;
  read: boolean;
  message_status: 'sending' | 'sent' | 'delivered' | 'read';
  edited_at?: string;
  reactions: any[];
  message_type: 'text' | 'image' | 'file' | 'audio' | 'video' | 'location';
  attachment_url?: string;
  file_name?: string;
  file_size?: number;
  duration?: number;
  sender_username?: string;
  sender_avatar_url?: string;
}

export interface ConversationSettings {
  id?: string;
  user_id?: string;
  other_user_id?: string;
  notifications_enabled: boolean;
  archived: boolean;
  pinned: boolean;
  muted: boolean;
  nickname: string;
  background_image: string;
  created_at?: string;
  updated_at?: string;
}

export const useEnhancedMessages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeConversation, setActiveConversation] = useState<string | null>(null);

  // Realtime setup with proper callbacks
  const { isConnected } = useRealtimeChat({
    recipientId: activeConversation || undefined,
    onNewMessage: useCallback((message) => {
      console.log('🔔 Enhanced messages: New message received:', message);
      
      // Show notification if not from current user
      if (message.sender_id !== user?.id) {
        if (!activeConversation || message.sender_id !== activeConversation || document.hidden) {
          showNotification(message);
        }
      }
      
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['chat-users'] });
      if (activeConversation) {
        queryClient.invalidateQueries({ queryKey: ['conversation', activeConversation] });
      }
    }, [user?.id, activeConversation, queryClient]),
    
    onMessageUpdate: useCallback((message) => {
      console.log('📝 Enhanced messages: Message updated:', message);
      const otherUserId = message.sender_id === user?.id ? message.recipient_id : message.sender_id;
      queryClient.invalidateQueries({ queryKey: ['conversation', otherUserId] });
    }, [user?.id, queryClient])
  });

  // Get conversation with enhanced features
  const useConversation = useCallback((otherUserId: string, searchTerm?: string) => {
    return useQuery({
      queryKey: ['conversation', otherUserId, searchTerm],
      queryFn: async (): Promise<EnhancedMessage[]> => {
        if (!user || !otherUserId) {
          console.log('❌ No user or otherUserId provided');
          return [];
        }

        console.log('🔍 Fetching conversation with:', otherUserId, searchTerm ? `(search: ${searchTerm})` : '');

        try {
          let query = supabase
            .from('messages')
            .select(`
              id,
              content,
              sender_id,
              recipient_id,
              created_at,
              read,
              message_status,
              edited_at,
              attachment_url
            `)
            .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
            .eq('deleted_by_recipient', false)
            .order('created_at', { ascending: false })
            .limit(100);

          if (searchTerm) {
            query = query.ilike('content', `%${searchTerm}%`);
          }

          const { data, error } = await query;

          if (error) {
            console.error('❌ Error fetching conversation:', error);
            throw error;
          }

          // Get sender profiles separately to avoid join issues
          const senderIds = [...new Set((data || []).map(msg => msg.sender_id))];
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', senderIds);

          const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

          const messages: EnhancedMessage[] = (data || []).map(msg => {
            const senderProfile = profilesMap.get(msg.sender_id);
            return {
              id: msg.id,
              content: msg.content,
              sender_id: msg.sender_id,
              recipient_id: msg.recipient_id,
              created_at: msg.created_at,
              read: msg.read,
              message_status: (msg.message_status as 'sending' | 'sent' | 'delivered' | 'read') || 'sent',
              edited_at: msg.edited_at || undefined,
              reactions: [],
              message_type: 'text' as const,
              attachment_url: msg.attachment_url || undefined,
              file_name: undefined,
              file_size: undefined,
              duration: undefined,
              sender_username: senderProfile?.username,
              sender_avatar_url: senderProfile?.avatar_url || undefined
            };
          }).reverse();

          console.log('✅ Fetched', messages.length, 'messages for conversation');
          return messages;
        } catch (error) {
          console.error('❌ Error in conversation query:', error);
          throw error;
        }
      },
      enabled: !!user && !!otherUserId,
      staleTime: 0,
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: 1000,
    });
  }, [user]);

  // Send message with enhanced features
  const useSendMessage = () => useMutation({
    mutationFn: async ({ 
      recipientId, 
      content, 
      messageType = 'text',
      attachmentUrl,
      fileName,
      fileSize,
      duration
    }: { 
      recipientId: string; 
      content: string; 
      messageType?: string;
      attachmentUrl?: string;
      fileName?: string;
      fileSize?: number;
      duration?: number;
    }) => {
      if (!user) throw new Error('User not authenticated');

      console.log('📤 Sending message:', { recipientId, content: content.substring(0, 50) + '...' });

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content,
          attachment_url: attachmentUrl
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error sending message:', error);
        throw error;
      }

      console.log('✅ Message sent successfully:', data.id);
      return data;
    },
    onSuccess: () => {
      console.log('📤 Message sent, realtime will update UI');
    },
    onError: (error) => {
      console.error('❌ Send message error:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  // Mark conversation as read
  const useMarkConversationAsRead = () => useMutation({
    mutationFn: async (otherUserId: string) => {
      if (!user) throw new Error('User not authenticated');

      console.log('📖 Marking conversation as read with:', otherUserId);

      const { error } = await supabase.rpc('mark_conversation_as_read_v2', {
        p_recipient_id: user.id,
        p_sender_id: otherUserId
      });

      if (error) {
        console.error('❌ Error marking as read:', error);
        throw error;
      }

      console.log('✅ Conversation marked as read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-users'] });
    }
  });

  // Toggle reaction on message
  const useToggleReaction = () => useMutation({
    mutationFn: async ({ messageId, reaction }: { messageId: string; reaction: string }) => {
      if (!user) throw new Error('User not authenticated');

      console.log('🔄 Toggling reaction:', { messageId, reaction });

      // For now, just return success - reactions table would need to be implemented
      return { success: true };
    },
    onSuccess: () => {
      console.log('✅ Reaction toggled');
    },
    onError: (error) => {
      console.error('❌ Toggle reaction error:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar reação.",
        variant: "destructive",
      });
    }
  });

  // Get conversation settings
  const useConversationSettings = (otherUserId: string) => {
    return useQuery({
      queryKey: ['conversation-settings', otherUserId],
      queryFn: async (): Promise<ConversationSettings | null> => {
        if (!user || !otherUserId) return null;

        // For now, return default settings - conversation_settings table would need to be implemented
        return {
          notifications_enabled: true,
          archived: false,
          pinned: false,
          muted: false,
          nickname: "",
          background_image: ""
        };
      },
      enabled: !!user && !!otherUserId,
    });
  };

  // Update conversation settings
  const useUpdateConversationSettings = () => useMutation({
    mutationFn: async ({ otherUserId, settings }: { 
      otherUserId: string; 
      settings: Partial<ConversationSettings> 
    }) => {
      if (!user) throw new Error('User not authenticated');

      console.log('⚙️ Updating conversation settings:', { otherUserId, settings });

      // For now, just return success - conversation_settings table would need to be implemented
      return { success: true };
    },
    onSuccess: () => {
      console.log('✅ Conversation settings updated');
      queryClient.invalidateQueries({ queryKey: ['conversation-settings'] });
    },
    onError: (error) => {
      console.error('❌ Update settings error:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as configurações.",
        variant: "destructive",
      });
    }
  });

  // Show notification function
  const showNotification = useCallback(async (message: any) => {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    if (Notification.permission === 'granted') {
      const notification = new Notification('Nova mensagem', {
        body: message.content,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      setTimeout(() => notification.close(), 5000);
    }
  }, []);

  // Clear conversation function
  const useClearConversation = () => useMutation({
    mutationFn: async (otherUserId: string) => {
      if (!user) throw new Error('User not authenticated');

      console.log('🗑️ Clearing conversation with:', otherUserId);

      const { error } = await supabase.rpc('clear_conversation', {
        p_user_id: user.id,
        p_other_user_id: otherUserId
      });

      if (error) {
        console.error('❌ Error clearing conversation:', error);
        throw error;
      }

      console.log('✅ Conversation cleared');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-users'] });
      if (activeConversation) {
        queryClient.invalidateQueries({ queryKey: ['conversation', activeConversation] });
      }
    }
  });

  return {
    // State
    activeConversation,
    setActiveConversation,
    isConnected,

    // Hooks
    useConversation,
    useSendMessage,
    useMarkConversationAsRead,
    useClearConversation,
    useToggleReaction,
    useConversationSettings,
    useUpdateConversationSettings,

    // Functions
    showNotification
  };
};
