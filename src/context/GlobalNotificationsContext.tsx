
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { supabase } from '@/integrations/supabase/client';
import { realtimeManager } from '@/services/RealtimeManager';

export type NotificationType = 
  | 'message' 
  | 'transaction' 
  | 'goal_achieved' 
  | 'payment_received' 
  | 'client_added'
  | 'system'
  | 'social';

export interface GlobalNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
  user_id: string;
}

export interface NotificationPreferences {
  messages: boolean;
  transactions: boolean;
  goals: boolean;
  payments: boolean;
  clients: boolean;
  system: boolean;
  social: boolean;
  sound_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

interface GlobalNotificationsContextType {
  notifications: GlobalNotification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  isLoading: boolean;
  showNotification: (type: NotificationType, title: string, message: string, data?: any) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
  requestPermissions: () => Promise<boolean>;
}

const GlobalNotificationsContext = createContext<GlobalNotificationsContextType | undefined>(undefined);

const defaultPreferences: NotificationPreferences = {
  messages: true,
  transactions: true,
  goals: true,
  payments: true,
  clients: true,
  system: true,
  social: true,
  sound_enabled: true,
  quiet_hours_start: '22:00',
  quiet_hours_end: '08:00'
};

export const GlobalNotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { handleNewMessage, requestPermissions, showPushNotification, playNotificationSound } = useNotificationSystem();
  
  const [notifications, setNotifications] = useState<GlobalNotification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading preferences:', error);
          return;
        }

        if (data) {
          setPreferences({
            messages: data.messages ?? true,
            transactions: data.transactions ?? true,
            goals: data.goals ?? true,
            payments: data.payments ?? true,
            clients: data.clients ?? true,
            system: data.system ?? true,
            social: data.social ?? true,
            sound_enabled: data.sound_enabled ?? true,
            quiet_hours_start: data.quiet_hours_start ?? '22:00',
            quiet_hours_end: data.quiet_hours_end ?? '08:00'
          });
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };

    loadPreferences();
  }, [user]);

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('user_notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error loading notifications:', error);
          return;
        }

        setNotifications(data || []);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, [user]);

  // Setup realtime subscriptions
  useEffect(() => {
    if (!user) return;

    const setupRealtimeSubscriptions = () => {
      // Subscribe to notifications
      const notificationsUnsubscribe = realtimeManager.subscribe({
        channelName: 'user-notifications',
        filters: [
          {
            event: 'INSERT',
            schema: 'public',
            table: 'user_notifications',
            filter: `user_id=eq.${user.id}`
          }
        ],
        onSubscriptionChange: (payload) => {
          if (payload.eventType === 'INSERT') {
            const newNotification = payload.new as GlobalNotification;
            setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);
            handleNotificationReceived(newNotification);
          }
        }
      }, 'global-notifications');

      // Subscribe to other relevant tables for automatic notifications
      const transactionsUnsubscribe = realtimeManager.subscribe({
        channelName: 'transactions-notifications',
        filters: [
          {
            event: 'INSERT',
            schema: 'public',
            table: 'transactions',
            filter: `user_id=eq.${user.id}`
          }
        ],
        onSubscriptionChange: (payload) => {
          if (payload.eventType === 'INSERT' && preferences.transactions) {
            const transaction = payload.new;
            showNotification(
              'transaction',
              'Nova Transação',
              `${transaction.type === 'income' ? 'Receita' : 'Despesa'} de R$ ${transaction.amount.toFixed(2)}`,
              { transactionId: transaction.id }
            );
          }
        }
      }, 'global-notifications-transactions');

      unsubscribeRef.current = () => {
        notificationsUnsubscribe();
        transactionsUnsubscribe();
      };
    };

    setupRealtimeSubscriptions();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [user, preferences]);

  const isQuietHours = useCallback(() => {
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    const start = preferences.quiet_hours_start;
    const end = preferences.quiet_hours_end;
    
    if (start <= end) {
      return currentTime >= start && currentTime <= end;
    } else {
      return currentTime >= start || currentTime <= end;
    }
  }, [preferences.quiet_hours_start, preferences.quiet_hours_end]);

  const handleNotificationReceived = useCallback(async (notification: GlobalNotification) => {
    if (isQuietHours()) return;

    // Show push notification
    await showPushNotification(notification.title, notification.message, notification.data);

    // Play sound if enabled
    if (preferences.sound_enabled) {
      await playNotificationSound();
    }
  }, [isQuietHours, showPushNotification, playNotificationSound, preferences.sound_enabled]);

  const showNotification = useCallback(async (
    type: NotificationType, 
    title: string, 
    message: string, 
    data?: any
  ) => {
    if (!user) return;

    // Check if this type is enabled in preferences
    const typeEnabled = preferences[type === 'message' ? 'messages' : 
                               type === 'transaction' ? 'transactions' :
                               type === 'goal_achieved' ? 'goals' :
                               type === 'payment_received' ? 'payments' :
                               type === 'client_added' ? 'clients' :
                               type === 'system' ? 'system' : 'social'];

    if (!typeEnabled) return;

    try {
      const { data: notification, error } = await supabase
        .from('user_notifications')
        .insert({
          user_id: user.id,
          type,
          title,
          message,
          data,
          read: false
        })
        .select()
        .single();

      if (error) throw error;

      // The realtime subscription will handle adding to state
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }, [user, preferences]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await supabase
        .from('user_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      await supabase
        .from('user_notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [user]);

  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
    if (!user) return;

    const updatedPreferences = { ...preferences, ...newPreferences };
    setPreferences(updatedPreferences);

    try {
      await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...updatedPreferences
        });
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  }, [user, preferences]);

  const value: GlobalNotificationsContextType = {
    notifications,
    unreadCount,
    preferences,
    isLoading,
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
  if (context === undefined) {
    throw new Error('useGlobalNotifications must be used within a GlobalNotificationsProvider');
  }
  return context;
};
