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
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-secondary text-primary"
                      aria-hidden="true"
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {label}
                      </span>
                      <a
                        href={href}
                        className="mt-1 block truncate text-sm text-foreground transition-colors hover:text-primary"
                      >
                        {value}
                      </a>
                    </span>
                  </li>
                ))}
            </ul>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
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
                      className="grid h-11 w-11 place-items-center rounded-full bg-gold text-gold-foreground transition-transform hover:scale-105"
                    >
                      <Icon className="h-4 w-4" />
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
