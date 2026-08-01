import { Facebook, Instagram, Youtube, MapPin, Phone, Mail, Moon, Lock } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { useContent } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { content } = useContent();
  const { t } = useI18n();
  const c = content.contact;

  const socials = [
    { label: "Facebook", href: c.facebook, Icon: Facebook },
    { label: "Instagram", href: c.instagram, Icon: Instagram },
    { label: "YouTube", href: c.youtube, Icon: Youtube },
  ].filter((s) => s.href);

  return (
    <footer className="bg-footer on-emerald">
      <div className="gold-rule" aria-hidden="true" />
      <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8 sm:py-12">
        <div className="flex flex-col items-center gap-8 text-center sm:flex-row sm:items-start sm:justify-between sm:text-start">
          <div className="flex items-center gap-3.5">
            {content.logoUrl ? (
              <img
                src={content.logoUrl}
                alt="Masjid-e-Meraj logo"
                className="h-12 w-12 shrink-0 rounded-2xl object-cover ring-1 ring-gold/40"
              />
            ) : (
              <span
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl gradient-gold text-gold-foreground"
                aria-hidden="true"
              >
                <Moon className="h-5.5 w-5.5" />
              </span>
            )}
            <div className="min-w-0">
              <p className="font-display text-xl font-bold tracking-wide text-gold">
                Masjid-e-Meraj
              </p>
              <p className="font-arabic text-base leading-snug text-ink">مسجد معراج</p>
            </div>
          </div>

          <ul className="grid gap-3.5 text-sm leading-relaxed text-ink">
            <li className="flex items-start justify-center gap-3 sm:justify-start">
              <MapPin className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gold" aria-hidden="true" />
              <span className="max-w-xs">{content.location.address}</span>
            </li>
            <li className="flex items-start justify-center gap-3 sm:justify-start">
              <Phone className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gold" aria-hidden="true" />
              <a
                href={`tel:${c.phone.replace(/\s/g, "")}`}
                className="rounded-sm transition-colors hover:text-gold"
              >
                {c.phone}
              </a>
            </li>
            <li className="flex items-start justify-center gap-3 sm:justify-start">
              <Mail className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gold" aria-hidden="true" />
              <a
                href={`mailto:${c.email}`}
                className="rounded-sm transition-colors hover:text-gold"
              >
                {c.email}
              </a>
            </li>
          </ul>

          {socials.length > 0 && (
            <div className="flex gap-3">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid h-11 w-11 place-items-center rounded-full border border-gold/45 bg-white/5 text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-gold hover:bg-gold hover:text-gold-foreground"
                >
                  <Icon className="h-4.5 w-4.5" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="mt-9 h-px bg-gold/20" aria-hidden="true" />
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-xs tracking-wide text-ink-muted">
          <p>
            © {new Date().getFullYear()} Masjid-e-Meraj. {t("footer.rights")}
          </p>
          {/* Discreet admin entry point */}
          <Link
            to="/admin"
            aria-label={t("admin.login")}
            className="opacity-40 transition-opacity hover:opacity-100"
          >
            <Lock className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
