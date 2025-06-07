
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserIcon } from "lucide-react";
import { ChatUser } from "@/types/messages";

interface ChatUserItemProps {
  chatUser: ChatUser;
  onClick: () => void;
}

export const ChatUserItem = ({ chatUser, onClick }: ChatUserItemProps) => {
  return (
    <div 
      className="flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-muted transition-colors"
      onClick={onClick}
    >
      <div className="relative">
        <Avatar className="h-10 w-10">
          {chatUser.avatar_url ? (
            <AvatarImage src={chatUser.avatar_url} alt={chatUser.username} />
          ) : (
            <AvatarFallback>
              {chatUser.username && chatUser.username.length > 0
                ? chatUser.username[0].toUpperCase()
                : <UserIcon className="h-4 w-4" />}
            </AvatarFallback>
          )}
        </Avatar>
        {chatUser.unread_count && chatUser.unread_count > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0"
          >
            {chatUser.unread_count > 9 ? "9+" : chatUser.unread_count}
          </Badge>
        )}
      </div>
      <div>
        <p className="font-medium">{chatUser.username}</p>
        {chatUser.last_message && (
          <p className="text-sm text-muted-foreground truncate max-w-[200px]">
            {typeof chatUser.last_message === 'string' 
              ? chatUser.last_message 
              : chatUser.last_message.content}
          </p>
        )}
      </div>
    </div>
  );
};
