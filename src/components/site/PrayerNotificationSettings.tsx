import { useEffect, useState } from "react";
import { Bell, BellOff, Check, X } from "lucide-react";

const STORAGE_KEY = "masjid-e-meraj-notification-settings";

export type PrayerNotificationSettings = {
  enabled: Record<string, boolean>;
  minutesBefore: number;
};

const DEFAULT_SETTINGS: PrayerNotificationSettings = {
  enabled: {
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
  },
  minutesBefore: 5,
};

function loadSettings(): PrayerNotificationSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return DEFAULT_SETTINGS;
    }

    const parsed = JSON.parse(saved);

    return {
      enabled: {
        ...DEFAULT_SETTINGS.enabled,
        ...(parsed.enabled ?? {}),
      },
      minutesBefore:
        Number(parsed.minutesBefore) >= 1
          ? Number(parsed.minutesBefore)
          : 5,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function PrayerNotificationSettings({
  prayerKey,
  prayerLabel,
}: {
  prayerKey: string;
  prayerLabel: string;
}) {
  const [open, setOpen] = useState(false);

  const [settings, setSettings] =
    useState<PrayerNotificationSettings>(
      DEFAULT_SETTINGS,
    );

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const isEnabled =
    settings.enabled[prayerKey] ?? false;

  function togglePrayer() {
    const next = {
      ...settings,
      enabled: {
        ...settings.enabled,
        [prayerKey]: !isEnabled,
      },
    };

    setSettings(next);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(next),
    );
  }

  function saveSettings() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(settings),
    );

    setOpen(false);
  }

  function requestNotificationPermission() {
    if (!("Notification" in window)) {
      return;
    }

    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }

  function handleOpen() {
    requestNotificationPermission();
    setSettings(loadSettings());
    setOpen(true);
  }

  return (
    <>
      {/* Small notification button */}
      <button
        type="button"
        onClick={handleOpen}
        aria-label={`Notification settings for ${prayerLabel}`}
        title={`Notification settings for ${prayerLabel}`}
        className={`
          grid h-8 w-8 shrink-0 place-items-center
          rounded-full
          transition-all duration-300
          active:scale-90
          ${
            isEnabled
              ? "bg-gold/15 text-gold shadow-[0_0_14px_color-mix(in_oklab,var(--color-gold)_18%,transparent)]"
              : "text-muted-foreground hover:bg-gold/10 hover:text-gold"
          }
        `}
      >
        {isEnabled ? (
          <Bell className="h-3.5 w-3.5" />
        ) : (
          <BellOff className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Settings popup */}
      {open && (
        <div
          className="
            fixed inset-0 z-[120]
            flex items-end justify-center
            bg-black/40 p-3
            backdrop-blur-sm
            sm:items-center
          "
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${prayerLabel} notification settings`}
            className="
              w-full max-w-sm
              overflow-hidden
              rounded-[1.75rem]
              border border-gold/25
              bg-background
              p-5
              shadow-[0_25px_80px_-20px_rgba(0,0,0,0.7)]
              animate-in
              slide-in-from-bottom-5
              fade-in
              duration-300
              sm:slide-in-from-bottom-2
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="
                    text-[0.62rem]
                    font-semibold
                    uppercase
                    tracking-[0.2em]
                    text-gold
                  "
                >
                  Prayer Notifications
                </p>

                <h3
                  className="
                    mt-1
                    font-display
                    text-xl
                    font-bold
                    text-foreground
                  "
                >
                  {prayerLabel}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="
                  grid h-8 w-8
                  place-items-center
                  rounded-full
                  text-muted-foreground
                  transition-all
                  hover:bg-secondary
                  hover:text-foreground
                  active:scale-90
                "
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Enable notification */}
            <div
              className="
                mt-5
                flex items-center justify-between
                rounded-2xl
                border border-border
                bg-secondary/40
                p-4
              "
            >
              <div className="flex items-center gap-3">
                <span
                  className="
                    grid h-9 w-9
                    place-items-center
                    rounded-xl
                    bg-gold/10
                    text-gold
                  "
                >
                  <Bell className="h-4 w-4" />
                </span>

                <div>
                  <p className="text-sm font-semibold">
                    Notify me
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Before {prayerLabel}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={togglePrayer}
                role="switch"
                aria-checked={isEnabled}
                className={`
                  relative h-7 w-12
                  rounded-full
                  transition-all duration-300
                  ${
                    isEnabled
                      ? "bg-gold"
                      : "bg-muted"
                  }
                `}
              >
                <span
                  className={`
                    absolute top-1
                    h-5 w-5
                    rounded-full
                    bg-white
                    shadow-sm
                    transition-transform duration-300
                    ${
                      isEnabled
                        ? "translate-x-6"
                        : "translate-x-1"
                    }
                  `}
                />
              </button>
            </div>

            {/* Minutes */}
            <div className="mt-4">
              <label
                htmlFor={`notification-minutes-${prayerKey}`}
                className="
                  text-sm
                  font-semibold
                  text-foreground
                "
              >
                Notify before
              </label>

              <div className="mt-2 flex items-center gap-2">
                {[5, 10, 15].map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    onClick={() =>
                      setSettings((current) => ({
                        ...current,
                        minutesBefore: minutes,
                      }))
                    }
                    className={`
                      flex-1
                      rounded-xl
                      border
                      px-3
                      py-2
                      text-sm
                      font-semibold
                      transition-all
                      ${
                        settings.minutesBefore ===
                        minutes
                          ? "border-gold bg-gold/15 text-gold"
                          : "border-border text-muted-foreground hover:border-gold/40 hover:text-foreground"
                      }
                    `}
                  >
                    {minutes} min
                  </button>
                ))}
              </div>
            </div>

            {/* Save */}
            <button
              type="button"
              onClick={saveSettings}
              className="
                mt-5
                flex w-full
                items-center
                justify-center
                gap-2
                rounded-full
                bg-gradient-to-r
                from-[#e4c365]
                to-[#c99a32]
                px-4
                py-3
                text-sm
                font-bold
                text-[#071a14]
                shadow-[0_8px_25px_-8px_rgba(216,173,74,0.65)]
                transition-all
                duration-300
                hover:-translate-y-0.5
                active:scale-[0.98]
              "
            >
              <Check className="h-4 w-4" />
              Save Settings
            </button>
          </div>
        </div>
      )}
    </>
  );
}