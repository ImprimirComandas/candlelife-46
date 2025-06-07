
export interface Message {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  created_at: string;
  read: boolean;
  read_at?: string | null;
  attachment_url?: string | null;
  sender_username?: string;
  sender_avatar_url?: string | null;
  deleted_by_recipient?: boolean;
  message_status: 'sending' | 'sent' | 'delivered' | 'read';
  edited_at?: string;
  delivered_at?: string;
  edit_history?: EditHistory[];
  reply_to_id?: string;
  deleted_at?: string;
  is_soft_deleted?: boolean;
}

export interface EditHistory {
  content: string;
  edited_at: string;
}

export interface ChatUser {
  id: string;
  username: string;
  avatar_url?: string;
  last_message?: Message;
  unread_count: number;
  is_typing?: boolean;
}

export interface PaginatedMessages {
  messages: Message[];
  totalCount: number;
  hasMore: boolean;
}

export interface UserTypingStatus {
  userId: string;
  recipientId: string;
  isTyping: boolean;
  lastTyped: Date;
}
