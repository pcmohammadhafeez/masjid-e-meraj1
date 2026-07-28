import { createFileRoute } from "@tanstack/react-router";
import {
  Sunrise,
  Sun,
  CloudSun,
  Sunset,
  Moon,
  Star,
  BookOpen,
  HandHeart,
  Users,
  CalendarDays,
  Clock,
  MapPin,
  Quote,
  ArrowRight,
} from "lucide-react";

import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Reveal, SectionHeading } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import heroMosque from "@/assets/hero-mosque.jpg";
import aboutMosque from "@/assets/about-mosque.jpg";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";
import gallery5 from "@/assets/gallery-5.jpg";
import gallery6 from "@/assets/gallery-6.jpg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Masjid-e-Meraj | Prayer Times, Quran Classes & Community" },
      {
        name: "description",
        content:
          "Masjid-e-Meraj is a place of worship, peace, learning and community. View daily prayer times, Quran classes, events and gallery.",
      },
      { property: "og:title", content: "Masjid-e-Meraj | A Place of Worship & Community" },
      {
        property: "og:description",
        content:
          "Daily prayer times, Quran classes, community services and events at Masjid-e-Meraj.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const prayers = [
  { name: "Fajr", arabic: "الفجر", time: "5:12", meridiem: "AM", jamaah: "5:30 AM", Icon: Sunrise },
  { name: "Dhuhr", arabic: "الظهر", time: "1:05", meridiem: "PM", jamaah: "1:30 PM", Icon: Sun },
  { name: "Asr", arabic: "العصر", time: "4:45", meridiem: "PM", jamaah: "5:00 PM", Icon: CloudSun },
  {
    name: "Maghrib",
    arabic: "المغرب",
    time: "6:52",
    meridiem: "PM",
    jamaah: "6:57 PM",
    Icon: Sunset,
  },
  { name: "Isha", arabic: "العشاء", time: "8:15", meridiem: "PM", jamaah: "8:30 PM", Icon: Moon },
  {
    name: "Jumu'ah",
    arabic: "الجمعة",
    time: "1:15",
    meridiem: "PM",
    jamaah: "1:45 PM",
    Icon: Star,
  },
];

const features = [
  {
    title: "Daily Prayers",
    description:
      "Five daily congregational prayers led by our imam, with a spacious hall for brothers and sisters.",
    Icon: Clock,
  },
  {
    title: "Quran Classes",
    description:
      "Tajweed, hifz and tafsir circles for children and adults, taught by qualified teachers.",
    Icon: BookOpen,
  },
  {
    title: "Community Services",
    description:
      "Food drives, counselling, nikah services and youth programmes serving our neighbourhood.",
    Icon: HandHeart,
  },
];

const events = [
  {
    date: "12",
    month: "Aug",
    title: "Weekly Tafsir Circle",
    time: "After Isha · 9:00 PM",
    place: "Main Prayer Hall",
    description:
      "A reflective study of Surah Al-Kahf with our resident scholar. Open to all ages, tea served afterwards.",
  },
  {
    date: "19",
    month: "Aug",
    title: "Youth Halaqa & Sports",
    time: "Saturday · 4:00 PM",
    place: "Community Centre",
    description:
      "A relaxed evening of learning, mentoring and friendly football for our young community members.",
  },
  {
    date: "26",
    month: "Aug",
    title: "Community Iftar Dinner",
    time: "Sunday · 7:00 PM",
    place: "Masjid Courtyard",
    description:
      "Sharing a meal with neighbours and guests. Volunteers welcome — please register at the front desk.",
  },
];

const galleryImages = [
  { src: gallery1, alt: "Golden dome ceiling with geometric Islamic patterns"},
  { src: gallery2, alt: "Open Quran resting on a wooden stand" },
  { src: gallery3, alt: "Marble mosque courtyard with fountain and arches" },
  { src: gallery6, alt: "Emerald and gold Islamic mosaic tilework" },
  { src: gallery4, alt: "Community gathering sharing a meal inside the mosque"},
  { src: gallery5, alt: "Minaret with golden crescent against a blue sky" },
];

