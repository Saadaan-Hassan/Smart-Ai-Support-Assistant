"use client";

import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

export function ThemeToggle() {
  return (
    <AnimatedThemeToggler className="w-10 h-10 flex items-center justify-center rounded-full text-foreground dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all hover:scale-110 active:scale-95 cursor-pointer" />
  );
}
