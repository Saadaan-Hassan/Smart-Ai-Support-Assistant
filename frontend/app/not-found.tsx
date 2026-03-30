"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * 404 Not Found Page
 * Designed with a premium, minimalist aesthetic consistent with Saadaan Helps.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-background font-sans">
      {/* ── Dynamic Background Accents ───────────────────────────────────────── */}
      <div className="fixed inset-0 bg-volumetric pointer-events-none z-0" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="z-10 text-center space-y-8 max-w-xl"
      >
        {/* ── Visual 404 Anchor ─────────────────────────────────────────────── */}
        <div className="relative group flex flex-col items-center">
          <motion.h1
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 60,
              damping: 20,
              delay: 0.1,
            }}
            className="text-[90px] md:text-[140px] font-black leading-none bg-linear-to-b from-foreground via-foreground to-foreground/10 bg-clip-text text-transparent select-none tracking-tighter"
          >
            404
          </motion.h1>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <div className="w-full h-px bg-linear-to-r from-transparent via-yellow-500/30 to-transparent group-hover:via-yellow-500/50 transition-all duration-1000 mt-[50px] md:mt-[70px]" />
          </div>
        </div>

        {/* ── Content ────────────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2"
          >
            <div className="h-px w-6 bg-foreground/10" />
            <h2 className="text-sm md:text-base font-bold tracking-[0.2em] uppercase text-muted-foreground/40">
              Error
            </h2>
            <div className="h-px w-6 bg-foreground/10" />
          </motion.div>

          <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight">
            We can&apos;t find this page.
          </h3>

          <p className="text-muted-foreground/80 text-base leading-relaxed max-w-sm mx-auto font-medium">
            The link might be broken or the page was moved. Let&apos;s get you
            back on track.
          </p>
        </div>

        {/* ── Call to Action ─────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
          <Button
            asChild
            size="lg"
            className="rounded-full px-8 py-3 h-auto text-sm gap-2.5 bg-foreground text-background hover:bg-foreground/90 transition-all shadow-xl shadow-black/5 dark:shadow-white/5 active:scale-95 font-bold"
          >
            <Link href="/">
              <Home className="w-4 h-4" />
              Return Home
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
