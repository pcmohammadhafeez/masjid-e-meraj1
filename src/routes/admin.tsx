import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, Plus, Save, Trash2, Upload, X, LogOut } from "lucide-react";
import { toast } from "sonner";

import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useContent, type PrayerKey, type SiteContent } from "@/lib/content";
import { useI18n, languages, type Lang } from "@/lib/i18n";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Admin Panel | Masjid-e-Meraj" },
      {
        name: "description",
        content:
          "Restricted admin panel for the Imam and masjid administration to update prayer times, announcements and resources.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Admin Panel | Masjid-e-Meraj" },
      { property: "og:description", content: "Restricted masjid administration area." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const prayerKeys: PrayerKey[] = [
  "fajr",
  "sunrise",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
  "jumuah",
];

function AdminPage() {
  const { isAdmin } = useContent();
  return (
    <div className="min-h-screen bg-background">
      <Navbar transparent={false} />
      <main className="pt-28 pb-20">{isAdmin ? <AdminEditor /> : <LoginCard />}</main>
      <Footer />
    </div>
  );
}

function LoginCard() {
  const { login } = useContent();
  const { t } = useI18n();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  return (
    <div className="mx-auto max-w-md px-5 py-16 sm:px-8">
      <div className="rounded-[2.5rem] glass-card p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl gradient-emerald text-primary-foreground">
          <Lock className="h-6 w-6" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-semibold text-foreground">
          {t("admin.login")}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">{t("admin.hint")}</p>
        <div className="gold-rule mt-6" aria-hidden="true" />
        <form
          className="mt-6 space-y-4 text-left"
          onSubmit={(e) => {
            e.preventDefault();
            if (login(password)) {
              toast.success(t("admin.login"));
            } else {
              setError(true);
            }
          }}
        >
          <div>
            <Label htmlFor="admin-password">{t("admin.password")}</Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className="mt-2 rounded-2xl"
            />
          </div>
          {error && <p className="text-sm text-destructive">{t("admin.wrong")}</p>}
          <Button type="submit" variant="gold" className="w-full rounded-full">
            {t("admin.signIn")}
          </Button>
        </form>
      </div>
    </div>
  );
}

function AdminEditor() {
  const { content, saveContent, logout } = useContent();
  const { t } = useI18n();
  const [draft, setDraft] = useState<SiteContent>(content);

  useEffect(() => setDraft(content), [content]);

  const update = (patch: Partial<SiteContent>) => setDraft((d) => ({ ...d, ...patch }));

  const onSave = () => {
    saveContent(draft);
    toast.success(t("admin.saved"));
  };

  const onPdfUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      setDraft((d) => ({ ...d, quranPdfUrl: url, quranPdfName: file.name }));
      toast.success(file.name);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
            Masjid-e-Meraj
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-foreground">
            {t("admin.title")}
          </h1>
        </div>
        <Button variant="outlineGold" className="rounded-full" onClick={logout}>
          <LogOut /> {t("admin.signOut")}
        </Button>
      </div>
      <div className="gold-rule mt-6" aria-hidden="true" />

      <Tabs defaultValue="prayer" className="mt-8">
        <TabsList className="flex h-auto flex-wrap rounded-2xl">
          <TabsTrigger value="prayer" className="rounded-xl">
            {t("nav.prayerTimes")}
          </TabsTrigger>
          <TabsTrigger value="announcements" className="rounded-xl">
            {t("nav.announcements")}
          </TabsTrigger>
          <TabsTrigger value="about" className="rounded-xl">
            {t("nav.about")}
          </TabsTrigger>
          <TabsTrigger value="resources" className="rounded-xl">
            {t("nav.resources")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prayer" className="mt-6">
          <Card title={t("prayer.title")}>
            <div className="grid gap-4 sm:grid-cols-3">
              {prayerKeys.map((key) => (
                <div key={key}>
                  <Label htmlFor={`t-${key}`}>{t(`prayer.${key}`)}</Label>
                  <Input
                    id={`t-${key}`}
                    type="time"
                    value={draft.prayerTimes[key]}
                    onChange={(e) =>
                      update({ prayerTimes: { ...draft.prayerTimes, [key]: e.target.value } })
                    }
                    className="mt-2 rounded-2xl"
                  />
                </div>
              ))}
              <div>
                <Label htmlFor="t-khutbah">Jumu'ah Khutbah</Label>
                <Input
                  id="t-khutbah"
                  type="time"
                  value={draft.jumuahKhutbah}
                  onChange={(e) => update({ jumuahKhutbah: e.target.value })}
                  className="mt-2 rounded-2xl"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="announcements" className="mt-6">
          <Card title={t("ann.title")}>
            <ul className="space-y-5">
              {draft.announcements.map((item, i) => (
                <li key={item.id} className="rounded-3xl border border-border p-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor={`ann-title-${item.id}`}>Title</Label>
                      <Input
                        id={`ann-title-${item.id}`}
                        value={item.title}
                        onChange={(e) => {
                          const next = [...draft.announcements];
                          next[i] = { ...item, title: e.target.value };
                          update({ announcements: next });
                        }}
                        className="mt-2 rounded-2xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`ann-date-${item.id}`}>Date / Schedule</Label>
                      <Input
                        id={`ann-date-${item.id}`}
                        value={item.date}
                        onChange={(e) => {
                          const next = [...draft.announcements];
                          next[i] = { ...item, date: e.target.value };
                          update({ announcements: next });
                        }}
                        className="mt-2 rounded-2xl"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor={`ann-body-${item.id}`}>Message</Label>
                    <Textarea
                      id={`ann-body-${item.id}`}
                      value={item.body}
                      rows={3}
                      onChange={(e) => {
                        const next = [...draft.announcements];
                        next[i] = { ...item, body: e.target.value };
                        update({ announcements: next });
                      }}
                      className="mt-2 rounded-2xl"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-4 rounded-full text-destructive"
                    onClick={() =>
                      update({ announcements: draft.announcements.filter((a) => a.id !== item.id) })
                    }
                  >
                    <Trash2 /> Remove
                  </Button>
                </li>
              ))}
            </ul>
            <Button
              variant="outlineGold"
              className="mt-5 rounded-full"
              onClick={() =>
                update({
                  announcements: [
                    ...draft.announcements,
                    {
                      id: `a${Date.now()}`,
                      title: "New announcement",
                      body: "",
                      date: "Today",
                    },
                  ],
                })
              }
            >
              <Plus /> Add announcement
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="mt-6 space-y-6">
          <Card title={t("about.title")}>
            <Label htmlFor="about-text">About Masjid</Label>
            <Textarea
              id="about-text"
              rows={5}
              value={draft.about}
              onChange={(e) => update({ about: e.target.value })}
              className="mt-2 rounded-2xl"
            />
          </Card>
          <Card title={t("about.contact")}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="c-address">{t("about.address")}</Label>
                <Input
                  id="c-address"
                  value={draft.contact.address}
                  onChange={(e) =>
                    update({ contact: { ...draft.contact, address: e.target.value } })
                  }
                  className="mt-2 rounded-2xl"
                />
              </div>
              <div>
                <Label htmlFor="c-phone">{t("about.phone")}</Label>
                <Input
                  id="c-phone"
                  value={draft.contact.phone}
                  onChange={(e) => update({ contact: { ...draft.contact, phone: e.target.value } })}
                  className="mt-2 rounded-2xl"
                />
              </div>
              <div>
                <Label htmlFor="c-email">{t("about.email")}</Label>
                <Input
                  id="c-email"
                  type="email"
                  value={draft.contact.email}
                  onChange={(e) => update({ contact: { ...draft.contact, email: e.target.value } })}
                  className="mt-2 rounded-2xl"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="c-maps">Google Maps link</Label>
                <Input
                  id="c-maps"
                  value={draft.mapsLink}
                  onChange={(e) => update({ mapsLink: e.target.value })}
                  className="mt-2 rounded-2xl"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="mt-6 space-y-6">
          <Card title={t("res.quran")}>
            <div className="flex flex-wrap items-center gap-4">
              <Label
                htmlFor="quran-pdf"
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-gold-foreground"
              >
                <Upload className="h-4 w-4" /> Upload Quran PDF
              </Label>
              <input
                id="quran-pdf"
                type="file"
                accept="application/pdf"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onPdfUpload(file);
                }}
              />
              <span className="text-sm text-muted-foreground">
                {draft.quranPdfName || "No PDF selected"}
              </span>
            </div>
          </Card>

          <Card title={t("res.verse")}>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="v-ref">Reference</Label>
                <Input
                  id="v-ref"
                  value={draft.dailyVerse.reference}
                  onChange={(e) =>
                    update({ dailyVerse: { ...draft.dailyVerse, reference: e.target.value } })
                  }
                  className="mt-2 rounded-2xl"
                />
              </div>
              <div>
                <Label htmlFor="v-ar">Arabic</Label>
                <Textarea
                  id="v-ar"
                  rows={2}
                  dir="rtl"
                  value={draft.dailyVerse.arabic}
                  onChange={(e) =>
                    update({ dailyVerse: { ...draft.dailyVerse, arabic: e.target.value } })
                  }
                  className="mt-2 rounded-2xl font-arabic text-xl"
                />
              </div>
              {languages.map((l) => (
                <div key={l.code}>
                  <Label htmlFor={`v-${l.code}`}>Translation · {l.native}</Label>
                  <Textarea
                    id={`v-${l.code}`}
                    rows={2}
                    dir={l.code === "ur" ? "rtl" : "ltr"}
                    value={draft.dailyVerse.translation[l.code as Lang]}
                    onChange={(e) =>
                      update({
                        dailyVerse: {
                          ...draft.dailyVerse,
                          translation: {
                            ...draft.dailyVerse.translation,
                            [l.code]: e.target.value,
                          },
                        },
                      })
                    }
                    className="mt-2 rounded-2xl"
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card title={t("res.hadith")}>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="h-src">Source</Label>
                <Input
                  id="h-src"
                  value={draft.dailyHadith.source}
                  onChange={(e) =>
                    update({ dailyHadith: { ...draft.dailyHadith, source: e.target.value } })
                  }
                  className="mt-2 rounded-2xl"
                />
              </div>
              {languages.map((l) => (
                <div key={l.code}>
                  <Label htmlFor={`h-${l.code}`}>{l.native}</Label>
                  <Textarea
                    id={`h-${l.code}`}
                    rows={2}
                    dir={l.code === "ur" ? "rtl" : "ltr"}
                    value={draft.dailyHadith.text[l.code as Lang]}
                    onChange={(e) =>
                      update({
                        dailyHadith: {
                          ...draft.dailyHadith,
                          text: { ...draft.dailyHadith.text, [l.code]: e.target.value },
                        },
                      })
                    }
                    className="mt-2 rounded-2xl"
                  />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="sticky bottom-4 mt-8 flex flex-wrap justify-end gap-3 rounded-3xl glass-card p-4">
        <Button variant="ghost" className="rounded-full" onClick={() => setDraft(content)}>
          <X /> {t("admin.cancel")}
        </Button>
        <Button variant="gold" className="rounded-full" onClick={onSave}>
          <Save /> {t("admin.save")}
        </Button>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[2rem] surface-card p-7">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="gold-rule mt-4 mb-6" aria-hidden="true" />
      {children}
    </section>
  );
}