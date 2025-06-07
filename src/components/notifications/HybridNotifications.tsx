
import { useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useHybridMessages } from '@/hooks/useHybridMessages';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { useToast } from '@/hooks/use-toast';
import { notificationService } from '@/services/notificationService';
import { audioService } from '@/services/AudioService';
import { Message } from '@/types/messages';

export const HybridNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { chatUsers, getTotalUnreadCount } = useHybridMessages({
    enableTypingIndicators: false,
    pollingInterval: 30000
  });

  // Show notification for new messages
  const showMessageNotification = useCallback(async (message: Message) => {
    if (!user || message.sender_id === user.id) return;

    // Find sender info
    const sender = chatUsers.find(user => user.id === message.sender_id);
    const senderName = sender?.full_name || sender?.username || 'Usuário';
    
    // Show toast notification
    toast({
      title: `Nova mensagem de ${senderName}`,
      description: message.content.length > 80 
        ? message.content.substring(0, 80) + '...' 
        : message.content,
    });

    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(`Mensagem de ${senderName}`, {
        body: message.content.length > 100 
          ? message.content.substring(0, 100) + '...' 
          : message.content,
        icon: sender?.avatar_url || '/favicon.ico',
        tag: `message-${message.id}`,
        requireInteraction: false
      });

      setTimeout(() => notification.close(), 6000);
    }
    
    // Play notification sound
    audioService.playMessageSound();
  }, [user, chatUsers, toast]);

  // Setup realtime message notifications
  const { isConnected } = useRealtimeMessages({
    onNewMessage: showMessageNotification,
    onMessageUpdate: useCallback((message: Message) => {
      console.log('📝 Message updated:', message);
    }, [])
  });

  // Request notification permissions on mount
  useEffect(() => {
    if (user && 'Notification' in window && Notification.permission === 'default') {
      setTimeout(() => {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            toast({
              title: "Notificações ativadas",
              description: "Você receberá notificações de novas mensagens.",
            });
          }
        });
      }, 3000); // Wait 3 seconds after login
    }
  }, [user, toast]);

  return null; // This is a utility component with no UI
};
