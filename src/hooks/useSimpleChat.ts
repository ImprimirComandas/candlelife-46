
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";

export interface SimpleChatMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read: boolean;
  read_at?: string;
  attachment_url?: string;
}

export interface SimpleChatUser {
  id: string;
  username: string;
  avatar_url?: string;
  unread_count: number;
  last_message?: SimpleChatMessage;
}

export const useSimpleChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  // Get chat users
  const { data: chatUsers = [], isLoading: isLoadingChatUsers, refetch: refetchChatUsers } = useQuery({
    queryKey: ["simple-chat-users", user?.id],
    queryFn: async (): Promise<SimpleChatUser[]> => {
      if (!user?.id) return [];

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

      if (error) {
        console.error("Error fetching messages:", error);
        return [];
      }

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

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        return [];
      }

      // Calculate unread counts and last messages
      const chatUsers: SimpleChatUser[] = profiles?.map(profile => {
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
        } as SimpleChatMessage : undefined;

        return {
          id: profile.id,
          username: profile.username,
          avatar_url: profile.avatar_url || undefined,
          unread_count: unreadCount,
          last_message: lastMessage
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
  const getConversationMessages = (recipientId: string) => {
    return useQuery({
      queryKey: ["simple-conversation", user?.id, recipientId],
      queryFn: async (): Promise<SimpleChatMessage[]> => {
        if (!user?.id || !recipientId) return [];

        const { data: messages, error } = await supabase
          .from("messages")
          .select(`
            id,
            sender_id,
            recipient_id,
            content,
            created_at,
            read,
            read_at,
            attachment_url
          `)
          .or(`and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`)
          .eq("deleted_by_recipient", false)
          .eq("is_soft_deleted", false)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error fetching conversation:", error);
          return [];
        }

        return messages?.map(msg => ({
          id: msg.id,
          sender_id: msg.sender_id,
          recipient_id: msg.recipient_id,
          content: msg.content,
          created_at: msg.created_at,
          read: msg.read,
          read_at: msg.read_at || undefined,
          attachment_url: msg.attachment_url || undefined,
        })) || [];
      },
      enabled: !!user?.id && !!recipientId,
      refetchInterval: 3000, // Poll every 3 seconds for new messages
      staleTime: 0
    });
  };

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
      queryClient.invalidateQueries({ queryKey: ["simple-chat-users"] });
      queryClient.invalidateQueries({ queryKey: ["simple-conversation"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: `Falha ao enviar mensagem: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Mark as read mutation
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
      queryClient.invalidateQueries({ queryKey: ["simple-chat-users"] });
    }
  });

  // Setup realtime
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase.channel(`simple_chat_${user.id}`);

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
        queryClient.invalidateQueries({ queryKey: ["simple-chat-users"] });
        queryClient.invalidateQueries({ queryKey: ["simple-conversation"] });
        
        if (payload.new.sender_id !== user.id) {
          toast({
            title: "Nova mensagem",
            description: "Você recebeu uma nova mensagem"
          });
        }
      }
    );

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
        queryClient.invalidateQueries({ queryKey: ["simple-conversation"] });
      }
    );

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id, queryClient, toast]);

  const getTotalUnreadCount = (): number => {
    return chatUsers.reduce((total, user) => total + (user.unread_count || 0), 0);
  };

  return {
    chatUsers,
    isLoadingChatUsers,
    refetchChatUsers,
    getConversationMessages,
    sendMessage,
    markAsRead,
    getTotalUnreadCount
  };
};
