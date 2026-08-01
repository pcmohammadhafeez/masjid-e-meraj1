import { createFileRoute } from "@tanstack/react-router";

import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { PrayerTimes } from "@/components/site/PrayerTimes";
import { Announcements } from "@/components/site/Announcements";
import { AboutSection } from "@/components/site/AboutSection";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Masjid-e-Meraj | Prayer Times & Masjid Announcements" },
      {
        name: "description",
        content:
          "Masjid-e-Meraj is a place of worship, peace, learning and community. Daily prayer times in 24-hour format, Hijri date, live clock and masjid announcements.",
      },
      { property: "og:title", content: "Masjid-e-Meraj | A Place of Worship & Community" },
      {
        property: "og:description",
        content:
          "Daily prayer times, masjid announcements, about and contact details for Masjid-e-Meraj.",
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
        <Announcements />
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
}
