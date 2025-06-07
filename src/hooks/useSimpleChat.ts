import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Message, ChatUser, MessageType } from '@/types/messages';
import { FileUploadService } from '@/services/FileUploadService';
import { notificationService } from '@/services/NotificationService';

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

        const users: ChatUser[] = profiles.map(profile => ({
          id: profile.id,
          username: profile.username,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          email: profile.email || '',
          created_at: profile.created_at,
          updated_at: profile.updated_at
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
      content, 
      attachment 
    }: { 
      recipientId: string; 
      content: string; 
      attachment?: File;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      let attachmentUrl: string | undefined;
      let fileName: string | undefined;
      let fileSize: number | undefined;

      // Upload do arquivo se fornecido
      if (attachment) {
        try {
          attachmentUrl = await FileUploadService.uploadMessageAttachment(attachment, user.id);
          fileName = attachment.name;
          fileSize = attachment.size;
        } catch (error) {
          console.error('Erro no upload do arquivo:', error);
          throw new Error('Falha no upload do arquivo');
        }
      }

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content,
          message_type: attachment ? MessageType.FILE : MessageType.TEXT,
          attachment_url: attachmentUrl,
          file_name: fileName,
          file_size: fileSize
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

  return {
    conversations,
    getConversations,
    getConversationMessages,
    sendMessage,
    markAsRead
  };
};
