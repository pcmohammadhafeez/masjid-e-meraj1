import { BookOpen } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";

export function ReadQuranSection() {
  return (
    <Reveal delay={80}>
      <div className="mt-5 rounded-[2rem] glass-card p-5 text-center sm:rounded-[2.5rem] sm:p-7">
        <div className="flex items-center justify-center gap-3">
          <span
            className="icon-chip grid h-9 w-9 shrink-0 place-items-center rounded-xl text-gold"
            aria-hidden="true"
          >
            <BookOpen className="h-4 w-4" />
          </span>
          <h2 className="text-gold-shimmer font-display text-xl font-bold tracking-tight sm:text-2xl">
            Read Holy Quran
          </h2>
        </div>
        <p className="mt-1.5 font-arabic text-lg text-foreground/85 sm:text-xl">القرآن الكريم</p>
        <p className="mt-2 text-sm text-muted-foreground">Read the Holy Quran anytime.</p>
        <div className="mt-4 flex justify-center">
          <Button variant="gold" size="lg" className="btn-quran rounded-full" asChild>
            <Link to="/quran">📖 Read Quran</Link>
          </Button>
        </div>
      </div>
    </Reveal>
  );
}
