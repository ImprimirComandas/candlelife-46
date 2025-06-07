
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Message, ChatUser, MessageType } from '@/types/messages';
import { notificationService } from '@/services/notificationService';

export const useSimpleChat = () => {
  const [conversations, setConversations] = useState<ChatUser[]>([]);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const getConversations = () => {
    return useQuery({
      queryKey: ['conversations'],
      queryFn: async () => {
        if (!user) return [];

        const { data: messages } = await supabase
          .from('messages')
          .select('sender_id, recipient_id')
          .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);

        if (!messages) return [];

        const userIds = new Set<string>();
        messages.forEach(message => {
          if (message.sender_id !== user.id) userIds.add(message.sender_id);
          if (message.recipient_id !== user.id) userIds.add(message.recipient_id);
        });

        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', Array.from(userIds));

        if (!profiles) return [];

        // Count unread messages for each user
        const unreadCounts = new Map<string, number>();
        
        for (const profile of profiles) {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('recipient_id', user.id)
            .eq('sender_id', profile.id)
            .eq('read', false);

          unreadCounts.set(profile.id, count || 0);
        }

        const users: ChatUser[] = profiles.map(profile => ({
          id: profile.id,
          username: profile.username,
          full_name: profile.username || undefined,
          avatar_url: profile.avatar_url || undefined,
          email: profile.username || undefined,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          unread_count: unreadCounts.get(profile.id) || 0
        }));

        setConversations(users);
        return users;
      },
    });
  };

  const getConversationMessages = (userId: string) => {
    return useQuery({
      queryKey: ['messages', userId],
      queryFn: async () => {
        if (!user) return [];

        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${user.id},sender_id.eq.${userId}`)
          .or(`recipient_id.eq.${user.id},recipient_id.eq.${userId}`)
          .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
      },
    });
  };

  const sendMessage = useMutation({
    mutationFn: async ({ 
      recipientId, 
      content 
    }: { 
      recipientId: string; 
      content: string; 
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content: content.trim()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    }
  });

  const markAsRead = useMutation({
    mutationFn: async (userId: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('recipient_id', user.id)
        .eq('sender_id', userId)
        .neq('read', true);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  const conversationsQuery = getConversations();

  return {
    conversations,
    getConversations,
    getConversationMessages,
    sendMessage,
    markAsRead,
    chatUsers: conversationsQuery.data || [],
    isLoadingChatUsers: conversationsQuery.isLoading,
    getTotalUnreadCount: () => (conversationsQuery.data || []).reduce((total, user) => total + user.unread_count, 0)
  };
};
