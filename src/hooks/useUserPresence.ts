
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface UserPresence {
  user_id: string;
  status: 'online' | 'offline' | 'away';
  last_seen: string;
}

export const useUserPresence = () => {
  const { user } = useAuth();
  const [userStatuses, setUserStatuses] = useState<Map<string, UserPresence>>(new Map());

  useEffect(() => {
    if (!user) return;

    // Atualizar status para online quando conectar
    const updatePresence = async (status: 'online' | 'offline' | 'away') => {
      await supabase
        .from('user_presence')
        .upsert({
          user_id: user.id,
          status,
          last_seen: new Date().toISOString()
        });
    };

    // Marcar como online
    updatePresence('online');

    // Configurar heartbeat para manter status online
    const heartbeat = setInterval(() => {
      updatePresence('online');
    }, 30000); // A cada 30 segundos

    // Ouvir mudanças de presence em tempo real
    const presenceChannel = supabase
      .channel('user_presence')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_presence'
      }, (payload) => {
        const presence = payload.new as UserPresence;
        setUserStatuses(prev => new Map(prev).set(presence.user_id, presence));
      })
      .subscribe();

    // Marcar como offline ao sair
    const handleBeforeUnload = () => {
      updatePresence('offline');
    };

    // Marcar como away quando a aba perde foco
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresence('away');
      } else {
        updatePresence('online');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(heartbeat);
      updatePresence('offline');
      supabase.removeChannel(presenceChannel);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  const getUserStatus = (userId: string): 'online' | 'offline' | 'away' => {
    const presence = userStatuses.get(userId);
    if (!presence) return 'offline';

    // Considerar offline se não atualizou nos últimos 2 minutos
    const lastSeen = new Date(presence.last_seen);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);

    if (diffMinutes > 2) return 'offline';
    return presence.status;
  };

  return {
    userStatuses,
    getUserStatus
  };
};
