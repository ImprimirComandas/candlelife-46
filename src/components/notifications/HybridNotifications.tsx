
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useHybridMessages } from '@/hooks/useHybridMessages';
import { useToast } from '@/hooks/use-toast';
import { notificationService } from '@/services/notificationService';
import { audioService } from '@/services/AudioService';

export const HybridNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { getTotalUnreadCount } = useHybridMessages({
    enableTypingIndicators: false,
    pollingInterval: 30000 // Check for notifications every 30 seconds
  });

  // Monitor unread count and show notifications
  useEffect(() => {
    if (!user) return;
    
    const checkUnreadMessages = () => {
      const unreadCount = getTotalUnreadCount();
      
      if (unreadCount > 0 && document.hidden) {
        // Show browser notification when app is in background
        if ('Notification' in window && Notification.permission === 'granted') {
          const notification = new Notification('CandleLife', {
            body: `Você tem ${unreadCount} mensagem${unreadCount > 1 ? 's' : ''} não lida${unreadCount > 1 ? 's' : ''}`,
            icon: '/favicon.ico',
            tag: 'unread-messages',
            requireInteraction: false
          });

          setTimeout(() => notification.close(), 5000);
          
          // Play notification sound
          audioService.playMessageSound();
        }
      }
    };

    // Check immediately and then periodically
    checkUnreadMessages();
    const interval = setInterval(checkUnreadMessages, 30000);

    return () => clearInterval(interval);
  }, [user, getTotalUnreadCount]);

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
