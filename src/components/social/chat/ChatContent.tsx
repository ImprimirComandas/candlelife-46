
import { ChatMessages } from "./ChatMessages";
import { TypingIndicator } from "./TypingIndicator";
import { ChatInput } from "./ChatInput";
import { useAuth } from "@/context/AuthContext";
import { Message } from "@/types/messages";
import { useToast } from "@/hooks/use-toast";

interface ChatContentProps {
  messages: Message[];
  isLoading: boolean;
  isLoadingMore: boolean;
  isError: boolean;
  hasMore: boolean;
  totalCount: number;
  searchQuery: string;
  recipientName: string;
  recipientIsTyping: boolean;
  isSubmitting: boolean;
  onDeleteMessage: (messageId: string) => void;
  onEditMessage: (messageId: string, newContent: string) => void;
  onLoadMore: () => void;
  onSendMessage: (content: string, attachment?: File | null) => Promise<void>;
  onTypingStatusChange: (isTyping: boolean) => void;
}

export const ChatContent = ({
  messages,
  isLoading,
  isLoadingMore,
  isError,
  hasMore,
  totalCount,
  searchQuery,
  recipientName,
  recipientIsTyping,
  isSubmitting,
  onDeleteMessage,
  onEditMessage,
  onLoadMore,
  onSendMessage,
  onTypingStatusChange
}: ChatContentProps) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSendMessage = async (message: string, file?: File | null) => {
    await onSendMessage(message, file);
  };

  return (
    <>
      <ChatMessages
        messages={messages}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        isError={isError}
        currentUserId={user?.id}
        onDeleteMessage={onDeleteMessage}
        onEditMessage={onEditMessage}
        onLoadMore={onLoadMore}
        hasMore={hasMore}
        totalCount={totalCount}
        searchQuery={searchQuery}
      />
      
      {recipientIsTyping && (
        <TypingIndicator 
          isTyping={recipientIsTyping} 
          username={recipientName} 
        />
      )}
      
      <ChatInput
        onSendMessage={handleSendMessage}
        onTypingStatusChange={onTypingStatusChange}
        isSubmitting={isSubmitting}
      />
    </>
  );
};
