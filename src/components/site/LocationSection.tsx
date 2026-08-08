import {
  ExternalLink,
  MapPin,
  Navigation,
  Sparkles,
} from "lucide-react";

import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

export function LocationSection() {
  const { content } = useContent();
  const { t } = useI18n();

  const {
    name,
    address,
    latitude,
    longitude,
    mapsUrl,
  } = content.location;

  const lat = Number(latitude);
  const lng = Number(longitude);

  const coords = `${lat},${lng}`;

  const embed =
    `https://www.google.com/maps?q=${encodeURIComponent(coords)}` +
    `&z=15&output=embed`;

  const directions =
    `https://www.google.com/maps/dir/?api=1&destination=` +
    `${encodeURIComponent(coords)}`;

  const openMap =
    mapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      coords,
    )}`;

  return (
    <Reveal as="article" className="h-full" delay={180}>
      <section
        id="location"
        aria-labelledby="location-title"
        className="
          group relative h-full overflow-hidden scroll-mt-24
          rounded-[2rem] surface-card p-6
          transition-all duration-700
          hover:-translate-y-1 hover:shadow-lift
          sm:rounded-[2.5rem] sm:p-7
        "
      >
        {/* Ambient gold glow */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute -right-20 -top-20
            h-44 w-44 rounded-full
            bg-gold/10 blur-3xl
            transition-all duration-1000
            group-hover:scale-125
            group-hover:bg-gold/15
          "
        />

        {/* Ambient emerald glow */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute -bottom-24 -left-20
            h-48 w-48 rounded-full
            bg-emerald-deep/20 blur-3xl
            transition-transform duration-1000
            group-hover:scale-125
          "
        />

        <div className="relative">
          {/* Header */}
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="
                grid h-11 w-11 shrink-0 place-items-center
                rounded-2xl gradient-emerald on-emerald
                shadow-[0_0_22px_color-mix(in_oklab,var(--color-gold)_10%,transparent)]
                transition-all duration-500
                group-hover:scale-110
                group-hover:rotate-[-4deg]
                group-hover:shadow-[0_0_28px_color-mix(in_oklab,var(--color-gold)_18%,transparent)]
              "
              aria-hidden="true"
            >
              <MapPin className="h-5 w-5 icon-soft-pulse" />
            </span>

            <div className="min-w-0">
              <h2
                id="location-title"
                className="
                  truncate text-sm font-bold uppercase
                  tracking-[0.22em] text-gold
                  transition-colors duration-500
                  group-hover:text-gold-light
                "
              >
                {t("loc.title")}
              </h2>

              <div
                className="
                  mt-1 flex items-center gap-1.5
                  text-[0.62rem] uppercase
                  tracking-[0.18em]
                  text-muted-foreground
                "
              >
                <Sparkles className="h-3 w-3 text-gold" />
                <span>Masjid Location</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div
            className="
              gold-rule mt-5
              transition-all duration-700
              group-hover:opacity-80
            "
            aria-hidden="true"
          />

          {/* Address */}
          <div className="mt-5">
            <p
              className="
                font-display text-lg font-bold text-foreground
                transition-colors duration-300
                group-hover:text-gold
              "
            >
              {name}
            </p>

            <p className="mt-1 text-sm leading-relaxed text-foreground/80">
              {address}
            </p>
          </div>

          {/* Google Maps */}
          <div
            className="
              relative mt-5 overflow-hidden rounded-2xl
              border border-gold/30
              bg-secondary
              shadow-[var(--shadow-soft)]
              transition-all duration-700
              group-hover:border-gold/45
              group-hover:shadow-lift
            "
          >
            <div
              aria-hidden="true"
              className="
                pointer-events-none absolute inset-x-0 top-0 z-10
                h-8
                bg-gradient-to-b
                from-emerald-deep/20
                to-transparent
              "
            />

            <iframe
              src={embed}
              title={`${name} on Google Maps`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="
                h-48 w-full
                grayscale-[8%]
                transition-all duration-1000
                group-hover:grayscale-0
                sm:h-52
              "
            />
          </div>

          {/* Buttons */}
          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              variant="gold"
              size="sm"
              className="
                press rounded-full
                transition-all duration-500
                hover:-translate-y-0.5
              "
              asChild
            >
              <a
                href={openMap}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                {t("about.openMap")}
              </a>
            </Button>

            <Button
              variant="outlineGold"
              size="sm"
              className="
                press rounded-full
                transition-all duration-500
                hover:-translate-y-0.5
              "
              asChild
            >
              <a
                href={directions}
                target="_blank"
                rel="noreferrer"
              >
                <Navigation className="h-4 w-4" />
                {t("loc.directions")}
              </a>
            </Button>
          </div>

          {/* Coordinates */}
          <p
            className="
              mt-4 text-center
              text-[0.62rem]
              tracking-[0.12em]
              text-muted-foreground/70
            "
          >
            {lat.toFixed(4)}° N&nbsp;&nbsp;•&nbsp;&nbsp;
            {lng.toFixed(4)}° E
          </p>
        </div>
      </section>
    </Reveal>
  );
}