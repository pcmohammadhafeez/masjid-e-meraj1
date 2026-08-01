import { Facebook, Instagram, Youtube, Twitter, MapPin, Phone, Mail, Moon } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { useContent } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

const socials = [
  { label: "Facebook", Icon: Facebook },
  { label: "Instagram", Icon: Instagram },
  { label: "YouTube", Icon: Youtube },
  { label: "X", Icon: Twitter },
];

export function Footer() {
  const { content } = useContent();
  const { t } = useI18n();

  return (
    <footer id="contact" className="gradient-emerald text-primary-foreground">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
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
              {t("footer.visit")}
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-primary-foreground/80">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>{content.contact.address}</span>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>{content.contact.phone}</span>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>{content.contact.email}</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">
              {t("footer.explore")}
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-primary-foreground/80">
              <li>
                <Link to="/" className="transition-colors hover:text-gold">
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link to="/" hash="prayer-times" className="transition-colors hover:text-gold">
                  {t("nav.prayerTimes")}
                </Link>
              </li>
              <li>
                <Link to="/" hash="announcements" className="transition-colors hover:text-gold">
                  {t("nav.announcements")}
                </Link>
              </li>
              <li>
                <Link to="/resources" className="transition-colors hover:text-gold">
                  {t("nav.resources")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">Follow</h3>
            <div className="mt-5 flex gap-3">
              {socials.map(({ label, Icon }) => (
                <a
                  key={label}
                  href="#home"
                  aria-label={label}
                  className="grid h-11 w-11 place-items-center rounded-full border border-primary-foreground/25 transition-colors hover:border-gold hover:bg-gold hover:text-gold-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <p className="mt-6 font-arabic text-lg text-gold">السلام عليكم ورحمة الله</p>
          </div>
        </div>

        <div className="gold-rule mt-14" aria-hidden="true" />
        <p className="mt-6 text-center text-xs text-primary-foreground/65">
          © {new Date().getFullYear()} Masjid-e-Meraj. {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}