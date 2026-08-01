import { Globe, Check } from "lucide-react";
import { languages, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher({ light = false }: { light?: boolean }) {
  const { lang, setLang } = useI18n();
  const current = languages.find((l) => l.code === lang);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Change language"
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-full border border-gold/40 px-2.5 text-xs font-semibold transition-colors hover:bg-gold/15",
          light ? "text-white" : "text-foreground",
        )}
      >
        <Globe className="h-3.5 w-3.5 shrink-0" />
        <span className="max-w-[6ch] truncate text-gold">{current?.native}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-2xl">
        {languages.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => setLang(l.code)}
            className={cn(
              "cursor-pointer gap-2 rounded-xl",
              l.code === lang && "bg-accent font-semibold text-primary",
            )}
          >
            <span className="flex-1">{l.native}</span>
            {l.code === lang && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}