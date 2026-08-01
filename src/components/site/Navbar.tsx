import { useEffect, useState } from "react";
import { Menu, X, Moon } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { useI18n } from "@/lib/i18n";

export function Navbar({ transparent = true }: { transparent?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
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
        solid ? "glass-card rounded-none border-x-0 border-t-0 py-2" : "py-4",
      )}
    >
      <nav className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 sm:px-8 lg:grid-cols-[auto_1fr_auto]">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <span
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl gradient-emerald text-primary-foreground"
            aria-hidden="true"
          >
            <Moon className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span
              className={cn(
                "block truncate font-display text-lg font-semibold leading-tight transition-colors",
                solid ? "text-foreground" : "text-white drop-shadow-sm",
              )}
            >
              Masjid-e-Meraj
            </span>
            <span className="block font-arabic text-sm leading-tight text-gold">مسجد معراج</span>
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

        <div className="flex items-center justify-end gap-2">
          <LanguageSwitcher light={!solid} />
          <ThemeToggle light={!solid} />
          <Button variant="gold" size="lg" className="hidden rounded-full lg:inline-flex" asChild>
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
              "grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/40 transition-colors lg:hidden",
              solid ? "text-foreground" : "text-white",
            )}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="mx-4 mt-3 rounded-3xl glass-card p-4 lg:hidden">
          <ul className="grid gap-1">
            {links.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
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
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
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