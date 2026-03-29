"use client";

import { useSession } from "@/contexts/session-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { KnowledgeInputView } from "@/components/views/knowledge-input";
import { ChatInterface } from "@/components/views/chat-interface";
import { AnimatePresence, motion } from "motion/react";

export default function Home() {
  const { sessionId } = useSession();

  return (
    <div className="flex flex-col h-dvh overflow-hidden bg-background text-foreground transition-colors duration-500 font-sans selection:bg-primary/20">
      {/* Volumetric Dark Background Effect */}
      <div className="fixed inset-0 bg-volumetric pointer-events-none z-0" />

      {/* Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 h-20 px-6 md:px-12 flex items-center justify-between z-50">
        <div className="flex items-center gap-8">
          <div className="text-xl font-bold tracking-tight">Saadaan Helps</div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex flex-col relative z-10 pt-20 min-h-0">
        <AnimatePresence mode="wait">
          {!sessionId ? (
            <motion.div
              key="ingest"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 flex items-center justify-center"
            >
              <KnowledgeInputView />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 flex flex-col h-full overflow-hidden min-h-0"
            >
              <ChatInterface />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
