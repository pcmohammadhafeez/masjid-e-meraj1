import { useEffect, useState, type ChangeEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Lock, LogOut, Save, RotateCcw, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { QuranPagesAdmin } from "@/components/site/QuranPagesAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  defaultContent,
  emptyMultilingual,
  removeAsset,
  uploadAsset,
  useContent,
  type Announcement,
  type Multilingual,
  type PrayerKey,
  type SiteContent,
} from "@/lib/content";
import { claimAdminRole } from "@/lib/admin.functions";
import { useI18n, type Lang } from "@/lib/i18n";

export const Route = createFileRoute("/admin")({
  component: Admin,
  head: () => ({
    meta: [
      { title: "Admin Panel | Masjid-e-Meraj" },
      {
        name: "description",
        content:
          "Restricted administration area for the Imam and masjid committee of Masjid-e-Meraj.",
      },
      { property: "og:title", content: "Admin Panel | Masjid-e-Meraj" },
      {
        property: "og:description",
        content: "Manage prayer timings, announcements and resources for Masjid-e-Meraj.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

const LANGS: { key: Lang; label: string }[] = [
  { key: "en", label: "English" },
  { key: "te", label: "తెలుగు" },
  { key: "ur", label: "اردو" },
];

const PRAYERS: PrayerKey[] = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha", "jumuah"];

/** Three stacked inputs (one per language) for a multilingual value. */
function MultilingualField({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: Multilingual;
  onChange: (next: Multilingual) => void;
  rows?: number;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </legend>
      {LANGS.map(({ key, label: langLabel }) => (
        <div key={key} className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">{langLabel}</Label>
          {rows ? (
            <Textarea
              dir={key === "ur" ? "rtl" : "ltr"}
              rows={rows}
              value={value[key]}
              onChange={(e) => onChange({ ...value, [key]: e.target.value })}
              className="rounded-2xl"
            />
          ) : (
            <Input
              dir={key === "ur" ? "rtl" : "ltr"}
              value={value[key]}
              onChange={(e) => onChange({ ...value, [key]: e.target.value })}
              className="rounded-full"
            />
          )}
        </div>
      ))}
    </fieldset>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-full"
      />
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="surface-card rounded-[2rem] p-7">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="gold-rule mt-4" aria-hidden="true" />
      <div className="mt-6 space-y-6">{children}</div>
    </section>
  );
}
function normalizePrayerTime(
  value: string,
  key: PrayerKey | "jumuahKhutbah",
): string {
  const input = value.trim();

  /*
   * Accept existing 24-hour database values.
   * This prevents unrelated admin changes such as Location
   * from failing because an existing prayer time is 13:30.
   */
  const twentyFourHour =
    /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(input);

  if (twentyFourHour) {
    const hour = Number(twentyFourHour[1]);
    const minute = twentyFourHour[2];

    return `${String(hour).padStart(2, "0")}:${minute}`;
  }

  /*
   * Admin input:
   *
   * Fajr       5:02
   * Sunrise    6:18
   * Dhuhr      1:30
   * Asr        5:15
   * etc.
   *
   * No AM/PM is required.
   */
  const twelveHour =
    /^([1-9]|1[0-2]):([0-5]\d)$/.exec(input);

  if (!twelveHour) {
    throw new Error(
      `Invalid time "${value}". Enter time like 5:02 or 1:30.`,
    );
  }

  let hour = Number(twelveHour[1]);
  const minute = twelveHour[2];

  /*
   * Fajr and Sunrise are AM.
   * All other prayer times are PM.
   */
  const isMorning =
    key === "fajr" ||
    key === "sunrise";

  if (isMorning) {
    if (hour === 12) {
      hour = 0;
    }
  } else {
    if (hour !== 12) {
      hour += 12;
    }
  }

  return `${String(hour).padStart(2, "0")}:${minute}`;
}
function formatAdminPrayerTime(value: string): string {
  const input = value.trim();

  const match = /^(\d{1,2}):([0-5]\d)$/.exec(input);

  if (!match) {
    return value;
  }

  const hour = Number(match[1]);
  const minute = match[2];

  const displayHour =
    hour === 0
      ? 12
      : hour > 12
        ? hour - 12
        : hour;

  return `${displayHour}:${minute}`;
}
function Admin() {
  const ADMIN_EMAIL = "committee@masjid-e-meraj.app";
  const {
    content,
    saveContent,
    resetContent,
    isAdmin,
    session,
    refreshRole,
    login,
    signUp,
    logout,
  } = useContent();
  const { t } = useI18n();
  const claimAdmin = useServerFn(claimAdminRole);

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<SiteContent>(content);

  useEffect(() => {
    setDraft(content);
  }, [content]);

  // The first committee account to sign in becomes the administrator.
  useEffect(() => {
    if (!session || isAdmin) return;
    void (async () => {
      try {
        const result = await claimAdmin();
        if (result.claimed) await refreshRole();
      } catch (err) {
        console.error("[admin] role check failed", err);
      }
    })();
  }, [session, isAdmin, claimAdmin, refreshRole]);

  const set = <K extends keyof SiteContent>(key: K, value: SiteContent[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const onSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    // Single shared committee account — the visitor only types the passcode.
    let message = await login(ADMIN_EMAIL, password);
    if (message) {
      const created = await signUp(ADMIN_EMAIL, password);
      message = created ?? (await login(ADMIN_EMAIL, password));
    }
    setBusy(false);
    if (message) {
      setError("Incorrect password");
      return;
    }
    setPassword("");
  };

  /** Uploads to cloud storage and hands back the stored path. */
  const onUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    folder: string,
    apply: (path: string, file: File, previewUrl: string) => void,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const path = await uploadAsset(folder, file);
      apply(path, file, URL.createObjectURL(file));
      toast.success("Uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      e.target.value = "";
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar transparent={false} />
        <main className="grid place-items-center px-5 py-32 sm:px-8">
          <form
            onSubmit={(e) => void onSubmitLogin(e)}
            className="glass-card w-full max-w-md rounded-[2rem] p-8"
            aria-labelledby="admin-login-title"
          >
            <span
              className="grid h-12 w-12 place-items-center rounded-2xl gradient-emerald text-primary-foreground"
              aria-hidden="true"
            >
              <Lock className="h-5 w-5" />
            </span>
            <h1 id="admin-login-title" className="mt-5 font-display text-2xl text-foreground">
              {t("admin.login")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("admin.hint")}</p>
            <div className="mt-6 space-y-4">
              <Field
                label={t("admin.password")}
                value={password}
                onChange={setPassword}
                type="password"
              />
            </div>
            {session && !error && (
              <p role="status" className="mt-4 text-sm text-muted-foreground">
                Signed in, but this account has no admin access.
              </p>
            )}
            {error && (
              <p role="alert" className="mt-4 text-sm font-medium text-destructive">
                {error}
              </p>
            )}
            <Button
              type="submit"
              variant="gold"
              className="mt-6 w-full rounded-full"
              disabled={busy}
            >
              {t("admin.signIn")}
            </Button>
            <div className="mt-4 flex flex-wrap justify-end gap-3">
              {session && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => void logout()}
                >
                  <LogOut /> {t("admin.signOut")}
                </Button>
              )}
            </div>
          </form>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar transparent={false} />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-28 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-foreground">
              Masjid-e-Meraj
            </p>
            <h1 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">
              {t("admin.title")}
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="gold"
              className="rounded-full"
              onClick={() => {
  try {
    const normalizedPrayerTimes = Object.fromEntries(
      Object.entries(draft.prayerTimes).map(([key, value]) => [
        key,
        normalizePrayerTime(value, key as PrayerKey),
      ]),
    ) as SiteContent["prayerTimes"];

    const normalizedKhutbah = normalizePrayerTime(
  draft.jumuahKhutbah,
  "jumuahKhutbah",
);

    const nextDraft: SiteContent = {
      ...draft,
      prayerTimes: normalizedPrayerTimes,
      jumuahKhutbah: normalizedKhutbah,
    };

    void saveContent(nextDraft)
      .then(() => toast.success(t("admin.saved")))
      .catch((err: unknown) =>
        toast.error(err instanceof Error ? err.message : "Save failed"),
      );
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "Invalid prayer time");
  }
}}
            >
              <Save /> {t("admin.save")}
            </Button>
            <Button
              variant="outlineGold"
              className="rounded-full"
              onClick={() => setDraft(content)}
            >
              {t("admin.cancel")}
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => {
                void resetContent()
                  .then(() => toast.success(t("admin.resetDone")))
                  .catch((err: unknown) =>
                    toast.error(err instanceof Error ? err.message : "Reset failed"),
                  );
              }}
            >
              <RotateCcw /> {t("admin.reset")}
            </Button>
            <Button variant="outline" className="rounded-full" onClick={() => void logout()}>
              <LogOut /> {t("admin.signOut")}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="times" className="mt-10">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-full p-1.5">
            <TabsTrigger value="times" className="rounded-full">
              {t("prayer.title")}
            </TabsTrigger>
            <TabsTrigger value="ann" className="rounded-full">
              {t("ann.title")}
            </TabsTrigger>
            <TabsTrigger value="about" className="rounded-full">
              {t("about.title")}
            </TabsTrigger>
            <TabsTrigger value="location" className="rounded-full">
              {t("loc.title")}
            </TabsTrigger>
            <TabsTrigger value="contact" className="rounded-full">
              {t("contact.title")}
            </TabsTrigger>
            <TabsTrigger value="resources" className="rounded-full">
              {t("res.title")}
            </TabsTrigger>
            <TabsTrigger value="branding" className="rounded-full">
              {t("admin.branding")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="times" className="mt-8">
            <Panel title={t("prayer.title")}>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {PRAYERS.map((key) => (
  <Field
    key={key}
    label={t(`prayer.${key}`)}
    value={formatAdminPrayerTime(draft.prayerTimes[key])}
    onChange={(v) =>
      set("prayerTimes", {
        ...draft.prayerTimes,
        [key]: v,
      })
    }
  />
))}
                <Field
  label="Jumu'ah Khutbah"
  value={formatAdminPrayerTime(draft.jumuahKhutbah)}
  onChange={(v) => set("jumuahKhutbah", v)}
/>
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="ann" className="mt-8">
            <Panel title={t("ann.title")}>
              <Button
                variant="outlineGold"
                className="rounded-full"
                onClick={() =>
                  set("announcements", [
                    {
                      id: `a${Date.now()}`,
                      date: "",
                      title: { ...emptyMultilingual },
                      body: { ...emptyMultilingual },
                    } satisfies Announcement,
                    ...draft.announcements,
                  ])
                }
              >
                <Plus /> {t("ann.title")}
              </Button>

              <ul className="space-y-6">
                {draft.announcements.map((item, i) => (
                  <li key={item.id} className="rounded-3xl border border-border p-6">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                      <div className="w-full max-w-xs">
                        <Field
                          label="Date / Badge"
                          value={item.date}
                          onChange={(v) => {
                            const next = [...draft.announcements];
                            next[i] = { ...item, date: v };
                            set("announcements", next);
                          }}
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full text-destructive"
                        onClick={() =>
                          set(
                            "announcements",
                            draft.announcements.filter((a) => a.id !== item.id),
                          )
                        }
                      >
                        <Trash2 /> Delete
                      </Button>
                    </div>
                    <div className="mt-5 grid gap-6 lg:grid-cols-2">
                      <MultilingualField
                        label="Title"
                        value={item.title}
                        onChange={(title) => {
                          const next = [...draft.announcements];
                          next[i] = { ...item, title };
                          set("announcements", next);
                        }}
                      />
                      <MultilingualField
                        label="Body"
                        rows={3}
                        value={item.body}
                        onChange={(body) => {
                          const next = [...draft.announcements];
                          next[i] = { ...item, body };
                          set("announcements", next);
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
          </TabsContent>

          <TabsContent value="about" className="mt-8">
            <Panel title={t("about.title")}>
              <MultilingualField
                label="Summary (home card)"
                rows={3}
                value={draft.aboutSummary}
                onChange={(v) => set("aboutSummary", v)}
              />
              <MultilingualField
                label="Full description (Read More)"
                rows={8}
                value={draft.aboutFull}
                onChange={(v) => set("aboutFull", v)}
              />
            </Panel>
          </TabsContent>

          <TabsContent value="location" className="mt-8">
            <Panel title={t("loc.title")}>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Name"
                  value={draft.location.name}
                  onChange={(v) => set("location", { ...draft.location, name: v })}
                />
                <Field
                  label="Address"
                  value={draft.location.address}
                  onChange={(v) => set("location", { ...draft.location, address: v })}
                />
                <Field
                  label="Latitude"
                  value={draft.location.latitude}
                  onChange={(v) => set("location", { ...draft.location, latitude: v })}
                />
                <Field
                  label="Longitude"
                  value={draft.location.longitude}
                  onChange={(v) => set("location", { ...draft.location, longitude: v })}
                />
                <Field
                  label="Google Maps URL"
                  value={draft.location.mapsUrl}
                  onChange={(v) => set("location", { ...draft.location, mapsUrl: v })}
                />
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="contact" className="mt-8">
            <Panel title={t("contact.title")}>
              <div className="grid gap-5 sm:grid-cols-2">
                {(
                  [
                    ["phone", t("about.phone")],
                    ["whatsapp", t("contact.whatsapp")],
                    ["email", t("about.email")],
                    ["website", t("contact.website")],
                    ["facebook", t("contact.facebook")],
                    ["instagram", t("contact.instagram")],
                    ["youtube", t("contact.youtube")],
                  ] as const
                ).map(([key, label]) => (
                  <Field
                    key={key}
                    label={label}
                    value={draft.contact[key]}
                    onChange={(v) => set("contact", { ...draft.contact, [key]: v })}
                  />
                ))}
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="resources" className="mt-8 space-y-6">
            <Panel title={t("res.quran")}>
              <QuranPagesAdmin />
            </Panel>

            <Panel title={t("res.verse")}>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Reference"
                  value={draft.dailyVerse.reference}
                  onChange={(v) => set("dailyVerse", { ...draft.dailyVerse, reference: v })}
                />
                <Field
                  label="Arabic"
                  value={draft.dailyVerse.arabic}
                  onChange={(v) => set("dailyVerse", { ...draft.dailyVerse, arabic: v })}
                />
              </div>
              <MultilingualField
                label="Translation"
                rows={3}
                value={draft.dailyVerse.translation}
                onChange={(translation) => set("dailyVerse", { ...draft.dailyVerse, translation })}
              />
            </Panel>

            <Panel title={t("res.hadith")}>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Source"
                  value={draft.dailyHadith.source}
                  onChange={(v) => set("dailyHadith", { ...draft.dailyHadith, source: v })}
                />
                <Field
                  label="Arabic"
                  value={draft.dailyHadith.arabic}
                  onChange={(v) => set("dailyHadith", { ...draft.dailyHadith, arabic: v })}
                />
              </div>
              <MultilingualField
                label="Text"
                rows={3}
                value={draft.dailyHadith.text}
                onChange={(text) => set("dailyHadith", { ...draft.dailyHadith, text })}
              />
            </Panel>

            <Panel title={t("res.basics")}>
              <ul className="space-y-6">
                {draft.basics.map((topic, i) => (
                  <li key={topic.id} className="grid gap-6 rounded-3xl border border-border p-6 lg:grid-cols-2">
                    <MultilingualField
                      label="Title"
                      value={topic.title}
                      onChange={(title) => {
                        const next = [...draft.basics];
                        next[i] = { ...topic, title };
                        set("basics", next);
                      }}
                    />
                    <MultilingualField
                      label="Body"
                      rows={3}
                      value={topic.body}
                      onChange={(body) => {
                        const next = [...draft.basics];
                        next[i] = { ...topic, body };
                        set("basics", next);
                      }}
                    />
                  </li>
                ))}
              </ul>
            </Panel>
          </TabsContent>

          <TabsContent value="branding" className="mt-8">
            <Panel title={t("admin.branding")}>
              <div className="grid gap-8 sm:grid-cols-2">
                <div className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {t("admin.logo")}
                  </p>
                  {draft.logoUrl && (
                    <img
                      src={draft.logoUrl}
                      alt="Current logo preview"
                      className="h-20 w-20 rounded-2xl object-cover"
                    />
                  )}
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outlineGold" size="sm" className="rounded-full" asChild>
                      <label className="cursor-pointer">
                        <Upload /> Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) =>
                            void onUpload(e, "branding", (path, _file, preview) =>
                              setDraft((d) => ({ ...d, logoPath: path, logoUrl: preview })),
                            )
                          }
                        />
                      </label>
                    </Button>
                    {draft.logoUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={() => setDraft((d) => ({ ...d, logoPath: "", logoUrl: "" }))}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {t("admin.hero")}
                  </p>
                  {draft.heroImageUrl && (
                    <img
                      src={draft.heroImageUrl}
                      alt="Current hero background preview"
                      className="h-28 w-full rounded-2xl object-cover"
                    />
                  )}
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outlineGold" size="sm" className="rounded-full" asChild>
                      <label className="cursor-pointer">
                        <Upload /> Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) =>
                            void onUpload(e, "branding", (path, _file, preview) =>
                              setDraft((d) => ({ ...d, heroPath: path, heroImageUrl: preview })),
                            )
                          }
                        />
                      </label>
                    </Button>
                    {draft.heroImageUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={() => setDraft((d) => ({ ...d, heroPath: "", heroImageUrl: "" }))}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Panel>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
