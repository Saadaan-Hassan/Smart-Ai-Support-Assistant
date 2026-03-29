"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSession } from "@/contexts/session-context";
import { useChat } from "@/hooks/use-chat";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ChatInterface() {
  const { sessionId } = useSession();
  const { messages, sendMessage, isLoading, stopStreaming } =
    useChat(sessionId);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const allMessages = messages;

  return (
    <div className="flex flex-col h-full w-full relative min-h-0">
      <ScrollArea className="flex-1 w-full px-4 md:px-8 scroll-smooth min-h-0">
        <div className="max-w-4xl mx-auto flex flex-col gap-0 pb-24 min-h-max">
          <AnimatePresence>
            {allMessages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: idx === messages.length - 1 ? 0 : idx * 0.05,
                }}
                className="w-full"
              >
                <ChatMessage message={msg} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {/* Scroll Target */}
        <div ref={bottomRef} className="h-4" />
      </ScrollArea>

      {/* Floating Centered Input Container */}
      <div className="absolute bottom-0 left-0 right-0 z-50 pointer-events-none pb-2 pt-8 px-4 bg-linear-to-t from-background via-background/90 to-transparent">
        <div className="max-w-4xl mx-auto w-full pointer-events-auto">
          <ChatInput
            onSendMessage={sendMessage}
            isLoading={isLoading}
            onStop={stopStreaming}
          />
          <div className="text-center mt-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/20 hover:text-muted-foreground/40 transition-colors cursor-default select-none">
              Assistant grounded in unique content • Saadaan Helps
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
