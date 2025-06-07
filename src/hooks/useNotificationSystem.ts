
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { notificationService } from '@/services/notificationService';
import { pushNotificationService } from '@/services/PushNotificationService';

export const useNotificationSystem = () => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const [isInitialized, setIsInitialized] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastNotificationTime = useRef<number>(0);

  // Inicializar serviços de notificação
  useEffect(() => {
    const initializeServices = async () => {
      if (!user || isInitialized) return;

      try {
        // Inicializar serviços
        await notificationService.initialize();
        await pushNotificationService.initialize();
        
        // Configurar áudio de notificação
        audioRef.current = new Audio('/notification-sound.mp3');
        audioRef.current.volume = 0.5;
        
        setIsInitialized(true);
        console.log('Notification services initialized');
      } catch (error) {
        console.error('Failed to initialize notification services:', error);
      }
    };

    initializeServices();
  }, [user, isInitialized]);

  // Monitorar visibilidade da página
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Reproduzir som de notificação
  const playNotificationSound = async () => {
    if (!audioRef.current) return;

    try {
      // Evitar spam de notificações (mínimo 2 segundos entre notificações)
      const now = Date.now();
      if (now - lastNotificationTime.current < 2000) return;
      
      lastNotificationTime.current = now;
      
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  };

  // Mostrar notificação push
  const showPushNotification = async (title: string, body: string, data?: any) => {
    if (!isInitialized) return;

    try {
      await pushNotificationService.showLocalNotification(title, body, data);
    } catch (error) {
      console.error('Failed to show push notification:', error);
    }
  };

  // Mostrar notificação no navegador
  const showBrowserNotification = (title: string, body: string, data?: any) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/notification-badge.png',
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
      notification.close();
    };

    // Auto-close após 5 segundos
    setTimeout(() => notification.close(), 5000);
  };

  // Solicitar permissões
  const requestPermissions = async () => {
    try {
      // Solicitar permissão para notificações do navegador
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }

      // Solicitar permissão para push notifications
      await notificationService.requestPushPermission();
      
      return true;
    } catch (error) {
      console.error('Failed to request permissions:', error);
      return false;
    }
  };

  // Função principal para processar notificação de mensagem
  const handleNewMessage = async (message: any, sender: any) => {
    console.log('🔔 Processing notification:', { isVisible, message, sender });

    const title = `Nova mensagem de ${sender.username || sender.name || 'Usuário'}`;
    const body = message.content.length > 50 
      ? message.content.substring(0, 50) + '...' 
      : message.content;

    const notificationData = {
      senderId: sender.id,
      senderName: sender.username || sender.name,
      senderAvatar: sender.avatar_url,
      messageId: message.id,
      conversationId: message.sender_id
    };

    // Se o usuário não está vendo a página
    if (!isVisible) {
      // Mostrar notificação push (mobile/desktop)
      await showPushNotification(title, body, notificationData);
      
      // Mostrar notificação do navegador (desktop)
      showBrowserNotification(title, body, notificationData);
    }

    // Sempre tocar som (mesmo se estiver visível, para feedback)
    await playNotificationSound();

    // Atualizar badge count
    try {
      await pushNotificationService.updateBadgeCount(1);
    } catch (error) {
      console.log('Could not update badge count:', error);
    }
  };

  return {
    isVisible,
    isInitialized,
    handleNewMessage,
    requestPermissions,
    playNotificationSound,
    showPushNotification,
    showBrowserNotification
  };
};
