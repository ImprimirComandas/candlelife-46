
import { useState, useEffect, useCallback } from 'react';
import { Message, ChatUser, MessageType } from '@/types/messages';
import { ChatStorageService } from '@/services/ChatStorageService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface OfflineChatState {
  isOnline: boolean;
  pendingMessages: Message[];
  cachedConversations: { [userId: string]: Message[] };
  cachedUsers: ChatUser[];
}

export const useOfflineChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<OfflineChatState>({
    isOnline: navigator.onLine,
    pendingMessages: [],
    cachedConversations: {},
    cachedUsers: []
  });

  // Initialize offline storage
  useEffect(() => {
    if (user) {
      ChatStorageService.init(user.id);
      loadCachedData();
    }
  }, [user]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      syncPendingMessages();
      toast({
        title: "Conectado",
        description: "Sincronizando mensagens...",
      });
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
      toast({
        title: "Sem conexão",
        description: "Trabalhando offline. Mensagens serão sincronizadas quando voltar online.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadCachedData = useCallback(() => {
    if (!user) return;

    const conversations = ChatStorageService.getAllConversations();
    const users = ChatStorageService.getCachedUsers();
    const pending = ChatStorageService.getPendingMessages();

    setState(prev => ({
      ...prev,
      cachedConversations: conversations,
      cachedUsers: users,
      pendingMessages: pending
    }));
  }, [user]);

  const sendMessageOffline = useCallback(async (
    recipientId: string,
    content: string,
    attachment?: File
  ) => {
    if (!user) return;

    const tempMessage: Message = {
      id: `temp_${Date.now()}`,
      content,
      sender_id: user.id,
      recipient_id: recipientId,
      created_at: new Date().toISOString(),
      read: false,
      message_status: 'sending' as any,
      message_type: attachment ? MessageType.FILE : MessageType.TEXT,
      attachment_url: attachment ? URL.createObjectURL(attachment) : undefined,
      file_name: attachment?.name,
      file_size: attachment?.size
    };

    // Add to pending queue
    ChatStorageService.addPendingMessage(tempMessage);
    
    // Add to conversation cache
    ChatStorageService.addMessageToConversation(recipientId, tempMessage);

    setState(prev => ({
      ...prev,
      pendingMessages: [...prev.pendingMessages, tempMessage],
      cachedConversations: {
        ...prev.cachedConversations,
        [recipientId]: [...(prev.cachedConversations[recipientId] || []), tempMessage]
      }
    }));

    return tempMessage;
  }, [user]);

  const syncPendingMessages = useCallback(async () => {
    if (!state.isOnline || state.pendingMessages.length === 0) return;

    // Sync logic would go here - integrate with your existing message sending
    console.log('Syncing pending messages:', state.pendingMessages);
    
    // Clear pending after successful sync
    ChatStorageService.clearPendingMessages();
    setState(prev => ({ ...prev, pendingMessages: [] }));
  }, [state.isOnline, state.pendingMessages]);

  const getConversationMessages = useCallback((userId: string) => {
    return state.cachedConversations[userId] || [];
  }, [state.cachedConversations]);

  const cacheMessage = useCallback((message: Message) => {
    const otherUserId = message.sender_id === user?.id ? message.recipient_id : message.sender_id;
    ChatStorageService.addMessageToConversation(otherUserId, message);
    
    setState(prev => ({
      ...prev,
      cachedConversations: {
        ...prev.cachedConversations,
        [otherUserId]: [...(prev.cachedConversations[otherUserId] || []), message]
      }
    }));
  }, [user]);

  return {
    isOnline: state.isOnline,
    pendingMessages: state.pendingMessages,
    cachedUsers: state.cachedUsers,
    sendMessageOffline,
    getConversationMessages,
    cacheMessage,
    syncPendingMessages
  };
};
