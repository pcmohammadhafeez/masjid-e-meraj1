import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ThemeToggle({ light = false }: { light?: boolean }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/50 transition-all duration-300 hover:bg-gold/15 hover:shadow-[var(--shadow-soft)] active:scale-95",
        light ? "text-white" : "text-gold",
      )}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}