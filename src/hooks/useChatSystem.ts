
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCallback, useEffect, useRef, useState } from "react";

export interface ChatMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read: boolean;
  read_at?: string;
  attachment_url?: string;
  sender_username?: string;
  sender_avatar_url?: string;
}

export interface ChatUser {
  id: string;
  username: string;
  avatar_url?: string;
  unread_count: number;
  last_message?: ChatMessage;
  is_online?: boolean;
}

export const useChatSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Get chat users
  const { data: chatUsers = [], isLoading: isLoadingChatUsers, refetch: refetchChatUsers } = useQuery({
    queryKey: ["chat-users", user?.id],
    queryFn: async (): Promise<ChatUser[]> => {
      if (!user?.id) return [];

      // Get all unique users who have exchanged messages with current user
      const { data: messages, error } = await supabase
        .from("messages")
        .select(`
          sender_id,
          recipient_id,
          content,
          created_at,
          read
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq("deleted_by_recipient", false)
        .eq("is_soft_deleted", false)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get unique user IDs
      const userIds = new Set<string>();
      messages?.forEach(msg => {
        if (msg.sender_id !== user.id) userIds.add(msg.sender_id);
        if (msg.recipient_id !== user.id) userIds.add(msg.recipient_id);
      });

      if (userIds.size === 0) return [];

      // Get user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", Array.from(userIds));

      if (profilesError) throw profilesError;

      // Calculate unread counts and last messages
      const chatUsers: ChatUser[] = profiles?.map(profile => {
        const userMessages = messages?.filter(msg => 
          (msg.sender_id === profile.id && msg.recipient_id === user.id) ||
          (msg.sender_id === user.id && msg.recipient_id === profile.id)
        ) || [];

        const unreadCount = userMessages.filter(msg => 
          msg.recipient_id === user.id && !msg.read
        ).length;

        const lastMessage = userMessages[0] ? {
          id: `${userMessages[0].sender_id}-${userMessages[0].created_at}`,
          sender_id: userMessages[0].sender_id,
          recipient_id: userMessages[0].recipient_id,
          content: userMessages[0].content,
          created_at: userMessages[0].created_at,
          read: userMessages[0].read,
        } as ChatMessage : undefined;

        return {
          id: profile.id,
          username: profile.username,
          avatar_url: profile.avatar_url || undefined,
          unread_count: unreadCount,
          last_message: lastMessage,
          is_online: false
        };
      }) || [];

      return chatUsers.sort((a, b) => {
        const aTime = a.last_message?.created_at || '';
        const bTime = b.last_message?.created_at || '';
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });
    },
    enabled: !!user?.id,
    staleTime: 30000
  });

  // Get conversation messages
  const getConversation = useCallback((recipientId: string) => {
    return useQuery({
      queryKey: ["conversation", user?.id, recipientId],
      queryFn: async (): Promise<ChatMessage[]> => {
        if (!user?.id || !recipientId) return [];

        const { data: messages, error } = await supabase
          .from("messages")
          .select(`
            *,
            sender:profiles!messages_sender_id_fkey(username, avatar_url)
          `)
          .or(`and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`)
          .eq("deleted_by_recipient", false)
          .eq("is_soft_deleted", false)
          .order("created_at", { ascending: true });

        if (error) throw error;

        return messages?.map(msg => ({
          id: msg.id,
          sender_id: msg.sender_id,
          recipient_id: msg.recipient_id,
          content: msg.content,
          created_at: msg.created_at,
          read: msg.read,
          read_at: msg.read_at,
          attachment_url: msg.attachment_url,
          sender_username: msg.sender?.username,
          sender_avatar_url: msg.sender?.avatar_url,
        })) || [];
      },
      enabled: !!user?.id && !!recipientId,
      staleTime: 0
    });
  }, [user?.id]);

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async ({ recipientId, content }: { recipientId: string; content: string }) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-users"] });
      queryClient.invalidateQueries({ queryKey: ["conversation"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: `Falha ao enviar mensagem: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Mark conversation as read
  const markAsRead = useMutation({
    mutationFn: async (senderId: string) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { error } = await supabase.rpc('mark_conversation_as_read_v2', {
        p_recipient_id: user.id,
        p_sender_id: senderId
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-users"] });
    }
  });

  // Setup realtime
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase.channel(`chat_${user.id}`, {
      config: {
        broadcast: { self: false },
        presence: { key: user.id }
      }
    });

    // Listen to new messages
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `or(sender_id.eq.${user.id},recipient_id.eq.${user.id})`
      },
      (payload) => {
        console.log('📩 New message received:', payload);
        queryClient.invalidateQueries({ queryKey: ["chat-users"] });
        queryClient.invalidateQueries({ queryKey: ["conversation"] });
        
        // Show notification for new messages from others
        if (payload.new.sender_id !== user.id) {
          toast({
            title: "Nova mensagem",
            description: "Você recebeu uma nova mensagem"
          });
        }
      }
    );

    // Listen to message updates (read status)
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `or(sender_id.eq.${user.id},recipient_id.eq.${user.id})`
      },
      (payload) => {
        console.log('📝 Message updated:', payload);
        queryClient.invalidateQueries({ queryKey: ["conversation"] });
      }
    );

    channel.subscribe(async (status) => {
      console.log('📡 Chat channel status:', status);
      setIsConnected(status === 'SUBSCRIBED');
    });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        setIsConnected(false);
      }
    };
  }, [user?.id, queryClient, toast]);

  // Calculate total unread count
  const getTotalUnreadCount = useCallback((): number => {
    return chatUsers.reduce((total, user) => total + (user.unread_count || 0), 0);
  }, [chatUsers]);

  return {
    chatUsers,
    isLoadingChatUsers,
    refetchChatUsers,
    getConversation,
    sendMessage,
    markAsRead,
    getTotalUnreadCount,
    isConnected
  };
};
