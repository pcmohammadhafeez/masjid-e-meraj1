import { createFileRoute } from "@tanstack/react-router";

import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { PrayerTimes } from "@/components/site/PrayerTimes";
import { Announcements } from "@/components/site/Announcements";
import { AboutSection } from "@/components/site/AboutSection";
import { LocationSection } from "@/components/site/LocationSection";
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
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <PrayerTimes />
        <section className="py-10 sm:py-14">
          <div className="mx-auto grid max-w-7xl gap-6 px-5 sm:px-8 lg:grid-cols-3">
            <Announcements />
            <AboutSection />
            <LocationSection />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
