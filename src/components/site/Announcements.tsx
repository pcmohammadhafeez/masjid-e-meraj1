import { Megaphone } from "lucide-react";

import { Reveal } from "@/components/site/Reveal";
import { useContent } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

export function Announcements() {
  const { content } = useContent();
  const { t } = useI18n();

  return (
    <Reveal as="article" className="h-full">
      <div id="announcements" className="surface-card h-full scroll-mt-24 rounded-[2rem] p-7">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl gradient-emerald text-primary-foreground"
            aria-hidden="true"
          >
            <Megaphone className="h-5 w-5" />
          </span>
          <h2 className="truncate text-sm font-semibold uppercase tracking-[0.25em] text-foreground">
            {t("ann.title")}
          </h2>
        </div>
        <div className="gold-rule mt-5" aria-hidden="true" />

        {content.announcements.length === 0 ? (
          <p className="mt-5 text-sm text-muted-foreground">{t("ann.empty")}</p>
        ) : (
          <ul className="mt-5 space-y-5">
            {content.announcements.slice(0, 3).map((item) => (
              <li key={item.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                  <span className="rounded-full bg-gold/15 px-3 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold-foreground">
                    {item.date}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-6 font-arabic text-lg text-gold">جزاك الله خيرا</p>
      </div>
    </Reveal>
  );
}
