
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

  // Get chat users with better error handling and last message
  const useChatUsers = () => {
    return useQuery({
      queryKey: messageKeys.chatUsers(),
      queryFn: async (): Promise<ChatUser[]> => {
        if (!user?.id) return [];

        console.log('🔍 Fetching chat users for:', user.id);

        try {
          // Get unique conversation partners
          const { data: conversations, error: conversationsError } = await supabase
            .from('messages')
            .select('sender_id, recipient_id, content, created_at')
            .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
            .order('created_at', { ascending: false });

          if (conversationsError) {
            console.error('❌ Error fetching conversations:', conversationsError);
            throw conversationsError;
          }

          // Get unique user IDs
          const userIds = new Set<string>();
          conversations?.forEach((msg: any) => {
            if (msg.sender_id !== user.id) userIds.add(msg.sender_id);
            if (msg.recipient_id !== user.id) userIds.add(msg.recipient_id);
          });

          if (userIds.size === 0) return [];

          // Get user profiles
          const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('id, username, avatar_url, created_at, updated_at')
            .in('id', Array.from(userIds));

          if (profileError) {
            console.error('❌ Error fetching profiles:', profileError);
            throw profileError;
          }

          // Map to ChatUser format with unread count and last message
          const chatUsers: ChatUser[] = [];
          
          for (const profile of profiles || []) {
            // Count unread messages from this user
            const { count } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('recipient_id', user.id)
              .eq('sender_id', profile.id)
              .eq('read', false);

            // Get last message in conversation
            const { data: lastMessageData } = await supabase
              .from('messages')
              .select('*')
              .or(`and(sender_id.eq.${user.id},recipient_id.eq.${profile.id}),and(sender_id.eq.${profile.id},recipient_id.eq.${user.id})`)
              .order('created_at', { ascending: false })
              .limit(1);

            const lastMessage = lastMessageData?.[0] ? {
              id: lastMessageData[0].id,
              content: lastMessageData[0].content,
              sender_id: lastMessageData[0].sender_id,
              recipient_id: lastMessageData[0].recipient_id,
              created_at: lastMessageData[0].created_at,
              read: lastMessageData[0].read || false,
              message_status: MessageStatus.SENT,
              message_type: MessageType.TEXT,
              attachment_url: lastMessageData[0].attachment_url,
              deleted_by_recipient: false,
              reactions: []
            } as Message : undefined;

            chatUsers.push({
              id: profile.id,
              username: profile.username || 'Usuário',
              full_name: profile.username || undefined,
              avatar_url: profile.avatar_url || undefined,
              email: profile.username || undefined,
              created_at: profile.created_at || new Date().toISOString(),
              updated_at: profile.updated_at || new Date().toISOString(),
              unread_count: count || 0,
              last_message: lastMessage
            });
          }

          // Sort by last message date
          chatUsers.sort((a, b) => {
            const aDate = a.last_message?.created_at || a.created_at;
            const bDate = b.last_message?.created_at || b.created_at;
            return new Date(bDate).getTime() - new Date(aDate).getTime();
          });

          console.log('✅ Fetched chat users with last messages:', chatUsers.length);
          return chatUsers;
        } catch (error) {
          console.error('❌ Error in chat users query:', error);
          return [];
        }
      },
      enabled: !!user,
      staleTime: 5000, // Reduced for more frequent updates
      refetchOnWindowFocus: true,
      retry: 2,
      retryDelay: 1000,
    });
  };

  // Get conversation messages with better error handling
  const useConversation = (otherUserId: string, searchTerm?: string) => {
    return useQuery({
      queryKey: messageKeys.conversationWithSearch(otherUserId, searchTerm),
      queryFn: async (): Promise<Message[]> => {
        if (!user || !otherUserId) return [];

        console.log('🔍 Fetching conversation:', { otherUserId, searchTerm });

        try {
          let query = supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
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
            read: msg.read || false,
            message_status: MessageStatus.SENT,
            message_type: MessageType.TEXT,
            attachment_url: msg.attachment_url,
            deleted_by_recipient: false,
            reactions: []
          })).reverse();

          console.log('✅ Fetched messages:', messages.length);
          return messages;
        } catch (error) {
          console.error('❌ Error in conversation query:', error);
          return [];
        }
      },
      enabled: !!user && !!otherUserId,
      staleTime: 0,
      refetchOnWindowFocus: false,
      retry: 2,
      retryDelay: 1000,
    });
  };

  // Send message with better error handling
  const useSendMessage = () => useMutation({
    mutationFn: async ({ 
      recipientId, 
      content, 
      attachmentUrl,
      fileName,
      fileSize
    }: { 
      recipientId: string; 
      content: string; 
      attachmentUrl?: string;
      fileName?: string;
      fileSize?: number;
    }) => {
      if (!user) throw new Error('User not authenticated');
      if (!content.trim() && !attachmentUrl) throw new Error('Content or attachment required');

      console.log('📤 Sending message:', { recipientId, content: content.substring(0, 50) + '...' });

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content: content.trim(),
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
    onSuccess: (data, variables) => {
      console.log('📤 Message sent, invalidating queries');
      queryClient.invalidateQueries({ queryKey: messageKeys.chatUsers() });
      queryClient.invalidateQueries({ queryKey: messageKeys.conversation(variables.recipientId) });
      
      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso.",
      });
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

      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('recipient_id', user.id)
        .eq('sender_id', otherUserId)
        .eq('read', false);

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

      const { error } = await supabase
        .from('messages')
        .delete()
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`);

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

      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user.id);

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

      const { error } = await supabase
        .from('messages')
        .update({ content })
        .eq('id', messageId)
        .eq('sender_id', user.id);

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
    useDeleteMessage,
    useEditMessage,

    // Direct data access
    chatUsers,
    isLoadingChatUsers,
    getTotalUnreadCount,

    // Functions
    showNotification
  };
};
