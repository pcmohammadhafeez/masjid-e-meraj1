import { Reveal } from "@/components/site/Reveal";
import { useI18n } from "@/lib/i18n";
import { useContent } from "@/lib/content";
import heroMosque from "@/assets/hero-mosque.jpg";

export function Hero() {
  const { t } = useI18n();
  const { content } = useContent();

  return (
    <section id="home" className="relative overflow-hidden">
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
      <div className="relative mx-auto w-full max-w-3xl px-5 py-12 text-center sm:px-8 sm:py-16">
        <Reveal>
          <h1 className="font-display text-3xl font-semibold leading-[1.15] sm:text-5xl">
            <span className="text-gold-shimmer">Masjid-e-Meraj</span>
          </h1>
        </Reveal>
        <Reveal delay={100}>
          <p className="mt-2 font-arabic text-2xl text-gold drop-shadow-[0_0_16px_oklch(0.8_0.12_85/0.4)] sm:text-3xl">
            مسجد معراج
          </p>
        </Reveal>
        <Reveal delay={160}>
          <div className="gold-rule mx-auto mt-5 w-32" aria-hidden="true" />
        </Reveal>
        <Reveal delay={220}>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-white/85 sm:text-base">
            {t("hero.subtitle")}
          </p>
        </Reveal>
      </div>
    </section>
  );
}