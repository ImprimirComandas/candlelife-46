
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  onTypingStatusChange: (isTyping: boolean) => void;
  isSubmitting: boolean;
  className?: string;
}

export const ChatInput = ({
  onSendMessage,
  onTypingStatusChange,
  isSubmitting,
  className = ""
}: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const typingTimeout = useRef<NodeJS.Timeout>();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Typing indicator logic
    if (value.trim()) {
      onTypingStatusChange(true);
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        onTypingStatusChange(false);
      }, 3000);
    } else {
      onTypingStatusChange(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;

    try {
      await onSendMessage(message.trim());
      setMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className={`border-t bg-background p-4 ${className}`}>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 flex items-center gap-2">
          <Input
            value={message}
            onChange={handleInputChange}
            placeholder="Digite sua mensagem..."
            disabled={isSubmitting}
            className="flex-1"
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={!message.trim() || isSubmitting}
          size="icon"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
};
