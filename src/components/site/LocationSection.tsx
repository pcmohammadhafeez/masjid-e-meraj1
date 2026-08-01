import { MapPin, Navigation, ExternalLink } from "lucide-react";

import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

export function LocationSection() {
  const { content } = useContent();
  const { t } = useI18n();
  const { name, address, latitude, longitude, mapsUrl } = content.location;

  const coords = `${latitude},${longitude}`;
  const embed = `https://www.google.com/maps?q=${encodeURIComponent(coords)}&z=15&output=embed`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(coords)}`;

  return (
    <Reveal as="article" className="h-full" delay={180}>
      <div id="location" className="surface-card h-full scroll-mt-24 rounded-[2rem] p-6 sm:p-7">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl gradient-emerald on-emerald"
            aria-hidden="true"
          >
            <MapPin className="h-5 w-5" />
          </span>
          <h2 className="truncate text-sm font-bold uppercase tracking-[0.22em] text-gold">
            {t("loc.title")}
          </h2>
        </div>
        <div className="gold-rule mt-5" aria-hidden="true" />

        <p className="mt-5 font-display text-lg font-bold text-foreground">{name}</p>
        <p className="mt-1 text-sm leading-relaxed text-foreground/80">{address}</p>

        <div className="mt-5 overflow-hidden rounded-2xl border border-gold/30 shadow-[var(--shadow-soft)]">
          <iframe
            src={embed}
            title={`${name} on Google Maps`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-48 w-full"
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="gold" size="sm" asChild>
            <a href={mapsUrl || embed} target="_blank" rel="noreferrer">
              <ExternalLink /> {t("about.openMap")}
            </a>
          </Button>
          <Button variant="outlineGold" size="sm" asChild>
            <a href={directions} target="_blank" rel="noreferrer">
              <Navigation /> {t("loc.directions")}
            </a>
          </Button>
        </div>
      </div>
    </Reveal>
  );
}
