"use client";

import { useRef, KeyboardEvent } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/lib/stores/chatStore";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  isLoading = false,
  disabled = false,
  placeholder = "Type your message...",
}: ChatInputProps) {
  const { currentInput, setInput } = useChatStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!currentInput.trim() || isLoading || disabled) return;

    onSend(currentInput.trim());
    setInput("");
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Cmd/Ctrl + Enter
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-end gap-2">
        <div className="relative flex-1">
          <TextareaAutosize
            ref={textareaRef}
            value={currentInput}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            minRows={1}
            maxRows={8}
            className={cn(
              "w-full resize-none rounded-lg border bg-background px-4 py-3 text-sm",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          />
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
            {currentInput.length > 0 && (
              <span>{currentInput.length} chars</span>
            )}
          </div>
        </div>
        <Button
          onClick={handleSend}
          disabled={!currentInput.trim() || isLoading || disabled}
          size="icon"
          className="h-12 w-12 shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
          <span className="sr-only">Send message</span>
        </Button>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        Press <kbd className="rounded bg-muted px-1">Cmd</kbd> +{" "}
        <kbd className="rounded bg-muted px-1">Enter</kbd> to send
      </div>
    </div>
  );
}
