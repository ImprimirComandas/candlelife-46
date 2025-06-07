import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { realtimeConnectionManager } from '@/services/RealtimeConnectionManager';
import { audioService } from '@/services/AudioService';

export const ConnectionStatus = () => {
  const [status, setStatus] = useState<Record<string, string>>({});
  const [audioStatus, setAudioStatus] = useState<any>({});

  useEffect(() => {
    const updateStatus = () => {
      setStatus(realtimeConnectionManager.getChannelStatus());
      setAudioStatus(audioService.getStatus());
    };

    // Update status every 5 seconds
    updateStatus();
    const interval = setInterval(updateStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  const connectionCount = realtimeConnectionManager.getConnectionCount();
  const hasConnections = connectionCount > 0;

  if (!hasConnections) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-1">
      <div className="flex items-center space-x-2 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 border">
        <Badge variant={hasConnections ? 'default' : 'destructive'} className="text-xs">
          Realtime {hasConnections ? 'conectado' : 'desconectado'}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {connectionCount} channel{connectionCount !== 1 ? 's' : ''}
        </span>
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 border text-xs space-y-1">
          <div>Audio: {audioStatus.audioContext}</div>
          <div>Sound: {audioStatus.notificationSound ? '✓' : '✗'}</div>
          <div>Init: {audioStatus.isInitialized ? '✓' : '✗'}</div>
        </div>
      )}
    </div>
  );
};