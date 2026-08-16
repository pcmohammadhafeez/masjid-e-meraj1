import { Link } from "@tanstack/react-router";
import { Compass, ArrowRight, Navigation } from "lucide-react";
export function QiblaFinderCard() {
  return (
    <section className="mx-3 mt-6 overflow-hidden rounded-[28px] border border-gold/25 bg-gradient-to-br from-[#092319] via-[#071b13] to-[#03120c] p-5 shadow-[0_18px_50px_rgba(0,0,0,.22)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold/10 ring-1 ring-gold/20">
            <Compass className="h-6 w-6 text-gold" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-gold/80">
              QIBLA DIRECTION
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold text-white">
              Find Qibla
            </h2>
          </div>
        </div>
        <Navigation className="mt-1 h-5 w-5 text-gold/40" />
      </div>
      <div className="mt-5 rounded-2xl border border-white/5 bg-white/[0.035] px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-gold/10">
            <span className="text-lg">🕋</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white/90">
              Qibla Finder
            </p>
            <p className="mt-0.5 text-xs leading-5 text-white/50">
              Use your phone compass to find the direction of the Kaaba.
            </p>
          </div>
        </div>
      </div>
      <Link
        to="/qibla"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#e8c867] to-[#c79f3d] px-5 py-3.5 text-sm font-bold text-[#10150f] shadow-[0_8px_24px_rgba(199,159,61,.18)] transition-all duration-300 hover:brightness-105 active:scale-[.98]"
      >
        <Compass className="h-4 w-4" />
        Open Qibla Finder
        <ArrowRight className="h-4 w-4" />
      </Link>
      <p className="mt-3 text-center text-[10px] tracking-wide text-white/35">
        NO GPS REQUIRED • USES YOUR DEVICE COMPASS
      </p>
    </section>
  );
}
