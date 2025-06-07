
import { Message } from "@/types/messages";
import { MessageActions } from "./MessageActions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { MessageAttachment } from "./MessageAttachment";
import { MessageStatus } from "./MessageStatus";

interface MessageItemProps {
  message: Message;
  currentUserId?: string;
  onDeleteMessage: (messageId: string) => void;
  onEditMessage: (messageId: string, newContent: string) => void;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
}

export const MessageItem = ({ 
  message, 
  currentUserId, 
  onDeleteMessage,
  onEditMessage,
  isFirstInGroup = true,
  isLastInGroup = true
}: MessageItemProps) => {
  const isMyMessage = message.sender_id === currentUserId;
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  
  const handleStartEdit = () => {
    setEditedContent(message.content);
    setIsEditing(true);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
  };
  
  const handleSaveEdit = () => {
    if (editedContent.trim() !== message.content) {
      onEditMessage(message.id, editedContent);
    }
    setIsEditing(false);
  };
  
  const formattedTime = formatDistanceToNow(
    new Date(message.created_at),
    { addSuffix: true, locale: ptBR }
  );

  return (
    <div 
      className={cn(
        "flex w-full gap-2 px-4",
        isMyMessage ? "justify-end" : "justify-start",
        !isFirstInGroup && !isMyMessage && "pl-12",
        !isFirstInGroup && isMyMessage && "pr-12"
      )}
    >
      {!isMyMessage && isFirstInGroup && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={message.sender_avatar_url || ""} />
          <AvatarFallback>{message.sender_username?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        "max-w-[75%]",
        isMyMessage ? "items-end" : "items-start",
      )}>
        <div className={cn(
          "group relative",
          isMyMessage 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted",
          isFirstInGroup && isMyMessage && "rounded-tr-lg",
          isFirstInGroup && !isMyMessage && "rounded-tl-lg",
          isLastInGroup && isMyMessage && "rounded-br-lg",
          isLastInGroup && !isMyMessage && "rounded-bl-lg",
          isMyMessage
            ? "rounded-l-lg"
            : "rounded-r-lg",
          "px-3 py-2",
          // Adicionar borda para mensagens não lidas (apenas para mensagens que recebi)
          !isMyMessage && !message.read_at && "border-2 border-primary/50"
        )}>
          {isFirstInGroup && !isMyMessage && (
            <div className="text-xs font-medium mb-1">
              {message.sender_username || "Usuário"}
            </div>
          )}
          
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full p-2 text-sm rounded bg-background text-foreground"
                rows={3}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button 
                  onClick={handleCancelEdit}
                  className="text-xs bg-muted px-2 py-1 rounded"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveEdit}
                  className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded"
                >
                  Salvar
                </button>
              </div>
            </div>
          ) : (
            <div className="break-words">
              {typeof message.content === 'string' ? message.content : String(message.content)}
              
              {message.attachment_url && (
                <MessageAttachment url={message.attachment_url} />
              )}
            </div>
          )}
          
          {isLastInGroup && (
            <div className="flex items-center gap-2">
              <div className="text-xs opacity-70 whitespace-nowrap">
                {formattedTime}
              </div>
              {isMyMessage && (
                <MessageStatus 
                  status={message.read_at ? 'read' : message.read ? 'delivered' : 'sent'} 
                />
              )}
            </div>
          )}
          
          {!isEditing && isMyMessage && (
            <MessageActions 
              messageId={message.id}
              onDelete={() => onDeleteMessage(message.id)}
              onEdit={handleStartEdit}
            />
          )}
        </div>
      </div>
    </div>
  );
};
