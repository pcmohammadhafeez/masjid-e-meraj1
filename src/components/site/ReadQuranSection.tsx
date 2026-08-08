import { BookOpen, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";

export function ReadQuranSection() {
  return (
    <Reveal delay={80}>
      <section
        aria-labelledby="quran-section-title"
        className="group relative overflow-hidden rounded-[2rem] glass-card p-5 text-center transition-all duration-700 hover:-translate-y-1 hover:shadow-lift sm:rounded-[2.5rem] sm:p-7"
      >
        {/* Ambient light */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 h-40 w-40 rounded-full bg-gold/10 blur-3xl transition-all duration-1000 group-hover:scale-125 group-hover:bg-gold/15"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-16 h-40 w-40 rounded-full bg-emerald-deep/20 blur-3xl transition-all duration-1000 group-hover:scale-125"
        />

        {/* Subtle moving light */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-xl transition-transform duration-[1800ms] ease-out group-hover:translate-x-[520%]"
        />

        <div className="relative">
          {/* Heading */}
          <div className="flex items-center justify-center gap-3">
            <span
              className="
                icon-chip grid h-10 w-10 shrink-0 place-items-center
                rounded-2xl text-gold
                shadow-[0_0_20px_color-mix(in_oklab,var(--color-gold)_12%,transparent)]
                transition-all duration-500
                group-hover:scale-110
                group-hover:rotate-[-4deg]
                group-hover:shadow-[0_0_28px_color-mix(in_oklab,var(--color-gold)_20%,transparent)]
              "
              aria-hidden="true"
            >
              <BookOpen className="h-4.5 w-4.5 icon-breathe" />
            </span>

            <h2
              id="quran-section-title"
              className="text-gold-shimmer font-display text-xl font-bold tracking-tight sm:text-2xl"
            >
              Read Holy Quran
            </h2>
          </div>

          {/* Arabic title */}
          <p className="mt-2 font-arabic text-xl text-gold/90 transition-all duration-500 group-hover:text-gold sm:text-2xl">
            القرآن الكريم
          </p>

          {/* Description */}
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            Read the Holy Quran anytime.
          </p>

          {/* CTA */}
          <div className="mt-5 flex justify-center">
            <Button
              variant="gold"
              size="lg"
              className="
                btn-quran press rounded-full
                px-6
                shadow-[0_10px_30px_-12px_color-mix(in_oklab,var(--color-gold)_70%,transparent)]
                transition-all duration-500
                hover:-translate-y-0.5
                hover:shadow-[0_16px_34px_-12px_color-mix(in_oklab,var(--color-gold)_75%,transparent)]
              "
              asChild
            >
              <Link
                to="/quran"
                className="group/button inline-flex items-center gap-2"
              >
                <BookOpen
                  className="h-4 w-4 transition-transform duration-500 group-hover/button:scale-110"
                  aria-hidden="true"
                />

                <span>Read Quran</span>

                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover/button:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </Button>
          </div>

          {/* Small premium detail */}
          <div className="mt-4 flex items-center justify-center gap-2 text-[0.62rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            <Sparkles
              className="h-3 w-3 text-gold"
              aria-hidden="true"
            />

            <span>Quran Majeed</span>

            <Sparkles
              className="h-3 w-3 text-gold"
              aria-hidden="true"
            />
          </div>
        </div>
      </section>
    </Reveal>
  );
}