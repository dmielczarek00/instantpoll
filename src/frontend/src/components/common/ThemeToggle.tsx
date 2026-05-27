"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative overflow-hidden rounded-full hover:scale-105 transition-transform"
    >
      <Sun
        className={`h-[1.2rem] w-[1.2rem] transition-all duration-500 ${
          isDark
            ? "rotate-90 scale-0"
            : "rotate-0 scale-100"
        }`}
      />

      <Moon
        className={`absolute h-[1.2rem] w-[1.2rem] transition-all duration-500 ${
          isDark
            ? "rotate-0 scale-100"
            : "-rotate-90 scale-0"
        }`}
      />

      <span className="sr-only">Przełącz motyw</span>
    </Button>
  );
}