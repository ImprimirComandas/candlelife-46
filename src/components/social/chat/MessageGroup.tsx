import { Message } from "@/hooks/messages/types";
import { MessageItem } from "./MessageItem";
import { ReactNode } from "react";

interface MessageGroupProps {
  messages: Message[];
  currentUserId?: string;
  onDeleteMessage: (messageId: string) => void;
  onEditMessage: (messageId: string, newContent: string) => void;
  highlightSearchText?: (text: string) => ReactNode;
}

export const MessageGroup = ({
  messages,
  currentUserId,
  onDeleteMessage,
  onEditMessage,
  highlightSearchText
}: MessageGroupProps) => {
  // Função para agrupar mensagens consecutivas do mesmo remetente
  const groupMessages = (messages: Message[]): {
    message: Message;
    isFirstInGroup: boolean;
    isLastInGroup: boolean;
  }[] => {
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

  const groupedMessages = groupMessages(messages);

  return (
    <>
      {groupedMessages.map(({ message, isFirstInGroup, isLastInGroup }) => (
        <MessageItem
          key={message.id}
          message={{
            ...message,
            content: highlightSearchText ? 
              highlightSearchText(message.content) as unknown as string : 
              message.content
          }}
          currentUserId={currentUserId}
          onDeleteMessage={onDeleteMessage}
          onEditMessage={onEditMessage}
          isFirstInGroup={isFirstInGroup}
          isLastInGroup={isLastInGroup}
        />
      ))}
    </>
  );
};
