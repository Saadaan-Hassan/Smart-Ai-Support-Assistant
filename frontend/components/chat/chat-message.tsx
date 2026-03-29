import { Sparkles, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Message } from "@/hooks/use-chat";
import { MarkdownRenderer } from "./markdown-renderer";

export function ChatMessage({ message }: { message: Message }) {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-4 py-8 max-w-2xl mx-auto px-4",
        isAssistant ? "items-start" : "items-end",
      )}
    >
      <div className="flex items-center gap-3 mb-1">
        {isAssistant ? (
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground/40">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            Assistant
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground/40">
            User
          </div>
        )}
      </div>

      <div
        className={cn(
          "w-full text-lg leading-[1.8] font-medium tracking-tight whitespace-normal",
          isAssistant
            ? "text-muted-foreground/90"
            : "dark:text-white px-6 py-4 rounded-3xl bg-zinc-50/50 dark:bg-white/5 border border-black/5 dark:border-white/5",
        )}
      >
        {isAssistant ? (
          <>
            {message.content ? (
              <MarkdownRenderer
                content={message.content}
                className="text-lg leading-relaxed text-muted-foreground/90 font-medium"
              />
            ) : (
              <span className="flex items-center gap-1.5 opacity-30 mt-1">
                <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></span>
              </span>
            )}

            {/* Enhanced Grounding Sources UI */}
            {message.sources && message.sources.length > 0 && (
              <div className="mt-10 pt-8 border-t border-black/5 dark:border-white/5 w-full">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-muted-foreground/30">
                    Grounding Sources
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {message.sources.map((source, i) => (
                    <div
                      key={i}
                      className="group relative bg-zinc-50/50 dark:bg-[#111111] border border-black/5 dark:border-white/5 rounded-2xl p-4 overflow-hidden hover:bg-zinc-100/80 dark:hover:bg-white/5 transition-all cursor-default"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-6 h-6 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-center text-[10px] font-bold text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors">
                          {i + 1}
                        </div>
                        <Terminal className="w-3.5 h-3.5 text-muted-foreground/20 group-hover:text-muted-foreground/40 transition-colors" />
                      </div>
                      <p className="text-[12px] leading-[1.6] text-muted-foreground/70 dark:text-muted-foreground/60 group-hover:text-foreground dark:group-hover:text-white/90 transition-colors line-clamp-4 italic">
                        &ldquo;{source.trim()}&rdquo;
                      </p>

                      {/* Decorative accent */}
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-yellow-500/0 group-hover:bg-yellow-500/20 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div>{message.content}</div>
        )}
      </div>
    </div>
  );
}
