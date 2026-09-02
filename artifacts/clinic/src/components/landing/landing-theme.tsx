import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Moon, Sun } from "lucide-react";

type LandingTheme = "dark" | "light";

const STORAGE_KEY = "zyad-theme";

const LandingThemeContext = createContext<{
  theme: LandingTheme;
  toggle: () => void;
}>({ theme: "dark", toggle: () => {} });

export function LandingThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<LandingTheme>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage unavailable */
    }
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <LandingThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </LandingThemeContext.Provider>
  );
}

export function useLandingTheme() {
  return useContext(LandingThemeContext);
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useLandingTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن"}
      title={isDark ? "الوضع الفاتح" : "الوضع الداكن"}
      className={`group relative h-9 w-[68px] shrink-0 cursor-pointer overflow-hidden rounded-full border transition-all duration-300 ${
        isDark
          ? "border-white/[0.09] bg-black/40 shadow-[inset_0_1px_5px_rgba(0,0,0,0.5)] hover:border-cyan-400/35"
          : "border-slate-200/90 bg-slate-100 shadow-[inset_0_1px_5px_rgba(15,40,80,0.1)] hover:border-[#0068E2]/40"
      } ${className}`}
    >
      <Sun
        className={`absolute right-[9px] top-1/2 h-4 w-4 -translate-y-1/2 transition-all duration-500 ${
          isDark ? "scale-75 text-slate-500 opacity-60" : "scale-110 text-amber-500 opacity-100"
        }`}
      />
      <Moon
        className={`absolute left-[9px] top-1/2 h-4 w-4 -translate-y-1/2 transition-all duration-500 ${
          isDark ? "scale-110 text-cyan-300 opacity-100" : "scale-75 text-slate-400 opacity-60"
        }`}
      />
      <span
        className={`absolute top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isDark
            ? "left-1 bg-gradient-to-br from-[#0b162e] to-[#0068E2] shadow-[0_0_16px_rgba(0,104,226,0.6),0_2px_6px_rgba(0,0,0,0.5)]"
            : "right-1 bg-gradient-to-br from-amber-300 to-orange-500 shadow-[0_0_14px_rgba(251,146,60,0.5),0_2px_6px_rgba(0,0,0,0.25)] group-hover:rotate-12"
        }`}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5 text-cyan-200" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-white" />
        )}
      </span>
    </button>
  );
}
