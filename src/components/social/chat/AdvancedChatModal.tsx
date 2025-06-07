
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAdvancedMessages } from "@/hooks/useAdvancedMessages";
import { useUserPresence } from "@/hooks/useUserPresence";
import { useTypingStatus } from "@/hooks/useTypingStatus";
import { AdvancedChatHeader } from "./AdvancedChatHeader";
import { AdvancedChatMessages } from "./AdvancedChatMessages";
import { AdvancedChatInput } from "./AdvancedChatInput";
import { AdvancedTypingIndicator } from "./AdvancedTypingIndicator";
import { DeleteConversationDialog } from "./DeleteConversationDialog";
import { Message } from "@/types/messages";

interface AdvancedChatModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
}

export const AdvancedChatModal = ({
  isOpen,
  onOpenChange,
  recipientId,
  recipientName,
  recipientAvatar,
}: AdvancedChatModalProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { 
    useConversation, 
    useSendMessage, 
    useEditMessage, 
    useDeleteMessage, 
    useMarkConversationAsRead,
    useClearConversation 
  } = useAdvancedMessages();

  const { isUserOnline, updateMyPresence } = useUserPresence();
  const { sendTypingStatus, isUserTyping } = useTypingStatus();

  const conversationQuery = useConversation(recipientId, searchQuery);
  const sendMessage = useSendMessage();
  const editMessage = useEditMessage();
  const deleteMessage = useDeleteMessage();
  const markConversationAsRead = useMarkConversationAsRead();
  const clearConversation = useClearConversation();

  // Map database types to Message interface
  const messages: Message[] = (conversationQuery.data?.messages || []).map((msg: any) => ({
    id: msg.id,
    content: msg.content,
    sender_id: msg.sender_id,
    recipient_id: msg.recipient_id,
    created_at: msg.created_at,
    read: msg.read,
    read_at: msg.read_at || undefined,
    attachment_url: msg.attachment_url || undefined,
    deleted_by_recipient: msg.deleted_by_recipient || false,
    message_status: msg.message_status || 'sent',
    message_type: msg.message_type || 'text',
    edited_at: msg.edited_at || undefined,
    delivered_at: msg.delivered_at || undefined,
    edit_history: msg.edit_history || [],
    reply_to_id: msg.reply_to_id || undefined,
    deleted_at: msg.deleted_at || undefined,
    is_soft_deleted: msg.is_soft_deleted || false,
    sender_username: msg.sender_username || undefined,
    sender_avatar_url: msg.sender_avatar_url || undefined,
    file_name: msg.file_name || undefined,
    file_size: msg.file_size || undefined,
    duration: msg.duration || undefined,
    reactions: msg.reactions || []
  }));

  const hasMore = conversationQuery.data?.hasNextPage || false;

  const isRecipientOnline = isUserOnline(recipientId);
  const isRecipientTyping = isUserTyping(recipientId);

  const handleSendMessage = async (content: string, attachment?: File) => {
    try {
      await sendMessage.mutateAsync({
        recipientId,
        content
      });
      
      // Marcar como lendo esta conversa
      updateMyPresence('online', recipientId);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    try {
      await editMessage.mutateAsync({ messageId, content: newContent });
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage.mutateAsync(messageId);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleClearConversation = async () => {
    try {
      await clearConversation.mutateAsync(recipientId);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error clearing conversation:', error);
    }
  };

  const handleSearch = (query: string) => {
    setIsSearching(true);
    setSearchQuery(query);
    setCurrentPage(1);
    
    setTimeout(() => {
      setIsSearching(false);
    }, 500);
  };

  const handleLoadMore = () => {
    if (hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleTypingStatusChange = (isTyping: boolean) => {
    sendTypingStatus(recipientId, isTyping);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md md:max-w-2xl lg:max-w-4xl p-0 gap-0 h-[80vh] max-h-[700px] flex flex-col">
          <AdvancedChatHeader 
            recipientName={recipientName}
            recipientAvatar={recipientAvatar}
            isOnline={isRecipientOnline}
            onClearChat={() => setIsDeleteDialogOpen(true)}
            onSearch={handleSearch}
            isSearching={isSearching}
          />

          <AdvancedChatMessages
            messages={messages}
            isLoading={conversationQuery.isLoading}
            isLoadingMore={conversationQuery.isLoading && currentPage > 1}
            isError={conversationQuery.isError}
            hasMore={hasMore}
            totalCount={messages.length}
            searchQuery={searchQuery}
            onDeleteMessage={handleDeleteMessage}
            onEditMessage={handleEditMessage}
            onLoadMore={handleLoadMore}
          />

          <AdvancedTypingIndicator 
            isTyping={isRecipientTyping}
            username={recipientName}
          />

          <AdvancedChatInput
            onSendMessage={handleSendMessage}
            onTypingStatusChange={handleTypingStatusChange}
            isSubmitting={sendMessage.isPending}
          />
        </DialogContent>
      </Dialog>

      <DeleteConversationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleClearConversation}
        isPending={clearConversation.isPending}
      />
    </>
  );
};
