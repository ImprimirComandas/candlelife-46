import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useGlobalNotifications } from '@/context/GlobalNotificationsContext';
import { audioService } from '@/services/AudioService';
import { pushNotificationService } from '@/services/PushNotificationService';

export const NotificationInitializer = () => {
  const { user } = useAuth();
  const { requestPermissions } = useGlobalNotifications();

  useEffect(() => {
    if (!user) return;

    console.log('🔄 Initializing notification system...');
    
    // Register service worker
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          await navigator.serviceWorker.register('/sw.js');
          console.log('✅ Service Worker registered');
        } catch (error) {
          console.warn('⚠️ Service Worker registration failed:', error);
        }
      }
    };

    // Initialize push notifications
    const initializePushNotifications = async () => {
      try {
        await pushNotificationService.initialize();
        console.log('✅ Push notification service initialized');
      } catch (error) {
        console.warn('⚠️ Push notification service failed:', error);
      }
    };

    // Request notification permissions after a delay
    const requestPermissionsDelayed = () => {
      setTimeout(async () => {
        try {
          const granted = await requestPermissions();
          console.log('🔔 Notification permissions:', granted ? 'granted' : 'denied');
        } catch (error) {
          console.warn('⚠️ Failed to request notification permissions:', error);
        }
      }, 2000);
    };

    // Initialize audio service on user interaction
    const initAudio = () => {
      audioService.initializeUserInteraction();
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };

    // Setup all initializations
    registerServiceWorker();
    initializePushNotifications();
    requestPermissionsDelayed();
    
    document.addEventListener('click', initAudio);
    document.addEventListener('keydown', initAudio);
    document.addEventListener('touchstart', initAudio); // For mobile devices

    // Cleanup function
    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
  }, [user, requestPermissions]);

  return null;
};