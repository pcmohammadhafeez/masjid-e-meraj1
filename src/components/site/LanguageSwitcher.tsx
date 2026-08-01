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
          "inline-flex h-10 items-center gap-1.5 rounded-full border border-gold/50 px-3 text-xs font-semibold transition-all duration-300 hover:bg-gold/15 active:scale-95",
          light ? "text-white" : "text-foreground",
        )}
      >
        <Globe className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
        <span className="max-w-[7ch] truncate">{current?.native}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40 rounded-2xl p-1.5">
        {languages.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => setLang(l.code)}
            className={cn(
              "cursor-pointer gap-2 rounded-xl px-3 py-2.5 text-sm text-foreground",
              l.code === lang && "bg-gold/15 font-bold text-primary",
            )}
          >
            <span className="flex-1">{l.native}</span>
            {l.code === lang && <Check className="h-4 w-4 text-gold" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}