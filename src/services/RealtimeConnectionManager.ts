import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

class RealtimeConnectionManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  createChannel(channelName: string): RealtimeChannel {
    // Remove existing channel if it exists
    this.removeChannel(channelName);

    console.log(`🔌 Creating realtime channel: ${channelName}`);
    
    const channel = supabase.channel(channelName, {
      config: {
        presence: { key: '' },
      },
    });

    this.channels.set(channelName, channel);

    // Setup connection monitoring
    channel.on('system', { event: '*' }, (payload) => {
      console.log(`📡 Channel ${channelName} system event:`, payload);
      
      if (payload.type === 'disconnected') {
        this.handleDisconnection(channelName);
      } else if (payload.type === 'connected') {
        this.reconnectAttempts = 0;
        console.log(`✅ Channel ${channelName} connected`);
      }
    });

    return channel;
  }

  removeChannel(channelName: string): void {
    const existingChannel = this.channels.get(channelName);
    if (existingChannel) {
      console.log(`🔌 Removing realtime channel: ${channelName}`);
      supabase.removeChannel(existingChannel);
      this.channels.delete(channelName);
    }
  }

  private handleDisconnection(channelName: string): void {
    console.log(`❌ Channel ${channelName} disconnected, attempting reconnect...`);
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      this.reconnectTimeout = setTimeout(() => {
        this.reconnectChannel(channelName);
      }, delay);
    } else {
      console.error(`❌ Max reconnection attempts reached for channel: ${channelName}`);
    }
  }

  private reconnectChannel(channelName: string): void {
    console.log(`🔄 Reconnecting channel: ${channelName}`);
    
    // Remove the disconnected channel
    this.removeChannel(channelName);
    
    // Create a new channel with the same name
    const newChannel = this.createChannel(channelName);
    
    // Re-subscribe (this should be handled by the calling code)
    console.log(`🔄 Channel ${channelName} recreated, ready for re-subscription`);
  }

  cleanup(): void {
    console.log('🧹 Cleaning up realtime connection manager');
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // Remove all channels
    for (const [channelName, channel] of this.channels) {
      console.log(`🔌 Removing channel: ${channelName}`);
      try {
        supabase.removeChannel(channel);
      } catch (error) {
        console.warn(`⚠️ Error removing channel ${channelName}:`, error);
      }
    }
    
    this.channels.clear();
    this.reconnectAttempts = 0;
  }

  getChannelStatus(): Record<string, string> {
    const status: Record<string, string> = {};
    
    for (const [name, channel] of this.channels) {
      status[name] = channel.state;
    }
    
    return status;
  }

  getConnectionCount(): number {
    return this.channels.size;
  }
}

export const realtimeConnectionManager = new RealtimeConnectionManager();