
export const messageKeys = {
  all: ['messages'] as const,
  chatUsers: () => [...messageKeys.all, 'chat-users'] as const,
  conversation: (userId: string) => [...messageKeys.all, 'conversation', userId] as const,
  conversationWithSearch: (userId: string, searchTerm?: string) => 
    [...messageKeys.conversation(userId), { search: searchTerm }] as const,
  conversationSettings: (userId: string) => [...messageKeys.all, 'settings', userId] as const,
};
