import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/contexts/session-context";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { ThemeToggle } from "@/components/theme-toggle";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Saadaan Helps",
  description: "Minimalist ChatGPT-like RAG assistant",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} min-h-screen font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            {/* Navigation Bar */}
            <header className="fixed top-0 left-0 right-0 h-20 px-6 md:px-12 flex items-center justify-between z-50">
              <div className="flex items-center gap-8">
                <div className="text-xl font-bold tracking-tight">
                  Saadaan Helps
                </div>
              </div>

              <div className="flex items-center gap-4">
                <ThemeToggle />
              </div>
            </header>
            {children}
            <Toaster position="top-center" richColors />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
