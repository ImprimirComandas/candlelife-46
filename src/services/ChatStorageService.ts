import { Message, ChatUser } from '@/types/messages';

export class ChatStorageService {
  private static userId: string | null = null;

  static init(userId: string) {
    this.userId = userId;
  }

  private static getKey(suffix: string): string {
    return `chat_${this.userId}_${suffix}`;
  }

  // Conversations
  static addMessageToConversation(otherUserId: string, message: Message) {
    const key = this.getKey(`conversation_${otherUserId}`);
    const existing = this.getConversation(otherUserId);
    const updated = [...existing, message].slice(-100); // Keep last 100 messages
    localStorage.setItem(key, JSON.stringify(updated));
  }

  static getConversation(otherUserId: string): Message[] {
    const key = this.getKey(`conversation_${otherUserId}`);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  static getAllConversations(): { [userId: string]: Message[] } {
    const conversations: { [userId: string]: Message[] } = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`chat_${this.userId}_conversation_`)) {
        const userId = key.split('_')[3];
        const data = localStorage.getItem(key);
        if (data) {
          conversations[userId] = JSON.parse(data);
        }
      }
    }
    
    return conversations;
  }

  // Pending messages
  static addPendingMessage(message: Message) {
    const key = this.getKey('pending_messages');
    const existing = this.getPendingMessages();
    const updated = [...existing, message];
    localStorage.setItem(key, JSON.stringify(updated));
  }

  static getPendingMessages(): Message[] {
    const key = this.getKey('pending_messages');
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  static clearPendingMessages() {
    const key = this.getKey('pending_messages');
    localStorage.removeItem(key);
  }

  static removePendingMessage(messageId: string) {
    const key = this.getKey('pending_messages');
    const existing = this.getPendingMessages();
    const updated = existing.filter(msg => msg.id !== messageId);
    localStorage.setItem(key, JSON.stringify(updated));
  }

  // Users cache
  static cacheUser(user: ChatUser) {
    const key = this.getKey('cached_users');
    const existing = this.getCachedUsers();
    const updated = existing.filter(u => u.id !== user.id);
    updated.push(user);
    localStorage.setItem(key, JSON.stringify(updated.slice(-50))); // Keep last 50 users
  }

  static getCachedUsers(): ChatUser[] {
    const key = this.getKey('cached_users');
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  static getCachedUser(userId: string): ChatUser | null {
    const users = this.getCachedUsers();
    return users.find(u => u.id === userId) || null;
  }

  // Cleanup
  static clearAllData() {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith(`chat_${this.userId}_`)) {
        localStorage.removeItem(key);
      }
    }
  }

  // Storage size management
  static getStorageSize(): number {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`chat_${this.userId}_`)) {
        const data = localStorage.getItem(key);
        total += (key.length + (data?.length || 0)) * 2; // UTF-16 characters
      }
    }
    return total;
  }

  static cleanupOldData() {
    // If storage is getting too big (> 5MB), cleanup old conversations
    if (this.getStorageSize() > 5 * 1024 * 1024) {
      const conversations = this.getAllConversations();
      
      // Sort by last message date and keep only recent ones
      const sortedConversations = Object.entries(conversations)
        .map(([userId, messages]) => ({
          userId,
          lastMessage: messages[messages.length - 1]?.created_at || '1970-01-01'
        }))
        .sort((a, b) => new Date(b.lastMessage).getTime() - new Date(a.lastMessage).getTime())
        .slice(10); // Remove all but 10 most recent conversations

      sortedConversations.forEach(({ userId }) => {
        const key = this.getKey(`conversation_${userId}`);
        localStorage.removeItem(key);
      });
    }
  }
}
