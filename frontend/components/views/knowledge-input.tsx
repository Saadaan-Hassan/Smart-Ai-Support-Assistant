"use client";

import { useState, useRef } from "react";
import {
  Paperclip,
  ArrowRight,
  X,
  Sparkles,
  Globe,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

import { useSession } from "@/contexts/session-context";
import { ingestContent } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function KnowledgeInputView() {
  const { setSessionId } = useSession();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (!droppedFile.name.endsWith(".txt")) {
        toast.error("Only .txt files are supported.");
        return;
      }
      setFile(droppedFile);
      setText("");
      setShowAttachMenu(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.name.endsWith(".txt")) {
        toast.error("Only .txt files are supported.");
        return;
      }
      setFile(selectedFile);
      setText("");
      setShowAttachMenu(false);
    }
  };

  const handleProcess = async () => {
    if (!text.trim() && !file) {
      toast.error("Please provide some text or upload a file first.");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await ingestContent(
        text.trim() ? text : undefined,
        file || undefined,
      );
      toast.success(`Context saved: ${res.chunk_count} chunks analyzed.`);
      setSessionId(res.session_id);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to process context.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl w-full mx-auto p-6 md:p-12 flex flex-col items-center">
      {/* Centered Hero Greeting */}
      <div className="text-center mb-16 space-y-4">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-[11px] font-bold uppercase tracking-[0.4em] text-muted-foreground/30 mb-4"
        >
          LiLi 3.0
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-medium text-muted-foreground/60 tracking-tight">
            Good Morning, Lana!
          </h1>
          <h2 className="text-4xl md:text-5xl font-medium text-foreground dark:text-white tracking-tight">
            I am <span className="font-bold">ready to help you</span>
          </h2>
        </motion.div>
      </div>

      <div className="w-full max-w-4xl relative">
        <div 
          className={cn(
            "bg-zinc-100/80 dark:bg-[#111111] border shadow-2xl rounded-[30px] p-4 transition-all focus-within:ring-1 focus-within:ring-black/10 dark:focus-within:ring-white/10 backdrop-blur-xl",
            isDragging 
              ? "border-blue-500 bg-blue-500/5 dark:bg-blue-500/10 ring-1 ring-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.15)] scale-[1.01]" 
              : "border-black/5 dark:border-white/5"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Textarea
            placeholder="Paste your context here, or drag & drop a .txt file..."
            className="border-none focus-visible:ring-0 resize-none bg-transparent px-4 py-2 md:text-lg placeholder:text-muted-foreground/50 dark:placeholder:text-muted-foreground/70 font-medium leading-relaxed"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleProcess();
              }
            }}
            disabled={isProcessing}
          />

          <div className="flex items-center justify-between px-2 mt-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                  className="rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-[13px] font-medium h-10 px-5 text-foreground dark:text-white hover:bg-black/10 dark:hover:bg-white/10 flex items-center gap-2 transition-all active:scale-95 shadow-sm"
                >
                  <Paperclip className="w-4 h-4" />
                  Attach
                </Button>

                {/* Micro Attach Menu */}
                <AnimatePresence>
                  {showAttachMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute bottom-full left-0 mb-3 w-56 bg-white dark:bg-[#1A1A1C] border border-black/10 dark:border-white/10 rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 backdrop-blur-3xl"
                    >
                      <button
                        onClick={() => {
                          fileInputRef.current?.click();
                        }}
                        className="w-full text-left p-3 text-sm hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl flex items-center gap-3 transition-colors text-muted-foreground hover:text-foreground dark:hover:text-white"
                      >
                        <FileText className="w-4 h-4 text-black/40 dark:text-white/40" />
                        Upload .txt knowledge base
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <Button
              onClick={handleProcess}
              disabled={(!text.trim() && !file) || isProcessing}
              size="icon"
              className={cn(
                "rounded-full w-10 h-10 transition-all",
                (text.trim() || file) && !isProcessing
                  ? "bg-black/5 dark:bg-white/10 text-foreground dark:text-white hover:bg-black/10 dark:hover:bg-white/20 border border-black/10 dark:border-white/10 shadow-lg"
                  : "bg-black/5 dark:bg-white/5 text-muted-foreground/30 dark:text-muted-foreground/20 border border-black/5 dark:border-white/5",
              )}
            >
              {isProcessing ? (
                <Sparkles className="w-4 h-4 animate-pulse" />
              ) : (
                <ArrowRight className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Selected File Badge */}
        {file && (
          <div className="absolute -top-14 left-0 flex items-center gap-2 bg-zinc-100 dark:bg-white/5 border border-black/10 dark:border-white/10 text-foreground dark:text-white/70 px-4 py-2.5 rounded-2xl text-[13px] font-medium backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 shadow-sm">
            <FileText className="w-4 h-4 opacity-50" />
            {file.name}
            <button
              onClick={() => setFile(null)}
              className="ml-2 hover:text-red-500 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Cards Grid (Exactly as image) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-12 w-full max-w-5xl px-4">
        {[
          { title: "Do androids dream of electric sheep?", meta: "Right now" },
          {
            title: "Androids explained: Why LLMS will rule the world",
            meta: "4 april",
          },
          { title: "View 87+ more external sources", meta: "6 april" },
          { title: "View 87+ more external sources", meta: "12 april" },
          { title: "Dreams book", meta: "13 april" },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 + i * 0.08 }}
            className="bg-zinc-100/80 dark:bg-[#111111] border border-black/5 dark:border-white/5 p-6 rounded-[28px] hover:bg-zinc-200/80 dark:hover:bg-white/5 hover:border-black/10 dark:hover:border-white/10 transition-all cursor-pointer group flex flex-col justify-between aspect-square md:aspect-auto md:h-36 backdrop-blur-md shadow-sm"
          >
            <p className="text-[14px] leading-tight font-medium text-muted-foreground group-hover:text-foreground dark:group-hover:text-white transition-colors line-clamp-3">
              {card.title}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground/30 font-semibold tracking-tight">
              <Globe className="w-3.5 h-3.5" />
              {card.meta}
            </div>
          </motion.div>
        ))}
      </div>

      <input
        type="file"
        accept=".txt"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </div>
  );
}
