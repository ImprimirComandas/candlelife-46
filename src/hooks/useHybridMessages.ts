
import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from './use-toast';
import { Message, ChatUser, MessageType, MessageStatus } from '@/types/messages';

interface HybridMessagesConfig {
  activeConversation?: string;
  enableTypingIndicators?: boolean;
  pollingInterval?: number;
}

export const useHybridMessages = ({
  activeConversation,
  enableTypingIndicators = true,
  pollingInterval = 3000
}: HybridMessagesConfig = {}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(true);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Get chat users with optimized caching
  const getChatUsers = useQuery({
    queryKey: ['hybrid-chat-users', user?.id],
    queryFn: async (): Promise<ChatUser[]> => {
      if (!user?.id) return [];

      console.log('🔄 Fetching chat users via hybrid system');

      const { data: messages, error } = await supabase
        .from('messages')
        .select('sender_id, recipient_id, content, created_at, read')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching messages:', error);
        return [];
      }

      // Get unique user IDs
      const userIds = new Set<string>();
      messages?.forEach(msg => {
        if (msg.sender_id !== user.id) userIds.add(msg.sender_id);
        if (msg.recipient_id !== user.id) userIds.add(msg.recipient_id);
      });

      if (userIds.size === 0) return [];

      // Get profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', Array.from(userIds));

      if (profilesError) {
        console.error('❌ Error fetching profiles:', profilesError);
        return [];
      }

      // Calculate unread counts and build chat users
      const chatUsers: ChatUser[] = profiles?.map(profile => {
        const userMessages = messages?.filter(msg => 
          (msg.sender_id === profile.id && msg.recipient_id === user.id) ||
          (msg.sender_id === user.id && msg.recipient_id === profile.id)
        ) || [];

        const unreadCount = userMessages.filter(msg => 
          msg.recipient_id === user.id && !msg.read
        ).length;

        const lastMessage = userMessages[0] ? {
          id: userMessages[0].sender_id + userMessages[0].created_at,
          sender_id: userMessages[0].sender_id,
          recipient_id: userMessages[0].recipient_id,
          content: userMessages[0].content,
          created_at: userMessages[0].created_at,
          read: userMessages[0].read,
          message_status: MessageStatus.DELIVERED,
          message_type: MessageType.TEXT,
        } as Message : undefined;

        return {
          id: profile.id,
          username: profile.username,
          avatar_url: profile.avatar_url || undefined,
          unread_count: unreadCount,
          last_message: lastMessage,
          created_at: profile.id,
          updated_at: profile.id
        };
      }) || [];

      console.log(`✅ Loaded ${chatUsers.length} chat users`);
      return chatUsers.sort((a, b) => {
        const aTime = a.last_message?.created_at || '';
        const bTime = b.last_message?.created_at || '';
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });
    },
    enabled: !!user?.id,
    staleTime: 30000,
    refetchInterval: activeConversation ? undefined : 30000, // Only poll when not in active conversation
  });

  // Get conversation with intelligent polling
  const getConversation = useCallback((recipientId: string, searchQuery?: string) => {
    return useQuery({
      queryKey: ['hybrid-conversation', user?.id, recipientId, searchQuery],
      queryFn: async (): Promise<Message[]> => {
        if (!user?.id || !recipientId) return [];

        console.log(`🔄 Fetching conversation with ${recipientId}${searchQuery ? ` (search: ${searchQuery})` : ''}`);

        let query = supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`)
          .eq('deleted_by_recipient', false)
          .eq('is_soft_deleted', false)
          .order('created_at', { ascending: false })
          .limit(50);

        if (searchQuery) {
          query = query.ilike('content', `%${searchQuery}%`);
        }

        const { data, error } = await query;

        if (error) {
          console.error('❌ Error fetching conversation:', error);
          throw error;
        }

        // Transform data to ensure all required Message properties
        const messages: Message[] = (data || []).map(msg => ({
          ...msg,
          message_status: msg.message_status || MessageStatus.DELIVERED,
          message_type: msg.message_type || MessageType.TEXT,
        })).reverse();

        console.log(`✅ Loaded ${messages.length} messages for conversation`);
        return messages;
      },
      enabled: !!user?.id && !!recipientId,
      staleTime: 0,
      refetchInterval: activeConversation === recipientId ? pollingInterval : undefined, // Poll only active conversation
      refetchOnWindowFocus: true,
    });
  }, [user?.id, activeConversation, pollingInterval]);

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async ({ recipientId, content }: { recipientId: string; content: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('📤 Sending message via hybrid system');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content: content.trim(),
          message_type: MessageType.TEXT,
          message_status: MessageStatus.SENT
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      console.log('✅ Message sent successfully');
      // Immediate UI update for active conversation
      if (activeConversation === variables.recipientId) {
        queryClient.invalidateQueries({ 
          queryKey: ['hybrid-conversation', user?.id, variables.recipientId] 
        });
      }
      // Update chat users list
      queryClient.invalidateQueries({ queryKey: ['hybrid-chat-users'] });
    },
    onError: (error) => {
      console.error('❌ Error sending message:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  // Mark as read mutation
  const markAsRead = useMutation({
    mutationFn: async (senderId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('recipient_id', user.id)
        .eq('sender_id', senderId)
        .eq('read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hybrid-chat-users'] });
    }
  });

  // Simple typing indicator (without heavy realtime)
  const sendTypingStatus = useCallback((recipientId: string, isTyping: boolean) => {
    if (!enableTypingIndicators) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Simple typing simulation - in a real app, this could use a lightweight realtime channel
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        console.log(`⌨️ Typing stopped for ${recipientId}`);
      }, 3000);
    }
  }, [enableTypingIndicators]);

  // Connection status monitoring
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { error } = await supabase.from('profiles').select('id').limit(1);
        setIsConnected(!error);
      } catch {
        setIsConnected(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Calculate total unread count
  const getTotalUnreadCount = useCallback((): number => {
    const chatUsers = getChatUsers.data || [];
    return chatUsers.reduce((total, user) => total + (user.unread_count || 0), 0);
  }, [getChatUsers.data]);

  return {
    // Data
    chatUsers: getChatUsers.data || [],
    isLoadingChatUsers: getChatUsers.isLoading,
    isConnected,

    // Functions
    getConversation,
    getTotalUnreadCount,
    sendTypingStatus,

    // Mutations
    sendMessage,
    markAsRead,

    // Status
    isPolling: !!activeConversation,
    pollingInterval
  };
};
