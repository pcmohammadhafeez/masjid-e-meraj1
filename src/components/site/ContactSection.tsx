import { Phone, MessageCircle, Mail, Globe, Facebook, Instagram, Youtube } from "lucide-react";

import { Reveal, SectionHeading } from "@/components/site/Reveal";
import { useContent } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

export function ContactSection() {
  const { content } = useContent();
  const { t } = useI18n();
  const c = content.contact;

  const rows = [
    { label: t("about.phone"), value: c.phone, href: `tel:${c.phone.replace(/\s/g, "")}`, Icon: Phone },
    {
      label: t("contact.whatsapp"),
      value: c.whatsapp,
      href: `https://wa.me/${c.whatsapp.replace(/[^\d]/g, "")}`,
      Icon: MessageCircle,
    },
    { label: t("about.email"), value: c.email, href: `mailto:${c.email}`, Icon: Mail },
    { label: t("contact.website"), value: c.website, href: c.website, Icon: Globe },
  ];

  const socials = [
    { label: t("contact.facebook"), href: c.facebook, Icon: Facebook },
    { label: t("contact.instagram"), href: c.instagram, Icon: Instagram },
    { label: t("contact.youtube"), href: c.youtube, Icon: Youtube },
  ];

  return (
    <section id="contact" className="scroll-mt-24 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          arabic="اتصل بنا"
          eyebrow={t("contact.eyebrow")}
          title={t("contact.title")}
          description={t("contact.desc")}
        />

        <Reveal delay={90}>
          <div className="mt-10 grid gap-6 rounded-[2rem] glass-card p-7 lg:grid-cols-[1.4fr_1fr]">
            <ul className="grid gap-5 sm:grid-cols-2">
              {rows
                .filter((r) => r.value)
                .map(({ label, value, href, Icon }) => (
                  <li key={label} className="flex min-w-0 gap-4">
                    <span
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gold/15 text-gold"
                      aria-hidden="true"
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[0.68rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                        {label}
                      </span>
                      <a
                        href={href}
                        className="mt-1 block truncate text-sm font-semibold text-foreground transition-colors hover:text-gold"
                      >
                        {value}
                      </a>
                    </span>
                  </li>
                ))}
            </ul>

            <div>
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                {t("contact.social")}
              </p>
              <div className="mt-4 flex gap-3">
                {socials
                  .filter((s) => s.href)
                  .map(({ label, href, Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={label}
                      className="grid h-11 w-11 place-items-center rounded-full gradient-gold text-gold-foreground shadow-[var(--shadow-soft)] transition-transform duration-300 hover:-translate-y-0.5 hover:scale-105"
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </a>
                  ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