const testimonials = [
  {
    quote:
      "The peace I feel walking into Masjid-e-Meraj is unmatched. It has become a second home for my family.",
    name: "Ahmed Raza",
    role: "Community Member",
  },
  {
    quote:
      "My children look forward to their Quran classes every week. The teachers are patient and truly caring.",
    name: "Fatima Siddiqui",
    role: "Parent",
  },
  {
    quote:
      "From food drives to youth programmes, this masjid serves everyone in the neighbourhood with dignity.",
    name: "Yusuf Khan",
    role: "Volunteer",
  },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero */}
        <section id="home" className="relative flex min-h-screen items-center overflow-hidden">
          <img
            src={heroMosque}
            alt="Silhouette of a mosque with domes and minarets at dusk"
            width={1920}
            height={1088}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.24_0.05_163/0.82),oklch(0.2_0.04_163/0.6)_45%,oklch(0.18_0.03_163/0.9))]"
            aria-hidden="true"
          />
          <div className="relative mx-auto w-full max-w-4xl px-5 py-32 text-center sm:px-8">
            <Reveal>
              <p className="font-arabic text-3xl text-gold sm:text-4xl">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
            </Reveal>
            <Reveal delay={120}>
              <div className="gold-rule mx-auto mt-6 w-40" aria-hidden="true" />
            </Reveal>
            <Reveal delay={180}>
              <h1 className="mt-8 font-display text-4xl font-semibold leading-[1.1] text-white sm:text-6xl lg:text-7xl">
                Welcome to <span className="text-gold-gradient">Masjid-e-Meraj</span>
              </h1>
            </Reveal>
            <Reveal delay={280}>
              <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
                A place of worship, peace, learning, and community.
              </p>
            </Reveal>
            <Reveal delay={380}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Button variant="gold" size="xl" asChild>
                  <a href="#prayer-times">
                    View Prayer Times <ArrowRight />
                  </a>
                </Button>
                <Button
                  variant="outlineGold"
                  size="xl"
                  className="rounded-full border-white/40 text-white hover:bg-white/10"
                  asChild
                >
                  <a href="#about">About the Masjid</a>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Prayer times */}
        <section id="prayer-times" className="scroll-mt-24 gradient-sand py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHeading
              arabic="أوقات الصلاة"
              eyebrow="Today's Timetable"
              title="Prayer Times"
              description="Adhan and jama'ah timings are updated daily. Please arrive a few minutes early to make your rows straight."
            />
            <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {prayers.map((prayer, i) => (
                <Reveal as="li" key={prayer.name} delay={i * 80}>
                  <div className="surface-card group h-full rounded-3xl p-7">
                    <div className="flex items-start justify-between gap-4">
                      <span
                        className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-secondary text-primary transition-colors group-hover:gradient-emerald group-hover:text-primary-foreground"
                        aria-hidden="true"
                      >
                        <prayer.Icon className="h-5 w-5" />
                      </span>
                      <span className="font-arabic text-2xl text-gold">{prayer.arabic}</span>
                    </div>
                    <h3 className="mt-6 text-2xl font-semibold text-foreground">{prayer.name}</h3>
                    <p className="mt-2 font-display text-4xl font-semibold text-primary">
                      {prayer.time}
                      <span className="ml-2 text-lg text-muted-foreground">{prayer.meridiem}</span>
                    </p>
                    <div className="gold-rule mt-6" aria-hidden="true" />
                    <p className="mt-4 text-sm text-muted-foreground">
                      Jama'ah <span className="font-medium text-foreground">{prayer.jamaah}</span>
                    </p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* About */}
        <section id="about" className="scroll-mt-24 py-20 sm:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <div className="relative">
                <div
                  className="absolute -left-4 -top-4 h-32 w-32 rounded-full bg-gold/20 blur-2xl"
                  aria-hidden="true"
                />
                <img
                  src={aboutMosque}
                  alt="Bright marble prayer hall with arches and golden chandeliers"
                  loading="lazy"
                  width={1200}
                  height={900}
                  className="relative aspect-4/3 w-full rounded-[2.5rem] object-cover shadow-[var(--shadow-lift)]"
                />
                <div className="absolute -bottom-8 left-6 right-6 rounded-3xl glass-card p-5 text-center sm:left-10 sm:right-auto sm:w-64 sm:text-left">
                  <p className="font-display text-3xl font-semibold text-primary">Since 1978</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Serving our community for over four decades
                  </p>
                </div>
              </div>
            </Reveal>

            <div>
              <SectionHeading
                align="left"
                arabic="عن المسجد"
                eyebrow="Our Masjid"
                title="A house of remembrance and belonging"
                description="Masjid-e-Meraj opens its doors to worshippers, students and neighbours alike. Our halls host the five daily prayers, weekly Jumu'ah khutbah, Quran and Arabic classes, and services that support families across the city."
              />
              <ul className="mt-10 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {features.map((feature, i) => (
                  <Reveal as="li" key={feature.title} delay={i * 100}>
                    <div className="surface-card h-full rounded-3xl p-6">
                      <span
                        className="grid h-11 w-11 place-items-center rounded-2xl gradient-emerald text-primary-foreground"
                        aria-hidden="true"
                      >
                        <feature.Icon className="h-5 w-5" />
                      </span>
                      <h3 className="mt-5 text-lg font-semibold text-foreground">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Quran */}
        <section id="quran" className="scroll-mt-24 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <Reveal>
              <div className="relative overflow-hidden rounded-[2.5rem] gradient-emerald px-6 py-16 text-center sm:px-16">
                <div
                  className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gold/20 blur-3xl"
                  aria-hidden="true"
                />
                <div
                  className="absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-gold/10 blur-3xl"
                  aria-hidden="true"
                />
                <div className="relative mx-auto max-w-3xl">
                  <BookOpen className="mx-auto h-8 w-8 text-gold" aria-hidden="true" />
                  <p className="mt-8 font-arabic text-2xl leading-loose text-white sm:text-4xl">
                    وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ
                  </p>
                  <div className="gold-rule mx-auto mt-8 w-32" aria-hidden="true" />
                  <p className="mt-8 font-display text-xl italic text-white/85 sm:text-2xl">
                    "And We have certainly made the Quran easy for remembrance, so is there any who
                    will remember?"
                  </p>
                  <p className="mt-3 text-sm uppercase tracking-[0.3em] text-gold">
                    Surah Al-Qamar · 54:17
                  </p>
                  <Button variant="gold" size="xl" className="mt-10" asChild>
                    <a href="#events">
                      Join Quran Classes <ArrowRight />
                    </a>
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Events */}
        <section id="events" className="scroll-mt-24 gradient-sand py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHeading
              arabic="الفعاليات"
              eyebrow="What's On"
              title="Upcoming Events"
              description="Gatherings, classes and community programmes hosted at the masjid this month."
            />
            <ul className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event, i) => (
                <Reveal as="li" key={event.title} delay={i * 100}>
                  <article className="surface-card flex h-full flex-col rounded-3xl p-7">
                    <div className="flex items-center gap-4">
                      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl gradient-emerald text-primary-foreground">
                        <span className="font-display text-2xl font-semibold leading-none">
                          {event.date}
                        </span>
                        <span className="text-[0.65rem] uppercase tracking-[0.2em]">
                          {event.month}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold text-foreground">
                          {event.title}
                        </h3>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CalendarDays className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                          {event.time}
                        </p>
                      </div>
                    </div>
                    <p className="mt-6 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {event.description}
                    </p>
                    <div className="gold-rule mt-6" aria-hidden="true" />
                    <p className="mt-4 flex items-center gap-2 text-sm text-foreground">
                      <MapPin className="h-4 w-4 text-gold" aria-hidden="true" />
                      {event.place}
                    </p>
                  </article>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* Gallery */}
        <section id="gallery" className="scroll-mt-24 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHeading
              arabic="معرض الصور"
              eyebrow="Moments"
              title="Gallery"
              description="Glimpses of our masjid, its architecture and the community that fills it with life."
            />
            <div className="mt-14 grid auto-rows-[220px] gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {galleryImages.map((image, i) => (
                <Reveal
                  key={image.alt}
                  delay={i * 70}
                  className={`group relative overflow-hidden rounded-3xl shadow-[var(--shadow-soft)] `}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                    width={900}
                    height={900}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,oklch(0.2_0.04_163/0.75))] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="gradient-sand py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHeading
              arabic="آراء المجتمع"
              eyebrow="Voices"
              title="From Our Community"
            />
            <ul className="mt-14 grid gap-6 md:grid-cols-3">
              {testimonials.map((testimonial, i) => (
                <Reveal as="li" key={testimonial.name} delay={i * 100}>
                  <figure className="surface-card flex h-full flex-col rounded-3xl p-8">
                    <Quote className="h-7 w-7 text-gold" aria-hidden="true" />
                    <blockquote className="mt-5 flex-1 font-display text-xl leading-relaxed text-foreground">
                      "{testimonial.quote}"
                    </blockquote>
                    <figcaption className="mt-7 flex items-center gap-3">
                      <span
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-full gradient-emerald text-sm font-semibold text-primary-foreground"
                        aria-hidden="true"
                      >
                        {testimonial.name.charAt(0)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-foreground">
                          {testimonial.name}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {testimonial.role}
                        </span>
                      </span>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </ul>
            <Reveal delay={200} className="mt-14 text-center">
              <p className="inline-flex items-center gap-2 rounded-full glass-card px-6 py-3 text-sm text-muted-foreground">
                <Users className="h-4 w-4 text-gold" aria-hidden="true" />
                Over 1,200 worshippers join us every Jumu'ah
              </p>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
