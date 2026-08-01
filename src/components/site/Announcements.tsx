import { Megaphone } from "lucide-react";

import { Reveal, SectionHeading } from "@/components/site/Reveal";
import { useContent } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

export function Announcements() {
  const { content } = useContent();
  const { t } = useI18n();

  return (
    <section id="announcements" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          arabic="إعلانات المسجد"
          eyebrow={t("ann.eyebrow")}
          title={t("ann.title")}
          description={t("ann.desc")}
        />

        {content.announcements.length === 0 ? (
          <Reveal className="mt-12 text-center">
            <p className="text-muted-foreground">{t("ann.empty")}</p>
          </Reveal>
        ) : (
          <ul className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {content.announcements.map((item, i) => (
              <Reveal as="li" key={item.id} delay={i * 90}>
                <article className="surface-card h-full rounded-3xl p-7">
                  <div className="flex items-center gap-3">
                    <span
                      className="grid h-11 w-11 place-items-center rounded-2xl gradient-emerald text-primary-foreground"
                      aria-hidden="true"
                    >
                      <Megaphone className="h-5 w-5" />
                    </span>
                    <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-gold-foreground">
                      {item.date}
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-foreground">{item.title}</h3>
                  <div className="gold-rule mt-4" aria-hidden="true" />
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </article>
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}