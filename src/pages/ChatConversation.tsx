
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMessagesContext } from "@/context/MessagesContext";
import { useAuth } from "@/context/AuthContext";
import { useNative } from "@/hooks/useNative";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, Loader2, Circle, Settings } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { EnhancedChatModal } from "@/components/chat/enhanced/EnhancedChatModal";
import { useTypingIndicator } from "@/hooks/messages/useTypingIndicator";

const ChatConversation = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hapticFeedback } = useNative();
  const { toast } = useToast();
  
  const [message, setMessage] = useState("");
  const [isEnhancedModalOpen, setIsEnhancedModalOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    activeConversation,
    setActiveConversation,
    isConnected,
    sendMessage,
    useChatUsers,
    useConversation
  } = useMessagesContext();

  const { sendTypingStatus, isUserTyping } = useTypingIndicator();

  const chatUsersQuery = useChatUsers();
  const conversationQuery = useConversation(userId || "");

  const messages = conversationQuery.data || [];
  const chatUsers = chatUsersQuery.data || [];
  const recipient = chatUsers.find(u => u.id === userId);
  const isRecipientTyping = isUserTyping(userId || "");

  // Set active conversation
  useEffect(() => {
    if (userId && user?.id) {
      console.log('📱 Setting active conversation:', userId);
      setActiveConversation(userId);

      return () => {
        setActiveConversation(null);
      };
    }
  }, [userId, user?.id, setActiveConversation]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle typing status
  useEffect(() => {
    let typingTimeout: NodeJS.Timeout;

    if (message.trim() && userId) {
      sendTypingStatus(userId, true);
      
      typingTimeout = setTimeout(() => {
        sendTypingStatus(userId, false);
      }, 3000);
    } else if (userId) {
      sendTypingStatus(userId, false);
    }

    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [message, userId, sendTypingStatus]);

  const handleSendMessage = async () => {
    if (!message.trim() || !userId) return;

    try {
      hapticFeedback('light');
      
      // Stop typing indicator
      sendTypingStatus(userId, false);
      
      await sendMessage(userId, message.trim());
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isMyMessage = (senderId: string) => senderId === user?.id;

  if (!userId) {
    navigate('/chat');
    return null;
  }

  if (conversationQuery.isLoading && messages.length === 0) {
    return (
      <div className="flex flex-col h-screen max-w-md mx-auto items-center justify-center p-6 safe-area-top">
        <Spinner className="w-8 h-8 mb-4" />
        <p className="text-muted-foreground">Carregando conversa...</p>
      </div>
    );
  }

  if (conversationQuery.isError) {
    return (
      <div className="flex flex-col h-screen max-w-md mx-auto items-center justify-center p-6 safe-area-top">
        <p className="text-destructive mb-4">Erro ao carregar mensagens</p>
        <Button onClick={() => conversationQuery.refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-screen max-w-md mx-auto">
        {/* Header with safe area */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/50 p-4 safe-area-top">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                hapticFeedback('light');
                navigate('/chat');
              }}
              className="native-transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="relative">
              <Avatar className="h-10 w-10">
                {recipient?.avatar_url ? (
                  <AvatarImage src={recipient.avatar_url} alt={recipient.username} />
                ) : (
                  <AvatarFallback>
                    {recipient?.username?.charAt(0).toUpperCase() || "?"}
                  </AvatarFallback>
                )}
              </Avatar>
              {isConnected && (
                <Circle className="absolute -bottom-1 -right-1 h-3 w-3 fill-green-500 text-green-500" />
              )}
            </div>
            
            <div className="flex-1">
              <h2 className="font-medium text-lg">
                {recipient?.username || "Usuário"}
              </h2>
              <p className="text-xs text-green-500">
                {isConnected ? "Online" : "Desconectado"}
              </p>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="native-transition"
              onClick={() => setIsEnhancedModalOpen(true)}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Nenhuma mensagem ainda. Seja o primeiro a enviar uma mensagem!
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${isMyMessage(msg.sender_id) ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      isMyMessage(msg.sender_id)
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm break-words">{msg.content}</p>
                    <p className={`text-xs mt-1 ${
                      isMyMessage(msg.sender_id) 
                        ? 'text-primary-foreground/70' 
                        : 'text-muted-foreground'
                    }`}>
                      {formatMessageTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
            
            {/* Typing indicator */}
            {isRecipientTyping && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-4 py-2 rounded-bl-md">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input with safe area */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-md border-t border-border/50 p-4 safe-area-bottom">
          <div className="flex items-center gap-3">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="flex-1 rounded-full"
            />
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="rounded-full native-transition active:scale-95"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Chat Modal */}
      {recipient && (
        <EnhancedChatModal
          isOpen={isEnhancedModalOpen}
          onOpenChange={setIsEnhancedModalOpen}
          recipientId={recipient.id}
          recipientName={recipient.username}
          recipientAvatar={recipient.avatar_url}
        />
      )}
    </>
  );
};

export default ChatConversation;
