import { MapPin, Phone, Mail, ExternalLink } from "lucide-react";

import { Reveal, SectionHeading } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import aboutMosque from "@/assets/about-mosque.jpg";

export function AboutSection() {
  const { content } = useContent();
  const { t } = useI18n();

  return (
    <section id="about" className="scroll-mt-24 gradient-sand py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl items-start gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <div className="relative">
            <div
              className="absolute -left-4 -top-4 h-32 w-32 rounded-full bg-gold/20 blur-2xl"
              aria-hidden="true"
            />
            <img
              src={aboutMosque}
              alt="Bright marble prayer hall with arches and golden chandeliers"
              loading="lazy"
              width={1200}
              height={900}
              className="relative aspect-4/3 w-full rounded-[2.5rem] object-cover shadow-[var(--shadow-lift)]"
            />
          </div>

          <div className="mt-8 rounded-3xl glass-card p-7">
            <h3 className="text-lg font-semibold text-foreground">{t("about.map")}</h3>
            <div
              className="mt-4 grid aspect-video place-items-center rounded-2xl border border-dashed border-gold/50 bg-secondary/60 text-center"
              aria-label="Google Maps placeholder"
            >
              <div className="px-6">
                <MapPin className="mx-auto h-8 w-8 text-primary" />
                <p className="mt-3 text-sm text-muted-foreground">{content.contact.address}</p>
              </div>
            </div>
            <Button variant="outlineGold" className="mt-5 rounded-full" asChild>
              <a href={content.mapsLink} target="_blank" rel="noreferrer">
                {t("about.openMap")} <ExternalLink />
              </a>
            </Button>
          </div>
        </Reveal>

        <div>
          <SectionHeading
            align="left"
            arabic="عن المسجد"
            eyebrow={t("about.eyebrow")}
            title={t("about.title")}
            description={content.about}
          />

          <Reveal delay={120}>
            <div className="mt-10 rounded-3xl surface-card p-7">
              <h3 className="text-lg font-semibold text-foreground">{t("about.contact")}</h3>
              <div className="gold-rule mt-4" aria-hidden="true" />
              <ul className="mt-6 space-y-5 text-sm">
                {[
                  { label: t("about.address"), value: content.contact.address, Icon: MapPin },
                  { label: t("about.phone"), value: content.contact.phone, Icon: Phone },
                  { label: t("about.email"), value: content.contact.email, Icon: Mail },
                ].map(({ label, value, Icon }) => (
                  <li key={label} className="flex gap-4">
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-secondary text-primary"
                      aria-hidden="true"
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {label}
                      </span>
                      <span className="mt-1 block text-foreground">{value}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}