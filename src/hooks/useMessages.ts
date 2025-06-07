
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
          const { data, error } = await supabase
            .from('messages')
            .select(`
              id,
              sender_id,
              recipient_id,
              content,
              created_at,
              read,
              sender_profile:profiles!messages_sender_id_fkey(username, avatar_url),
              recipient_profile:profiles!messages_recipient_id_fkey(username, avatar_url)
            `)
            .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('❌ Error fetching chat users:', error);
            throw error;
          }

          // Group messages by conversation partner
          const conversationMap = new Map<string, ChatUser>();
          
          data?.forEach((msg: any) => {
            const isFromMe = msg.sender_id === user.id;
            const partnerId = isFromMe ? msg.recipient_id : msg.sender_id;
            const partnerProfile = isFromMe ? msg.recipient_profile : msg.sender_profile;
            
            if (!conversationMap.has(partnerId)) {
              conversationMap.set(partnerId, {
                id: partnerId,
                username: partnerProfile?.username || 'Usuário',
                avatar_url: partnerProfile?.avatar_url,
                last_message: {
                  id: msg.id,
                  content: msg.content,
                  sender_id: msg.sender_id,
                  recipient_id: msg.recipient_id,
                  created_at: msg.created_at,
                  read: msg.read,
                  message_status: MessageStatus.SENT,
                  message_type: MessageType.TEXT,
                  deleted_by_recipient: false,
                  sender_username: partnerProfile?.username,
                  sender_avatar_url: partnerProfile?.avatar_url
                },
                unread_count: 0
              });
            }
          });

          const chatUsers = Array.from(conversationMap.values());
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
              attachment_url,
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
            message_type: MessageType.TEXT,
            attachment_url: msg.attachment_url,
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

  // Delete message
  const useDeleteMessage = () => useMutation({
    mutationFn: async (messageId: string) => {
      if (!user) throw new Error('User not authenticated');

      console.log('🗑️ Deleting message:', messageId);

      const { error } = await supabase.rpc('soft_delete_message', {
        p_message_id: messageId,
        p_user_id: user.id
      });

      if (error) {
        console.error('❌ Error deleting message:', error);
        throw error;
      }

      console.log('✅ Message deleted');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.chatUsers() });
      if (activeConversation) {
        queryClient.invalidateQueries({ queryKey: messageKeys.conversation(activeConversation) });
      }
    }
  });

  // Edit message
  const useEditMessage = () => useMutation({
    mutationFn: async ({ messageId, content }: { messageId: string; content: string }) => {
      if (!user) throw new Error('User not authenticated');

      console.log('✏️ Editing message:', messageId);

      const { error } = await supabase.rpc('edit_message', {
        p_message_id: messageId,
        p_user_id: user.id,
        p_new_content: content
      });

      if (error) {
        console.error('❌ Error editing message:', error);
        throw error;
      }

      console.log('✅ Message edited');
    },
    onSuccess: () => {
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

  // Get total unread count
  const getTotalUnreadCount = () => {
    const chatUsersQuery = useChatUsers();
    const chatUsers = chatUsersQuery.data || [];
    return chatUsers.reduce((total, user) => total + user.unread_count, 0);
  };

  // Direct access to data for components that need it
  const chatUsersQuery = useChatUsers();
  const chatUsers = chatUsersQuery.data || [];
  const isLoadingChatUsers = chatUsersQuery.isLoading;

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
    useDeleteMessage,
    useEditMessage,

    // Direct data access
    chatUsers,
    isLoadingChatUsers,
    getTotalUnreadCount,

    // Direct functions for compatibility
    getConversation: useConversation,
    sendMessage: useSendMessage(),
    clearConversation: useClearConversation(),
    deleteMessage: useDeleteMessage(),
    editMessage: useEditMessage(),

    // Functions
    showNotification
  };
};
