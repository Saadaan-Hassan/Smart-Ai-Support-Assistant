"use client";

import { useState, useRef, useEffect } from "react";
import { Paperclip, ArrowRight, Sparkles, FileText } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

import { useSession } from "@/contexts/session-context";
import { ingestContent } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function KnowledgeInputView() {
  const { setSessionId } = useSession();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"text" | "file">("text");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Aggressively prevent default browser behavior for drag/drop
  useEffect(() => {
    const handleWindowDragOver = (e: DragEvent) => e.preventDefault();
    const handleWindowDrop = (e: DragEvent) => e.preventDefault();

    window.addEventListener("dragover", handleWindowDragOver);
    window.addEventListener("drop", handleWindowDrop);

    return () => {
      window.removeEventListener("dragover", handleWindowDragOver);
      window.removeEventListener("drop", handleWindowDrop);
    };
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    if (activeTab !== "file") {
      setActiveTab("file");
    }
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

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="max-w-5xl w-full mx-auto p-6 md:p-12 flex flex-col items-center">
      {/* Dynamic Hero Greeting */}
      <div className="text-center mb-8 md:mb-10 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-medium text-muted-foreground/60 tracking-tight">
            {getGreeting()}!
          </h1>
          <h2 className="text-4xl md:text-5xl max-w-lg font-medium text-foreground dark:text-white tracking-tight leading-tighter">
            What{" "}
            <span className="font-bold text-yellow-500/90 italic">
              knowledge
            </span>{" "}
            should we process today?
          </h2>
        </motion.div>
      </div>

      <div
        className="w-full max-w-4xl relative"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "text" | "file")}
          className="w-full"
        >
          {/* Tabs Navigation */}
          <TabsList className="group-data-horizontal/tabs:h-12 md:mb-4 p-1 bg-black/5 dark:bg-zinc-900/50 w-fit rounded-2xl border border-black/5 dark:border-white/5">
            <TabsTrigger
              value="text"
              className="px-6 py-2.5 text-xs font-semibold rounded-xl transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-[#1A1A1C] data-[state=active]:text-foreground dark:data-[state=active]:text-white data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-black/5 dark:data-[state=active]:border-white/10 text-muted-foreground/50 hover:text-foreground flex items-center gap-2"
            >
              <FileText className="w-3.5 h-3.5" />
              Direct Text
            </TabsTrigger>
            <TabsTrigger
              value="file"
              className="px-6 py-2.5 text-xs font-semibold rounded-xl transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-[#1A1A1C] data-[state=active]:text-foreground dark:data-[state=active]:text-white data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-black/5 dark:data-[state=active]:border-white/10 text-muted-foreground/50 hover:text-foreground flex items-center gap-2"
            >
              <Paperclip className="w-3.5 h-3.5" />
              File Input
            </TabsTrigger>
          </TabsList>

          <div
            className={cn(
              "bg-zinc-100/80 dark:bg-[#111111] border shadow-2xl rounded-[18px] p-4 transition-all focus-within:ring-1 focus-within:ring-black/10 dark:focus-within:ring-white/10 backdrop-blur-xl group/container overflow-hidden",
              isDragging
                ? "border-yellow-500 bg-yellow-500/5 dark:bg-yellow-500/10 ring-1 ring-yellow-500 shadow-[0_0_30px_rgba(59,130,246,0.15)] scale-[1.01]"
                : "border-black/5 dark:border-white/5",
            )}
          >
            <AnimatePresence mode="wait">
              <TabsContent
                value="text"
                className="mt-0 ring-offset-0 focus-visible:ring-0"
              >
                <motion.div
                  key="text"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <Textarea
                    placeholder="Paste your context here..."
                    className="border-none focus-visible:ring-0 resize-none dark:bg-transparent px-4 py-2 h-[200px] overflow-y-auto md:text-lg placeholder:text-muted-foreground/50 dark:placeholder:text-muted-foreground/70 font-medium leading-relaxed"
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
                </motion.div>
              </TabsContent>

              <TabsContent
                value="file"
                className="mt-0 ring-offset-0 focus-visible:ring-0"
              >
                <motion.div
                  key="file"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="min-h-[200px] flex flex-col items-center justify-center text-center"
                >
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={cn(
                      "w-full h-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all p-8",
                      isDragging
                        ? "border-yellow-500/50 bg-yellow-500/5 dark:bg-yellow-500/10"
                        : "border-black/10 dark:border-white/5 hover:border-black/20 dark:hover:border-white/10 hover:bg-black/5 dark:hover:bg-white/5",
                    )}
                  >
                    <div className="w-16 h-16 rounded-3xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-muted-foreground/30 dark:text-white/20">
                      {file ? (
                        <FileText className="w-8 h-8 text-foreground dark:text-white" />
                      ) : (
                        <Paperclip className="w-8 h-8" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground dark:text-white">
                        {file ? file.name : "Drop your .txt file here"}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {file
                          ? "Ready to analyze — press the arrow to start"
                          : "or click to browse your files"}
                      </p>
                    </div>
                    {file && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                        className="rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20! hover:text-red-500 px-4 h-8 text-[11px] font-bold uppercase tracking-wider"
                      >
                        Remove File
                      </Button>
                    )}
                  </div>
                </motion.div>
              </TabsContent>
            </AnimatePresence>

            <div className="flex items-center justify-between px-2 mt-4 pt-4 border-t border-black/5 dark:border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30 dark:text-white/50 px-4">
                  {activeTab === "text"
                    ? "Knowledge Text"
                    : "Document analysis"}
                </span>
              </div>

              <Button
                onClick={handleProcess}
                disabled={(!text.trim() && !file) || isProcessing}
                size="icon"
                className={cn(
                  "rounded-full w-10 h-10 transition-all",
                  ((activeTab === "text" && text.trim()) ||
                    (activeTab === "file" && file)) &&
                    !isProcessing
                    ? "bg-black dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95 shadow-xl"
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
        </Tabs>
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
