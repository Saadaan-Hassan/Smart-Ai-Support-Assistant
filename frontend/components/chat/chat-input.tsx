import { useState, useRef, useEffect } from "react";
import { StopCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (msg: string) => void;
  isLoading: boolean;
  onStop: () => void;
}

export function ChatInput({
  onSendMessage,
  isLoading,
  onStop,
}: ChatInputProps) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [content]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!content.trim() || isLoading) return;
    onSendMessage(content);
    setContent("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <div className="relative w-full shadow-2xl rounded-[32px] bg-zinc-100/90 dark:bg-[#121212]/90 backdrop-blur-3xl border border-black/5 dark:border-white/5 flex transition-all focus-within:ring-1 focus-within:ring-black/10 dark:focus-within:ring-white/10">
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask a question..."
        className="min-h-[60px] max-h-[250px] border-0 focus-visible:ring-0 resize-none py-4 pl-6 pr-16 shadow-none overflow-y-auto w-full dark:bg-transparent md:text-[17px] text-base placeholder:text-muted-foreground/40 dark:placeholder:text-muted-foreground/30 font-medium"
        rows={1}
      />

      <div className="absolute right-3 bottom-0 top-0 flex flex-col justify-end pb-3">
        {isLoading ? (
          <Button
            size="icon"
            variant="ghost"
            className="w-10 h-10 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-all bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm"
            onClick={onStop}
          >
            <StopCircle className="w-5 h-5 fill-current" />
          </Button>
        ) : (
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!content.trim()}
            className={cn(
              "w-10 h-10 rounded-full transition-all flex items-center justify-center border shadow-sm",
              content.trim()
                ? "bg-black/80 text-white dark:bg-white/10 dark:text-white dark:hover:bg-white/20 border-black/10 dark:border-white/10 scale-100 hover:bg-black/90"
                : "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-muted-foreground/30 opacity-50 cursor-not-allowed scale-95",
            )}
          >
            <ArrowRight className="w-5 h-5 ml-px" />
          </Button>
        )}
      </div>
    </div>
  );
}
