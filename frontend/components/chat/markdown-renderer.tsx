import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none wrap-break-word", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ className, ...props }) => (
            <h1 className={cn("text-2xl font-bold mt-4 mb-3 text-foreground", className)} {...props} />
          ),
          h2: ({ className, ...props }) => (
            <h2 className={cn("text-xl font-bold mt-3 mb-2 text-foreground", className)} {...props} />
          ),
          h3: ({ className, ...props }) => (
            <h3 className={cn("text-lg font-bold mt-2 mb-1 text-foreground", className)} {...props} />
          ),
          
          // Lists
          ul: ({ className, ...props }) => (
            <ul className={cn("list-disc pl-6 mb-3 space-y-1 text-muted-foreground", className)} {...props} />
          ),
          ol: ({ className, ...props }) => (
            <ol className={cn("list-decimal pl-6 mb-3 space-y-1 text-muted-foreground", className)} {...props} />
          ),
          li: ({ className, ...props }) => (
            <li className={cn("leading-relaxed", className)} {...props} />
          ),
          
          // Paragraphs & Spacing
          p: ({ className, ...props }) => (
            <p className={cn("mb-3 leading-relaxed last:mb-0", className)} {...props} />
          ),
          
          // Code blocks
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            return isInline ? (
              <code className={cn("bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono", className)} {...props}>
                {children}
              </code>
            ) : (
              <code className={cn("block bg-transparent p-0 font-mono text-sm", className)} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ className, ...props }) => (
            <pre className={cn("bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl p-4 mb-4 overflow-x-auto", className)} {...props} />
          ),
          
          // Blockquotes
          blockquote: ({ className, ...props }) => (
            <blockquote className={cn("border-l-4 border-indigo-500/50 pl-4 italic my-4 text-muted-foreground", className)} {...props} />
          ),
          
          // Links
          a: ({ className, ...props }) => (
            <a className={cn("text-indigo-500 hover:text-indigo-400 underline underline-offset-4 transition-colors", className)} {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
