
import { Message, ChatUser } from '@/types/messages';

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  avatar?: string;
  timestamp: string;
  messageId?: string;
  senderId?: string;
  conversationId?: string;
  read: boolean;
  type: 'message' | 'system' | 'transaction';
}

class SimpleNotificationService {
  private notifications: NotificationData[] = [];
  private listeners: ((notifications: NotificationData[]) => void)[] = [];

  constructor() {
    this.loadStoredNotifications();
  }

  private loadStoredNotifications() {
    try {
      const stored = localStorage.getItem('app_notifications');
      if (stored) {
        this.notifications = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Erro ao carregar notificações:', error);
    }
  }

  private saveNotifications() {
    try {
      localStorage.setItem('app_notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.warn('Erro ao salvar notificações:', error);
    }
  }

  addNotification(notification: Omit<NotificationData, 'id' | 'timestamp' | 'read'>) {
    const newNotification: NotificationData = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false
    };

    this.notifications.unshift(newNotification);
    
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    this.saveNotifications();
    this.notifyListeners();
    this.showNativeNotification(newNotification);

    return newNotification;
  }

  private async showNativeNotification(notification: NotificationData) {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      const nativeNotif = new Notification(notification.title, {
        body: notification.body,
        icon: notification.avatar || '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id
      });

      setTimeout(() => nativeNotif.close(), 5000);
    } else if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.showNativeNotification(notification);
      }
    }
  }

  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
      this.notifyListeners();
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
    this.notifyListeners();
  }

  removeNotification(notificationId: string) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
    this.notifyListeners();
  }

  clearAll() {
    this.notifications = [];
    this.saveNotifications();
    this.notifyListeners();
  }

  subscribe(listener: (notifications: NotificationData[]) => void) {
    this.listeners.push(listener);
    listener(this.notifications);

    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  getNotifications(): NotificationData[] {
    return [...this.notifications];
  }

  addMessageNotification(message: Message, sender: ChatUser) {
    return this.addNotification({
      title: sender.full_name || sender.username,
      body: message.content.length > 100 
        ? message.content.substring(0, 100) + '...' 
        : message.content,
      avatar: sender.avatar_url,
      messageId: message.id,
      senderId: message.sender_id,
      conversationId: message.sender_id,
      type: 'message'
    });
  }

  addSystemNotification(title: string, body: string) {
    return this.addNotification({
      title,
      body,
      type: 'system'
    });
  }

  async requestPushPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;
    
    if (Notification.permission === 'granted') return true;
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
}

export const notificationService = new SimpleNotificationService();
