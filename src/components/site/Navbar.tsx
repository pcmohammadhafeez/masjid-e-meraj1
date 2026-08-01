import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { useI18n } from "@/lib/i18n";
import { useContent } from "@/lib/content";

export function Navbar({ transparent = true }: { transparent?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  const { content } = useContent();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: t("nav.home"), to: "/" },
    { label: t("nav.resources"), to: "/resources" },
  ];
  const solid = scrolled || !transparent;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        solid ? "glass-card rounded-none border-x-0 border-t-0 py-2" : "py-3",
      )}
    >
      <nav className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2.5 px-3 sm:gap-4 sm:px-8 lg:grid-cols-[auto_1fr_auto]">
        <Link to="/" className="flex min-w-0 items-center gap-2.5 rounded-2xl sm:gap-3">
          {content.logoUrl ? (
            <img
              src={content.logoUrl}
              alt="Masjid-e-Meraj logo"
              className="h-9 w-9 shrink-0 rounded-xl object-cover ring-1 ring-gold/40 sm:h-10 sm:w-10"
            />
          ) : null}
          <span className="leading-none">
            <span
              className={cn(
                "block whitespace-nowrap font-display text-[0.94rem] font-bold leading-tight tracking-tight sm:text-[1.05rem]",
                solid ? "text-brand-shimmer-dark" : "text-brand-shimmer",
              )}
            >
              Masjid-e-Meraj
            </span>
            <span
              className="mt-1 block h-px w-full bg-gradient-to-r from-gold via-gold/60 to-transparent"
              aria-hidden="true"
            />
            <span className="mt-1 block whitespace-nowrap font-arabic text-[0.68rem] leading-tight text-gold sm:text-xs">
              مسجد معراج
            </span>
          </span>
        </Link>

        <ul className="hidden justify-center gap-8 lg:flex">
          {links.map((link) => (
            <li key={link.label}>
              <Link
                to={link.to}
                className={cn(
                  "relative text-sm font-medium tracking-wide transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-gold after:transition-transform after:duration-300 hover:after:origin-left hover:after:scale-x-100",
                  solid ? "text-foreground hover:text-primary" : "text-white/90 hover:text-white",
                  pathname === link.to && "after:origin-left after:scale-x-100",
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-end gap-1.5 sm:gap-2.5">
          <LanguageSwitcher light={!solid} />
          <ThemeToggle light={!solid} />
          <Button variant="gold" size="default" className="hidden lg:inline-flex" asChild>
            <Link to="/" hash="prayer-times">
              {t("nav.prayerTimes")}
            </Link>
          </Button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/50 transition-all duration-300 hover:bg-gold/15 active:scale-95 lg:hidden",
              solid ? "text-foreground" : "text-white",
            )}
          >
            {open ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="animate-in fade-in slide-in-from-top-2 mx-4 mt-3 rounded-3xl glass-card p-3 duration-300 lg:hidden">
          <ul className="grid gap-1">
            {links.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-2xl px-4 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent",
                    pathname === link.to && "bg-accent text-primary",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/"
                hash="prayer-times"
                onClick={() => setOpen(false)}
                className="block rounded-2xl px-4 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
              >
                {t("nav.prayerTimes")}
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}