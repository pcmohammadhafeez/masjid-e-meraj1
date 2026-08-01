import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useContent } from "@/lib/content";
import heroMosque from "@/assets/hero-mosque.jpg";

export function Hero() {
  const { t } = useI18n();
  const { content } = useContent();

  return (
    <section
      id="home"
      className="relative flex min-h-[88vh] items-center overflow-hidden sm:min-h-screen"
    >
      <img
        src={content.heroImageUrl || heroMosque}
        alt="Silhouette of a mosque with domes and minarets at dusk"
        width={1920}
        height={1088}
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.24_0.05_163/0.82),oklch(0.2_0.04_163/0.6)_45%,oklch(0.18_0.03_163/0.9))]"
        aria-hidden="true"
      />
      <div className="relative mx-auto w-full max-w-4xl px-5 py-24 text-center sm:px-8 sm:py-32">
        <Reveal>
          <h1 className="font-display text-4xl font-semibold leading-[1.1] text-white sm:text-6xl lg:text-7xl">
            <span className="text-gold-gradient">Masjid-e-Meraj</span>
          </h1>
        </Reveal>
        <Reveal delay={120}>
          <p className="mt-4 font-arabic text-3xl text-gold sm:text-4xl">مسجد معراج</p>
        </Reveal>
        <Reveal delay={200}>
          <div className="gold-rule mx-auto mt-8 w-40" aria-hidden="true" />
        </Reveal>
        <Reveal delay={280}>
          <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
            {t("hero.subtitle")}
          </p>
        </Reveal>
        <Reveal delay={380}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button variant="gold" size="xl" asChild>
              <Link to="/" hash="prayer-times">
                {t("hero.cta")} <ArrowRight />
              </Link>
            </Button>
            <Button
              variant="outlineGold"
              size="xl"
              className="rounded-full border-white/40 text-white hover:bg-white/10"
              asChild
            >
              <Link to="/resources">{t("hero.cta2")}</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}