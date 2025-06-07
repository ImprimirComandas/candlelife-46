
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type NotificationType = 
  | 'message' 
  | 'transaction' 
  | 'goal_achieved' 
  | 'payment_received' 
  | 'client_added' 
  | 'system' 
  | 'social';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  messages: boolean;
  transactions: boolean;
  goals: boolean;
  payments: boolean;
  clients: boolean;
  social: boolean;
  system: boolean;
  sound_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

interface GlobalNotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  showNotification: (type: NotificationType, title: string, message: string, data?: any) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  updatePreferences: (newPreferences: Partial<NotificationPreferences>) => Promise<void>;
  requestPermissions: () => Promise<boolean>;
}

const GlobalNotificationsContext = createContext<GlobalNotificationsContextType | null>(null);

const defaultPreferences: NotificationPreferences = {
  messages: true,
  transactions: true,
  goals: true,
  payments: true,
  clients: true,
  social: true,
  system: true,
  sound_enabled: true,
  quiet_hours_start: '22:00',
  quiet_hours_end: '08:00'
};

export const GlobalNotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);

  // Load user preferences from localStorage
  useEffect(() => {
    if (user) {
      const savedPreferences = localStorage.getItem(`notification_preferences_${user.id}`);
      if (savedPreferences) {
        setPreferences({ ...defaultPreferences, ...JSON.parse(savedPreferences) });
      }
    }
  }, [user]);

  // Setup realtime subscriptions for different notification types
  useEffect(() => {
    if (!user) return;

    const subscriptions: any[] = [];

    // Subscribe to messages
    if (preferences.messages) {
      const messagesSubscription = supabase
        .channel('messages_notifications')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'messages' },
          (payload) => {
            if (payload.new && payload.new.sender_id !== user.id) {
              showNotification(
                'message',
                'Nova mensagem',
                'Você recebeu uma nova mensagem',
                { messageId: payload.new.id, senderId: payload.new.sender_id }
              );
            }
          }
        )
        .subscribe();
      
      subscriptions.push(messagesSubscription);
    }

    // Subscribe to transactions
    if (preferences.transactions) {
      const transactionsSubscription = supabase
        .channel('transactions_notifications')
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'transactions' },
          (payload) => {
            if (payload.new && payload.new.user_id === user.id) {
              showNotification(
                'transaction',
                'Nova transação',
                `Transação de R$ ${payload.new.amount} adicionada`,
                { transactionId: payload.new.id }
              );
            }
          }
        )
        .subscribe();
      
      subscriptions.push(transactionsSubscription);
    }

    // Subscribe to clients
    if (preferences.clients) {
      const clientsSubscription = supabase
        .channel('clients_notifications')
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'clients' },
          (payload) => {
            if (payload.new && payload.new.user_id === user.id) {
              showNotification(
                'client_added',
                'Novo cliente',
                `Cliente ${payload.new.name} foi adicionado`,
                { clientId: payload.new.id }
              );
            }
          }
        )
        .subscribe();
      
      subscriptions.push(clientsSubscription);
    }

    return () => {
      subscriptions.forEach(sub => {
        supabase.removeChannel(sub);
      });
    };
  }, [user, preferences]);

  const showNotification = useCallback((type: NotificationType, title: string, message: string, data?: any) => {
    // Check if this type of notification is enabled
    const typeKey = type === 'message' ? 'messages' : 
                   type === 'transaction' ? 'transactions' :
                   type === 'goal_achieved' ? 'goals' :
                   type === 'payment_received' ? 'payments' :
                   type === 'client_added' ? 'clients' :
                   type === 'social' ? 'social' : 'system';
    
    if (!preferences[typeKey as keyof NotificationPreferences]) return;

    // Check quiet hours
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const quietStart = preferences.quiet_hours_start;
    const quietEnd = preferences.quiet_hours_end;
    
    const isQuietTime = quietStart > quietEnd ? 
      (currentTime >= quietStart || currentTime <= quietEnd) :
      (currentTime >= quietStart && currentTime <= quietEnd);

    const notification: Notification = {
      id: crypto.randomUUID(),
      type,
      title,
      message,
      data,
      read: false,
      created_at: new Date().toISOString()
    };

    setNotifications(prev => [notification, ...prev].slice(0, 100)); // Keep last 100 notifications

    // Show toast notification if not in quiet hours
    if (!isQuietTime) {
      toast({
        title,
        description: message,
      });

      // Play sound if enabled
      if (preferences.sound_enabled) {
        try {
          const audio = new Audio('/notification-sound.mp3');
          audio.volume = 0.3;
          audio.play().catch(() => {
            // Ignore audio play errors
          });
        } catch (error) {
          // Ignore audio errors
        }
      }
    }

    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const browserNotification = new Notification(title, {
          body: message,
          icon: '/favicon.ico',
          tag: type,
          requireInteraction: false,
        });

        setTimeout(() => browserNotification.close(), 5000);
      } catch (error) {
        // Ignore notification errors
      }
    }
  }, [preferences, toast]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
    const updatedPreferences = { ...preferences, ...newPreferences };
    setPreferences(updatedPreferences);
    
    if (user) {
      localStorage.setItem(`notification_preferences_${user.id}`, JSON.stringify(updatedPreferences));
    }
  }, [preferences, user]);

  const requestPermissions = useCallback(async () => {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return false;
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const value: GlobalNotificationsContextType = {
    notifications,
    unreadCount,
    preferences,
    showNotification,
    markAsRead,
    markAllAsRead,
    updatePreferences,
    requestPermissions
  };

  return (
    <GlobalNotificationsContext.Provider value={value}>
      {children}
    </GlobalNotificationsContext.Provider>
  );
};

export const useGlobalNotifications = () => {
  const context = useContext(GlobalNotificationsContext);
  if (!context) {
    throw new Error('useGlobalNotifications must be used within GlobalNotificationsProvider');
  }
  return context;
};
