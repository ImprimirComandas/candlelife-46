
export interface Message {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  created_at: string;
  read: boolean;
  read_at?: string;
  attachment_url?: string;
  sender_username?: string;
  sender_avatar_url?: string;
  edited_at?: string;
  message_status?: 'sent' | 'delivered' | 'read';
}

export interface ChatUser {
  id: string;
  username: string;
  avatar_url?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
  is_online?: boolean;
}
