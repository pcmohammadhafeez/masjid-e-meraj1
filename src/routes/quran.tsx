import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { QuranReader } from "@/components/site/QuranReader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/quran")({
  component: QuranPage,
  head: () => ({
    meta: [
      { title: "Read Holy Quran — Masjid-e-Meraj" },
      {
        name: "description",
        content:
          "Read the Holy Quran online at Masjid-e-Meraj with an embedded reader — page navigation, zoom, fit width, fullscreen, search and download.",
      },
      { property: "og:title", content: "Read Holy Quran | القرآن الكريم" },
      {
        property: "og:description",
        content: "Embedded Quran reader with paging, zoom, fullscreen, search and download.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function QuranPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar transparent={false} />
      <main className="gradient-sand pb-10 pt-20 sm:pt-24">
        <div className="mx-auto max-w-3xl px-3 sm:px-8">
          <div className="mb-4">
            <Button variant="outlineGold" size="sm" className="rounded-full" asChild>
              <Link to="/">
                <ArrowLeft /> Home
              </Link>
            </Button>
          </div>
          <QuranReader />
        </div>
      </main>
      <Footer />
    </div>
  );
}