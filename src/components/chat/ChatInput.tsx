
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  onTypingStatusChange: (isTyping: boolean) => void;
  isSubmitting: boolean;
}

export const ChatInput = ({
  onSendMessage,
  onTypingStatusChange,
  isSubmitting
}: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Handle typing status
  const handleTypingChange = (typing: boolean) => {
    if (typing !== isTyping) {
      setIsTyping(typing);
      onTypingStatusChange(typing);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing status after 2 seconds of inactivity
    if (typing) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onTypingStatusChange(false);
      }, 2000);
    }
  };

  const handleInputChange = (value: string) => {
    setMessage(value);
    handleTypingChange(value.trim().length > 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isSubmitting) {
      return;
    }

    try {
      await onSendMessage(message.trim());
      setMessage("");
      handleTypingChange(false);
      
      // Focus back to textarea after sending
      textareaRef.current?.focus();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="border-t p-4 bg-background">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="min-h-[44px] max-h-[120px] resize-none"
            disabled={isSubmitting}
          />
        </div>
        
        <Button
          type="submit"
          size="sm"
          disabled={!message.trim() || isSubmitting}
          className="h-11 w-11 p-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};
