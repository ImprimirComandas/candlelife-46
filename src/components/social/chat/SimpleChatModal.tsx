
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MoreVertical, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DeleteConversationDialog } from "./DeleteConversationDialog";
import { useChatMessages } from "./hooks/useChatMessages";
import { useAuth } from "@/context/AuthContext";

interface SimpleChatModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
}

export const SimpleChatModal = ({
  isOpen,
  onOpenChange,
  recipientId,
  recipientName,
  recipientAvatar,
}: SimpleChatModalProps) => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const {
    messages,
    isLoading,
    handleSendMessage,
    handleClearConversation,
    clearConversationIsPending
  } = useChatMessages({ recipientId, isOpen });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await handleSendMessage(message);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md h-[600px] flex flex-col p-0">
          <DialogHeader className="border-b p-4">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  {recipientAvatar ? (
                    <AvatarImage src={recipientAvatar} alt={recipientName} />
                  ) : (
                    <AvatarFallback>{recipientName.charAt(0).toUpperCase()}</AvatarFallback>
                  )}
                </Avatar>
                <span className="font-medium">{recipientName}</span>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpar conversa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando mensagens...
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma mensagem ainda. Seja o primeiro a enviar uma mensagem!
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
            </div>
          </ScrollArea>

          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!message.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConversationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleClearConversation}
        isPending={clearConversationIsPending}
      />
    </>
  );
};
