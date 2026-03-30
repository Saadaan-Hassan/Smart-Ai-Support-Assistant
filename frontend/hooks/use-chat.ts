import { API_ROUTES } from "@/constants/api-routes";
import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  isStreaming?: boolean;
}

export function useChat(sessionId: string | null) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-greeting",
      role: "assistant",
      content:
        "I've processed your knowledge base perfectly! Feel free to ask me anything about the context you provided.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !sessionId) return;

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      const assistantMessageId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          isStreaming: true,
        },
      ]);

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${API_ROUTES.ASK}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id: sessionId, question: content }),
            signal: abortControllerRef.current.signal,
          },
        );

        if (!response.ok || !response.body) {
          throw new Error("Failed to get response from assistant.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;

        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMessageId
                        ? { ...m, isStreaming: false }
                        : m,
                    ),
                  );
                } else if (data.startsWith("[ERROR]")) {
                  // Handle explicit error sent by the backend as a data chunk
                  throw new Error(data.slice(7).trim());
                } else if (data.startsWith("[SOURCES]")) {
                  try {
                    const sourcesJson = data.slice(9);
                    const sources = JSON.parse(sourcesJson);
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === assistantMessageId ? { ...m, sources } : m,
                      ),
                    );
                  } catch (e) {
                    console.error("Error parsing sources", e, data);
                  }
                } else {
                  // regular token (replace escaped newlines if any)
                  const token = data.replace(/\\n/g, "\n");

                  // Artificial delay to create a visible "typing" effect
                  // await new Promise((resolve) => setTimeout(resolve, 0.5));

                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMessageId
                        ? { ...m, content: m.content + token }
                        : m,
                    ),
                  );
                }
              }
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          console.log("Stream aborted");
        } else {
          const errMsg =
            err instanceof Error
              ? err.message
              : "An error occurred during response generation.";
          toast.error(errMsg);
          // Remove the partially generated message on hard error
          setMessages((prev) =>
            prev.filter((m) => m.id !== assistantMessageId),
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId],
  );

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return { messages, input, setInput, sendMessage, isLoading, stopStreaming };
}
