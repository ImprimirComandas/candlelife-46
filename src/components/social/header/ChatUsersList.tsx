
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatUser } from "@/types/messages";
import { ChatUserItem } from "./ChatUserItem";

interface ChatUsersListProps {
  chatUsers: ChatUser[];
  isLoadingChatUsers: boolean;
  searchQuery: string;
  openChat: (userId: string, userName: string, userAvatar?: string) => void;
}

export const ChatUsersList = ({ 
  chatUsers, 
  isLoadingChatUsers, 
  searchQuery,
  openChat 
}: ChatUsersListProps) => {
  if (isLoadingChatUsers) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (chatUsers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {searchQuery.trim().length > 0 
          ? `Nenhum usuário encontrado com "${searchQuery}"`
          : "Nenhuma conversa iniciada. Clique no nome de um usuário em qualquer publicação para iniciar uma conversa."}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {chatUsers.map((chatUser) => (
        <ChatUserItem 
          key={chatUser.id}
          chatUser={chatUser}
          onClick={() => openChat(chatUser.id, chatUser.username, chatUser.avatar_url || undefined)}
        />
      ))}
    </div>
  );
};
