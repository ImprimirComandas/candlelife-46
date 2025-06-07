import React, { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { Message } from "@/hooks/messages/types";
import { ChatPagination } from "./ChatPagination";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageGroup } from "./MessageGroup";
import { Badge } from "@/components/ui/badge";

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
  searchQuery?: string;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = React.useState(true);

  useEffect(() => {
    // Only auto-scroll if not paginating or searching
    if (shouldScrollToBottom && !isLoadingMore && !searchQuery) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setShouldScrollToBottom(false);
    }
  }, [messages, isLoadingMore, shouldScrollToBottom, searchQuery]);

  // Reset scroll flag when new messages arrive that aren't from pagination
  useEffect(() => {
    if (!isLoadingMore && !searchQuery) {
      setShouldScrollToBottom(true);
    }
  }, [messages.length, isLoadingMore, searchQuery]);
  
  // If search is active, highlight the results
  const highlightSearchText = (text: string) => {
    if (!searchQuery) return text;
    
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === searchQuery.toLowerCase() ? 
            <span key={i} className="bg-yellow-200 text-black rounded px-1">{part}</span> : 
            part
        )}
      </>
    );
  };

  const renderLoadingSkeletons = () => {
    return Array(3).fill(0).map((_, index) => (
      <div 
        key={`skeleton-${index}`} 
        className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'} mb-4`}
      >
        {index % 2 === 0 && (
          <Skeleton className="h-8 w-8 rounded-full mr-2" />
        )}
        <div className="space-y-2">
          <Skeleton className={`h-16 ${index % 2 === 0 ? 'w-48' : 'w-56'} rounded-lg`} />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    ));
  };

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
      {isLoading && !isLoadingMore ? (
        <div className="space-y-4">
          {renderLoadingSkeletons()}
        </div>
      ) : isError ? (
        <div className="text-center py-8 text-destructive">
          Não foi possível carregar as mensagens.
        </div>
      ) : messages && messages.length > 0 ? (
        <>
          {searchQuery && (
            <div className="mb-4">
              <Badge variant="outline" className="bg-muted">
                {messages.length === 0 ? 'Nenhum resultado' : `${messages.length} resultado${messages.length !== 1 ? 's' : ''}`} para "{searchQuery}"
              </Badge>
            </div>
          )}
          
          <ChatPagination
            hasMore={hasMore}
            isLoading={isLoadingMore}
            onLoadMore={onLoadMore}
            totalCount={totalCount}
            visibleCount={messages.length}
          />
          
          {isLoadingMore && (
            <div className="flex justify-center py-2">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
          
          <MessageGroup
            messages={messages}
            currentUserId={currentUserId}
            onDeleteMessage={onDeleteMessage}
            onEditMessage={onEditMessage}
            highlightSearchText={searchQuery ? highlightSearchText : undefined}
          />

          <div ref={messagesEndRef} />
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          {searchQuery ? 'Nenhuma mensagem corresponde à sua pesquisa.' : 'Nenhuma mensagem ainda. Diga olá!'}
        </div>
      )}
    </ScrollArea>
  );
};
