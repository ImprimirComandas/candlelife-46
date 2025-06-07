
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';
import { audioService } from './AudioService';

class PushNotificationService {
  private initialized = false;
  private fcmToken: string | null = null;

  async initialize() {
    if (this.initialized) return;
    
    try {
      if (Capacitor.isNativePlatform()) {
        await this.initializeNative();
      } else {
        await this.initializeWeb();
      }
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }

  private async initializeNative() {
    // Request permissions
    await LocalNotifications.requestPermissions();
    await PushNotifications.requestPermissions();
    
    // Register for push notifications
    await PushNotifications.register();
    
    // Set up listeners
    PushNotifications.addListener('registration', async (token) => {
      console.log('Push registration success, token: ' + token.value);
      this.fcmToken = token.value;
      await this.saveFCMToken(token.value);
    });
    
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });
    
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received: ' + JSON.stringify(notification));
      this.handleNotificationReceived(notification);
    });
    
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push notification action performed', notification.actionId, notification.inputValue);
      this.handleNotificationTapped(notification);
    });
  }

  private async initializeWeb() {
    if ('serviceWorker' in navigator) {
      await navigator.serviceWorker.register('/sw.js');
    }
    
    if ('Notification' in window && Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      console.log('Web notification permission:', permission);
    }
  }

  private async saveFCMToken(token: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // For now, we'll store the token in user_sessions table as device_info
      // Later, a proper user_push_tokens table should be created via SQL migration
      const deviceInfo = `FCM_TOKEN:${token}:${Capacitor.getPlatform()}`;
      
      await supabase
        .from('user_sessions')
        .upsert({
          user_id: user.id,
          device_info: deviceInfo,
          last_active: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error saving FCM token:', error);
    }
  }

  async showLocalNotification(title: string, body: string, data?: any) {
    try {
      if (Capacitor.isNativePlatform()) {
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id: Date.now(),
              extra: data,
              sound: 'default',
              smallIcon: 'ic_launcher_foreground'
            }
          ]
        });
      } else if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: 'message-notification',
          requireInteraction: true,
          data
        });
        
        notification.onclick = () => {
          window.focus();
          if (data?.senderId) {
            window.dispatchEvent(new CustomEvent('open-chat', { 
              detail: { 
                userId: data.senderId, 
                userName: data.senderName,
                userAvatar: data.senderAvatar
              } 
            }));
          }
        };

        // Play notification sound
        audioService.playNotificationSound();
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  private handleNotificationReceived(notification: any) {
    // Handle notification received while app is in foreground
    const { title, body, data } = notification;
    
    // Show custom in-app notification or update UI
    window.dispatchEvent(new CustomEvent('notification-received', {
      detail: { title, body, data }
    }));
  }

  private handleNotificationTapped(notification: any) {
    // Handle notification tap
    const { data } = notification.notification;
    
    if (data?.senderId) {
      window.dispatchEvent(new CustomEvent('open-chat', {
        detail: {
          userId: data.senderId,
          userName: data.senderName,
          userAvatar: data.senderAvatar
        }
      }));
    }
  }

  async updateBadgeCount(count: number) {
    try {
      if (Capacitor.isNativePlatform()) {
        await LocalNotifications.schedule({
          notifications: [{
            id: 999999,
            title: '',
            body: '',
            extra: { badge: count }
          }]
        });
      }
    } catch (error) {
      console.error('Error updating badge count:', error);
    }
  }

  getFCMToken(): string | null {
    return this.fcmToken;
  }
}

export const pushNotificationService = new PushNotificationService();
