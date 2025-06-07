
export const messageKeys = {
  all: ['messages'] as const,
  
  // Chat users
  chatUsers: () => [...messageKeys.all, 'chat-users'] as const,
  
  // Conversations
  conversations: () => [...messageKeys.all, 'conversations'] as const,
  conversation: (userId: string) => [...messageKeys.conversations(), userId] as const,
  conversationWithSearch: (userId: string, searchTerm?: string) => 
    [...messageKeys.conversation(userId), searchTerm] as const,
  
  // Messages
  messages: () => [...messageKeys.all, 'messages'] as const,
  messagesByUser: (userId: string) => [...messageKeys.messages(), userId] as const,
  messagesPage: (userId: string, page: number) => 
    [...messageKeys.messagesByUser(userId), 'page', page] as const,
  
  // Settings
  settings: () => [...messageKeys.all, 'settings'] as const,
  conversationSettings: (userId: string) => 
    [...messageKeys.settings(), 'conversation', userId] as const,
  
  // Presence
  presence: () => [...messageKeys.all, 'presence'] as const,
  userPresence: (userId: string) => [...messageKeys.presence(), userId] as const,
  
  // Typing
  typing: () => [...messageKeys.all, 'typing'] as const,
  userTyping: (userId: string) => [...messageKeys.typing(), userId] as const,
} as const;
