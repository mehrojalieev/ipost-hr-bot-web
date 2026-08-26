"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const current =
      (document.documentElement.getAttribute("data-theme") as Theme) || "light";
    setTheme(current);
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* ignore */
    }
    // Telegram Mini App fon rangini ham moslash
    try {
      const wa = (
        window as unknown as {
          Telegram?: { WebApp?: { setBackgroundColor?: (c: string) => void } };
        }
      ).Telegram?.WebApp;
      wa?.setBackgroundColor?.(next === "dark" ? "#0a1020" : "#f1f5fb");
    } catch {
      /* ignore */
    }
    setTheme(next);
  }

  return (
    <button
      onClick={toggle}
      aria-label="Mavzuni almashtirish"
      className="ml-auto h-9 w-9 grid place-items-center rounded-xl bg-white/15 ring-1 ring-white/20 text-white hover:bg-white/25 transition-colors"
    >
      {mounted && theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
