
import { useState, useEffect } from "react";
import { useMessagesContext } from "@/context/MessagesContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTypingIndicator } from "@/hooks/messages/useTypingIndicator";
import { Message } from "@/types/messages";

interface UseChatMessagesProps {
  recipientId: string;
  isOpen: boolean;
}

export const useChatMessages = ({ recipientId, isOpen }: UseChatMessagesProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  const {
    useConversation,
    sendMessage,
    clearConversation,
    deleteMessage,
    editMessage,
    setActiveConversation
  } = useMessagesContext();

  const { sendTypingStatus, isUserTyping } = useTypingIndicator();
  
  // Use the conversation hook with just recipientId and searchQuery
  const conversationQuery = useConversation(recipientId, searchQuery);
  const messages = conversationQuery.data || [];
  const isLoading = conversationQuery.isLoading;
  const isError = conversationQuery.isError;
  const refetch = conversationQuery.refetch;
  
  // Static values for compatibility
  const hasMore = false;
  const totalCount = messages.length;
  const isLoadingMore = false;
  
  // Check if recipient is typing
  const recipientIsTyping = isUserTyping(recipientId);

  // Initialize chat and fetch messages when opened
  useEffect(() => {
    if (isOpen && recipientId) {
      console.log("Chat opened for recipient:", recipientId);
      setActiveConversation(recipientId);
      setSearchQuery("");
      refetch();
    }
  }, [isOpen, recipientId, setActiveConversation, refetch]);

  // Handle search
  const handleSearch = (query: string) => {
    setIsSearching(true);
    setSearchQuery(query);
    
    // Reset search state after results load
    setTimeout(() => {
      setIsSearching(false);
    }, 500);
  };

  const handleSendMessage = async (content: string): Promise<void> => {
    console.log("handleSendMessage called", { content, user: user?.id, recipientId });
    
    if (!content.trim()) {
      toast({
        title: "Erro",
        description: "Digite uma mensagem para enviar",
        variant: "destructive",
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para enviar mensagens",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Sending message...", { recipientId, content });
      
      await sendMessage(recipientId, content.trim());
      console.log("Message sent successfully");
      sendTypingStatus(recipientId, false);
      refetch();
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const handleClearConversation = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para limpar conversas",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      await clearConversation(recipientId);
      refetch();
      toast({
        title: "Conversa limpa",
        description: "Todas as mensagens foram removidas."
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: `Não foi possível limpar a conversa: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });
      return false;
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para excluir mensagens",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await deleteMessage(messageId);
      refetch();
      toast({
        title: "Mensagem excluída",
        description: "A mensagem foi excluída com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: `Não foi possível excluir a mensagem: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para editar mensagens",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await editMessage(messageId, newContent);
      refetch();
      toast({
        title: "Mensagem editada",
        description: "A mensagem foi editada com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: `Não foi possível editar a mensagem: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  };

  const handleLoadMoreMessages = async () => {
    // Not implemented for simplicity
    console.log("Load more messages not implemented");
  };
  
  const handleTypingStatusChange = (isTyping: boolean) => {
    if (user) {
      sendTypingStatus(recipientId, isTyping);
    }
  };

  return {
    messages,
    isLoading,
    isLoadingMore,
    isError,
    hasMore,
    totalCount,
    recipientIsTyping,
    searchQuery,
    isSearching,
    sendMessageIsPending: false,
    clearConversationIsPending: false,
    handleSearch,
    handleSendMessage,
    handleClearConversation,
    handleDeleteMessage,
    handleEditMessage,
    handleLoadMoreMessages,
    handleTypingStatusChange
  };
};
