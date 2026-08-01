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
    <footer className="gradient-emerald text-primary-foreground">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gold text-gold-foreground"
                aria-hidden="true"
              >
                <Moon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="font-display text-xl font-semibold">Masjid-e-Meraj</p>
                <p className="font-arabic text-sm text-gold">مسجد معراج</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-primary-foreground/75">
              {t("footer.tagline")}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">
              {t("footer.quick")}
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-primary-foreground/80">
              <li>
                <Link to="/" hash="prayer-times" className="transition-colors hover:text-gold">
                  {t("nav.prayerTimes")}
                </Link>
              </li>
              <li>
                <Link to="/resources" className="transition-colors hover:text-gold">
                  {t("nav.resources")}
                </Link>
              </li>
              <li>
                <Link to="/" hash="location" className="transition-colors hover:text-gold">
                  {t("loc.title")}
                </Link>
              </li>
              <li>
                <Link to="/" hash="contact" className="transition-colors hover:text-gold">
                  {t("contact.title")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">
              {t("footer.visit")}
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-primary-foreground/80">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>{content.location.address}</span>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>{c.phone}</span>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>{c.email}</span>
              </li>
            </ul>
            {socials.length > 0 && (
              <div className="mt-5 flex gap-3">
                {socials.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="grid h-10 w-10 place-items-center rounded-full border border-primary-foreground/25 transition-colors hover:border-gold hover:bg-gold hover:text-gold-foreground"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="gold-rule mt-12" aria-hidden="true" />
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-primary-foreground/65">
          <p>
            © {new Date().getFullYear()} Masjid-e-Meraj. {t("footer.rights")}
          </p>
          {/* Discreet admin entry point */}
          <Link
            to="/admin"
            aria-label={t("admin.login")}
            className="opacity-30 transition-opacity hover:opacity-100"
          >
            <Lock className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
