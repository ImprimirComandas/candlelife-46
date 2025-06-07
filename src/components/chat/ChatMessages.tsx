import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { MessageItem } from "@/components/social/chat/MessageItem";
import { Message } from "@/types/messages";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  isLoadingMore: boolean;
  isError: boolean;
  currentUserId?: string;
  onDeleteMessage: (messageId: string) => void;
  onEditMessage: (messageId: string, newContent: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  totalCount: number;
  searchQuery: string;
}

export const ChatMessages = ({
  messages,
  isLoading,
  isLoadingMore,
  isError,
  currentUserId,
  onDeleteMessage,
  onEditMessage,
  onLoadMore,
  hasMore,
  totalCount,
  searchQuery
}: ChatMessagesProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive (but not when loading more)
  useEffect(() => {
    if (!isLoadingMore && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoadingMore]);

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Carregando mensagens...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>Erro ao carregar mensagens</span>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Nenhuma mensagem ainda.</p>
          <p className="text-xs mt-1">Seja o primeiro a enviar uma mensagem!</p>
        </div>
      </div>
    );
  }

  // Function to group consecutive messages from the same sender
  const groupMessages = () => {
    return messages.map((message, index) => {
      const prevMessage = index > 0 ? messages[index - 1] : null;
      const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
      
      const isFirstInGroup = !prevMessage || prevMessage.sender_id !== message.sender_id;
      const isLastInGroup = !nextMessage || nextMessage.sender_id !== message.sender_id;
      
      return {
        message,
        isFirstInGroup,
        isLastInGroup
      };
    });
  };

  const groupedMessages = groupMessages();

  return (
    <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
      <div className="space-y-4 py-4">
        {hasMore && (
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="text-xs"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Carregando...
                </>
              ) : (
                "Carregar mensagens anteriores"
              )}
            </Button>
          </div>
        )}

        {groupedMessages.map(({ message, isFirstInGroup, isLastInGroup }) => (
          <MessageItem
            key={message.id}
            message={message}
            currentUserId={currentUserId}
            onDeleteMessage={onDeleteMessage}
            onEditMessage={onEditMessage}
            isFirstInGroup={isFirstInGroup}
            isLastInGroup={isLastInGroup}
          />
        ))}
        
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};
