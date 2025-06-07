
import { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from './use-toast';
import { messageKeys } from '@/lib/query-keys';
import { 
  Message, 
  ChatUser, 
  ConversationSettings, 
  MessageStatus,
  MessageType,
  PaginatedMessages
} from '@/types/messages';

interface UseMessagesConfig {
  enableRealtime?: boolean;
  pageSize?: number;
}

export const useMessages = (config: UseMessagesConfig = {}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { enableRealtime = true, pageSize = 50 } = config;
  
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<any>(null);

  // Get chat users with unread counts
  const useChatUsers = () => {
    return useQuery({
      queryKey: messageKeys.chatUsers(),
      queryFn: async (): Promise<ChatUser[]> => {
        if (!user?.id) return [];

        console.log('🔍 Fetching chat users for:', user.id);

        try {
          const { data, error } = await supabase.rpc('get_chat_users', {
            p_user_id: user.id
          });

          if (error) {
            console.error('❌ Error fetching chat users:', error);
            throw error;
          }

          const chatUsers: ChatUser[] = (data || []).map((item: any) => ({
            id: item.user_id,
            username: item.username || 'Usuário',
            avatar_url: item.avatar_url,
            last_message: item.last_message ? {
              id: item.last_message.id,
              content: item.last_message.content,
              sender_id: item.last_message.sender_id,
              recipient_id: item.last_message.recipient_id,
              created_at: item.last_message.created_at,
              read: item.last_message.read,
              message_status: item.last_message.message_status || MessageStatus.SENT,
              message_type: MessageType.TEXT,
              deleted_by_recipient: item.last_message.deleted_by_recipient || false,
              attachment_url: item.last_message.attachment_url,
              sender_username: item.username,
              sender_avatar_url: item.avatar_url
            } : undefined,
            unread_count: item.unread_count || 0
          }));

          console.log('✅ Fetched chat users:', chatUsers.length);
          return chatUsers;
        } catch (error) {
          console.error('❌ Error in chat users query:', error);
          throw error;
        }
      },
      enabled: !!user,
      staleTime: 30000,
      refetchOnWindowFocus: false,
    });
  };

  // Get conversation messages
  const useConversation = (otherUserId: string, searchTerm?: string) => {
    return useQuery({
      queryKey: messageKeys.conversationWithSearch(otherUserId, searchTerm),
      queryFn: async (): Promise<Message[]> => {
        if (!user || !otherUserId) return [];

        console.log('🔍 Fetching conversation:', { otherUserId, searchTerm });

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
              message_type,
              edited_at,
              attachment_url,
              file_name,
              file_size,
              duration,
              sender_profile:profiles!messages_sender_id_fkey(username, avatar_url)
            `)
            .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
            .eq('deleted_by_recipient', false)
            .order('created_at', { ascending: false })
            .limit(pageSize);

          if (searchTerm) {
            query = query.ilike('content', `%${searchTerm}%`);
          }

          const { data, error } = await query;

          if (error) {
            console.error('❌ Error fetching conversation:', error);
            throw error;
          }

          const messages: Message[] = (data || []).map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            sender_id: msg.sender_id,
            recipient_id: msg.recipient_id,
            created_at: msg.created_at,
            read: msg.read,
            message_status: msg.message_status || MessageStatus.SENT,
            message_type: msg.message_type || MessageType.TEXT,
            edited_at: msg.edited_at,
            attachment_url: msg.attachment_url,
            file_name: msg.file_name,
            file_size: msg.file_size,
            duration: msg.duration,
            deleted_by_recipient: false,
            sender_username: msg.sender_profile?.username,
            sender_avatar_url: msg.sender_profile?.avatar_url,
            reactions: []
          })).reverse();

          console.log('✅ Fetched messages:', messages.length);
          return messages;
        } catch (error) {
          console.error('❌ Error in conversation query:', error);
          throw error;
        }
      },
      enabled: !!user && !!otherUserId,
      staleTime: 0,
      refetchOnWindowFocus: false,
    });
  };

  // Send message
  const useSendMessage = () => useMutation({
    mutationFn: async ({ 
      recipientId, 
      content, 
      messageType = MessageType.TEXT,
      attachmentUrl,
      fileName,
      fileSize,
      duration
    }: { 
      recipientId: string; 
      content: string; 
      messageType?: MessageType;
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
          message_type: messageType,
          attachment_url: attachmentUrl,
          file_name: fileName,
          file_size: fileSize,
          duration: duration
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
      console.log('📤 Message sent, invalidating queries');
      queryClient.invalidateQueries({ queryKey: messageKeys.chatUsers() });
      if (activeConversation) {
        queryClient.invalidateQueries({ queryKey: messageKeys.conversation(activeConversation) });
      }
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
      queryClient.invalidateQueries({ queryKey: messageKeys.chatUsers() });
    }
  });

  // Clear conversation
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
      queryClient.invalidateQueries({ queryKey: messageKeys.chatUsers() });
      if (activeConversation) {
        queryClient.invalidateQueries({ queryKey: messageKeys.conversation(activeConversation) });
      }
    }
  });

  // Get conversation settings
  const useConversationSettings = (otherUserId: string) => {
    return useQuery({
      queryKey: messageKeys.conversationSettings(otherUserId),
      queryFn: async (): Promise<ConversationSettings | null> => {
        if (!user || !otherUserId) return null;

        // Return default settings for now
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

  // Show notification
  const showNotification = useCallback(async (message: Message) => {
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

  return {
    // State
    activeConversation,
    setActiveConversation,
    isConnected,

    // Hooks
    useChatUsers,
    useConversation,
    useSendMessage,
    useMarkConversationAsRead,
    useClearConversation,
    useConversationSettings,

    // Functions
    showNotification
  };
};
