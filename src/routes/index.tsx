import { createFileRoute } from "@tanstack/react-router";

import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { PrayerTimes } from "@/components/site/PrayerTimes";
import { LocationSection } from "@/components/site/LocationSection";
import { ReadQuranSection } from "@/components/site/ReadQuranSection";
import { QiblaFinderCard } from "@/components/site/QiblaFinderCard";
import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Masjid-e-Meraj | Prayer Times, Announcements & Location" },
      {
        name: "description",
        content:
          "Masjid-e-Meraj — a place of worship, peace, learning and community. Today's prayer timetable in 24-hour format, Hijri date, live clock, announcements and masjid location.",
      },
      { property: "og:title", content: "Masjid-e-Meraj | مسجد معراج" },
      {
        property: "og:description",
        content:
          "Daily prayer timetable, masjid announcements, about, location and contact details for Masjid-e-Meraj.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Index() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background">
      <Navbar transparent={false} />
      <main>
        <PrayerTimes />
        <section className="gradient-sand pb-8 sm:pb-12">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <ReadQuranSection />

        <QiblaFinderCard />
            <div className="mt-5">
              <LocationSection />
            </div>
            <Reveal delay={120}>
              <div className="mt-5 flex justify-center">
                <Button
                  variant="gold"
                  size="lg"
                  className="rounded-full transition-transform duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
                  asChild
                >
                  <Link to="/resources">
                    {t("hero.cta2")} <ArrowRight />
                  </Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

