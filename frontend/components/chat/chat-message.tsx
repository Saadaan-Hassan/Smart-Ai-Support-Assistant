import { Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Message } from "@/hooks/use-chat";
import { MarkdownRenderer } from "./markdown-renderer";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export function ChatMessage({ message }: { message: Message }) {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-4 py-8 max-w-4xl mx-auto px-4",
        isAssistant ? "items-start" : "items-end",
      )}
    >
      <div
        className={cn(
          "w-full text-lg leading-[1.8] font-medium tracking-tight whitespace-normal",
          isAssistant
            ? "text-muted-foreground/90"
            : "dark:text-white px-6 py-4 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 w-[80%]",
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

            {/* Refined Citation System using Shadcn HoverCard */}
            {message.sources && message.sources.length > 0 && (
              <div className="mt-10 pt-8 border-t border-black/8 dark:border-white/8 w-full">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60">
                    Source Citations
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {message.sources.map((source, i) => (
                    <HoverCard key={i} openDelay={100} closeDelay={150}>
                      <HoverCardTrigger asChild>
                        <button
                          className={cn(
                            "h-8 px-3 rounded-xl border text-[11px] font-bold transition-all flex items-center gap-2 cursor-pointer max-w-[140px]",
                            "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-muted-foreground/70 hover:bg-black/10 dark:hover:bg-white/10 hover:text-foreground dark:hover:text-white data-[state=open]:bg-yellow-500/10 data-[state=open]:border-yellow-500/50 data-[state=open]:text-yellow-600 dark:data-[state=open]:text-yellow-400",
                          )}
                        >
                          <span className="shrink-0 opacity-50">{i + 1}</span>
                          <span className="truncate opacity-80 font-medium">
                            {source.slice(0, 30)}...
                          </span>
                        </button>
                      </HoverCardTrigger>
                      <HoverCardContent
                        side="top"
                        align="end"
                        className="w-[calc(100vw-2rem)] sm:w-[380px] p-5 rounded-3xl bg-zinc-50/95 dark:bg-[#111111]/95 border border-black/5 dark:border-white/10 backdrop-blur-2xl shadow-xl overflow-hidden relative"
                      >
                        <div className="flex items-center justify-between mb-3 text-muted-foreground/50">
                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest italic opacity-80">
                            <Terminal className="w-3.5 h-3.5 text-yellow-500/50" />
                            Source Context {i + 1}
                          </div>
                        </div>
                        <ScrollArea className="max-h-36 overflow-y-auto">
                          <p className="text-[13px] leading-relaxed text-muted-foreground/80 dark:text-muted-foreground/70 italic font-medium pr-6 selection:bg-yellow-500/20 line-clamp-4">
                            &ldquo;{source.trim()}&rdquo;
                          </p>
                        </ScrollArea>

                        {/* Interactive accent line */}
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-yellow-500/40 to-transparent" />
                      </HoverCardContent>
                    </HoverCard>
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
