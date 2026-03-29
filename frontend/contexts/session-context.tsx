"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface SessionContextType {
  sessionId: string | null;
  setSessionId: (id: string | null) => void;
  resetSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);

  const resetSession = () => setSessionId(null);

  return (
    <SessionContext.Provider value={{ sessionId, setSessionId, resetSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
