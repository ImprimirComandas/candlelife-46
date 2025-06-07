
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

class EnhancedNotificationService {
  private notifications: NotificationData[] = [];
  private listeners: ((notifications: NotificationData[]) => void)[] = [];
  private audioContext: AudioContext | null = null;

  constructor() {
    this.initializeAudio();
    this.loadStoredNotifications();
  }

  private async initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API não suportado:', error);
    }
  }

  private playBellSound() {
    if (!this.audioContext) return;

    try {
      // Criar som de sino usando osciladores
      const oscillator1 = this.audioContext.createOscillator();
      const oscillator2 = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Frequências do sino
      oscillator1.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator2.frequency.setValueAtTime(1000, this.audioContext.currentTime);
      
      // Envelope do som
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.8);
      
      oscillator1.start(this.audioContext.currentTime);
      oscillator2.start(this.audioContext.currentTime);
      oscillator1.stop(this.audioContext.currentTime + 0.8);
      oscillator2.stop(this.audioContext.currentTime + 0.8);
    } catch (error) {
      console.warn('Erro ao reproduzir som:', error);
    }
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
    
    // Manter apenas as últimas 50 notificações
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    this.saveNotifications();
    this.notifyListeners();

    // Tocar som
    this.playBellSound();

    // Mostrar notificação nativa se permitido
    this.showNativeNotification(newNotification);

    return newNotification;
  }

  private async showNativeNotification(notification: NotificationData) {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      const nativeNotif = new Notification(notification.title, {
        body: notification.body,
        icon: notification.avatar || '/notification-badge.png',
        badge: '/notification-badge.png',
        tag: notification.id
      });

      // Fechar automaticamente após 5 segundos
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

  // Método para notificações de mensagens
  addMessageNotification(message: Message, sender: ChatUser) {
    return this.addNotification({
      title: sender.full_name || sender.username || 'Nova mensagem',
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

  // Método para notificações do sistema
  addSystemNotification(title: string, body: string) {
    return this.addNotification({
      title,
      body,
      type: 'system'
    });
  }
}

export const notificationService = new EnhancedNotificationService();
