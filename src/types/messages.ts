export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read'
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  AUDIO = 'audio',
  VIDEO = 'video',
  LOCATION = 'location'
}

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  created_at: string;
  read: boolean;
  read_at?: string;
  attachment_url?: string;
  deleted_by_recipient?: boolean;
  message_status: MessageStatus;
  message_type: MessageType;
  edited_at?: string;
  delivered_at?: string;
  edit_history?: EditHistory[];
  reply_to_id?: string;
  deleted_at?: string;
  is_soft_deleted?: boolean;
  sender_username?: string;
  sender_avatar_url?: string;
  file_name?: string;
  file_size?: number;
  duration?: number;
  reactions?: MessageReaction[];
}

export interface EditHistory {
  content: string;
  edited_at: string;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  type: string;
  created_at: string;
}

export interface ChatUser {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  email?: string;
  created_at: string;
  updated_at: string;
  unread_count: number;
  is_typing?: boolean;
  presence?: UserPresence;
  last_seen?: string;
  last_message?: Message;
}

export interface UserPresence {
  id: string;
  user_id: string;
  status: 'online' | 'away' | 'offline';
  last_seen: string;
  current_conversation?: string;
  created_at: string;
  updated_at: string;
}

export interface TypingStatus {
  id: string;
  user_id: string;
  conversation_with_user_id: string;
  is_typing: boolean;
  last_typed: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  participants: ChatUser[];
  last_message?: Message;
  unread_count: number;
  created_at: string;
  updated_at: string;
  settings?: ConversationSettings;
}

export interface ConversationSettings {
  id?: string;
  user_id?: string;
  other_user_id?: string;
  notifications_enabled: boolean;
  archived: boolean;
  pinned: boolean;
  muted: boolean;
  nickname: string;
  background_image: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedMessages {
  messages: Message[];
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface RealtimeMessageEvent {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: Message;
  old?: Message;
}

export interface RealtimeTypingEvent {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: TypingStatus;
  old?: TypingStatus;
}

export interface RealtimePresenceEvent {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: UserPresence;
  old?: UserPresence;
}
