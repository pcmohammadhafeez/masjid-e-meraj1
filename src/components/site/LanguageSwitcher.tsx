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
          "inline-flex h-11 items-center gap-2 rounded-full border border-gold/40 px-3 text-sm font-medium transition-colors hover:bg-gold/15",
          light ? "text-white" : "text-foreground",
        )}
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{current?.native}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-2xl">
        {languages.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => setLang(l.code)}
            className="cursor-pointer gap-2 rounded-xl"
          >
            <span className="flex-1">{l.native}</span>
            {l.code === lang && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}