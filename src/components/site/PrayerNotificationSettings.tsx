import { useEffect, useState } from "react";
import { Bell, Check, X } from "lucide-react";

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

/* -------------------------------------------------------
   SETTINGS
------------------------------------------------------- */

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

/* -------------------------------------------------------
   PRAYER TIME
   Admin stores:
   Fajr = AM
   Dhuhr / Asr / Maghrib / Isha = PM
------------------------------------------------------- */

function prayerTimeToDate(
  prayerKey: string,
  value: string,
): Date | null {
  const match = /^\s*(\d{1,2}):(\d{2})/.exec(
    value ?? "",
  );

  if (!match) {
    return null;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (
    hours < 1 ||
    hours > 12 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  /*
   * Fajr = AM
   * All other main prayers = PM
   */
  if (prayerKey === "fajr") {
    if (hours === 12) {
      hours = 0;
    }
  } else {
    if (hours !== 12) {
      hours += 12;
    }
  }

  const prayerDate = new Date();

  prayerDate.setHours(
    hours,
    minutes,
    0,
    0,
  );

  return prayerDate;
}

/* -------------------------------------------------------
   NOTIFICATION
------------------------------------------------------- */

function showPrayerNotification(
  prayerLabel: string,
) {
  if (
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ) {
    return;
  }

  try {
    new Notification(
      `${prayerLabel} is approaching`,
      {
        body: `${prayerLabel} will begin in a few minutes.`,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: `masjid-e-meraj-${prayerLabel}`,
      },
    );
  } catch (error) {
    console.error(
      "Notification failed:",
      error,
    );
  }
}

/* -------------------------------------------------------
   30 SECOND ALARM
------------------------------------------------------- */

function playAlarm() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    const audioContext =
      new AudioContextClass();

    const startTime =
      audioContext.currentTime;

    /*
     * Different Islamic-style soft chime pattern.
     */
    const frequencies = [
      523.25,
      659.25,
      783.99,
      659.25,
    ];

    frequencies.forEach(
      (frequency, index) => {
        const oscillator =
          audioContext.createOscillator();

        const gain =
          audioContext.createGain();

        oscillator.type = "sine";

        oscillator.frequency.value =
          frequency;

        const time =
          startTime + index * 0.7;

        gain.gain.setValueAtTime(
          0,
          time,
        );

        gain.gain.linearRampToValueAtTime(
          0.18,
          time + 0.05,
        );

        gain.gain.exponentialRampToValueAtTime(
          0.001,
          time + 0.6,
        );

        oscillator.connect(gain);
        gain.connect(
          audioContext.destination,
        );

        oscillator.start(time);
        oscillator.stop(time + 0.65);
      },
    );

    /*
     * Close after the short chime.
     * The notification itself remains visible.
     */
    window.setTimeout(() => {
      void audioContext.close();
    }, 4000);
  } catch (error) {
    console.error(
      "Alarm failed:",
      error,
    );
  }
}

/* -------------------------------------------------------
   COMPONENT
------------------------------------------------------- */

export function PrayerNotificationSettings({
  prayerKey,
  prayerLabel,
  prayerTime,
}: {
  prayerKey: string;
  prayerLabel: string;
  prayerTime: string;
}) {
  const [open, setOpen] =
    useState(false);

  const [settings, setSettings] =
    useState<PrayerNotificationSettings>(
      DEFAULT_SETTINGS,
    );

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const isEnabled =
    settings.enabled[prayerKey] ?? false;

  /* -----------------------------------------------------
     SCHEDULE NOTIFICATION
  ----------------------------------------------------- */

  useEffect(() => {
  if (!isEnabled) {
    return;
  }

  if (
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ) {
    return;
  }

  const prayerDate = prayerTimeToDate(
    prayerKey,
    prayerTime,
  );

  if (!prayerDate) {
    return;
  }

  const now = new Date();

  /*
   * Notification time =
   * prayer time - selected minutes
   */
  const notificationTime =
    prayerDate.getTime() -
    settings.minutesBefore * 60 * 1000;

  const delay =
    notificationTime - now.getTime();

  /*
   * Don't schedule a notification that has
   * already passed today.
   */
  if (delay <= 0) {
    return;
  }

  const timer = window.setTimeout(() => {
    showPrayerNotification(prayerLabel);

    /*
     * Play the short alarm.
     */
    playAlarm();
  }, delay);

  return () => {
    window.clearTimeout(timer);
  };
}, [
  isEnabled,
  prayerKey,
  prayerLabel,
  prayerTime,
  settings.minutesBefore,
]);

  /* -----------------------------------------------------
     TOGGLE
  ------------------------------------------------------- */

  async function togglePrayer() {
    if (!isEnabled) {
      if (!("Notification" in window)) {
        alert(
          "This browser does not support notifications.",
        );
        return;
      }

      let permission =
        Notification.permission;

      if (permission === "default") {
        permission =
          await Notification.requestPermission();
      }

      if (permission !== "granted") {
        alert(
          "Please allow notifications for Masjid-e-Meraj in your browser settings.",
        );
        return;
      }
    }

    const next: PrayerNotificationSettings = {
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

  function handleOpen() {
    setSettings(loadSettings());
    setOpen(true);
  }

  return (
    <>
      {/* Notification button */}

      <button
        type="button"
        onClick={handleOpen}
        aria-label={`Notification settings for ${prayerLabel}`}
        title={`Notification settings for ${prayerLabel}`}
        className={`
          grid h-8 w-8 shrink-0
          place-items-center
          rounded-full
          transition-all
          duration-300
          active:scale-90
          ${
            isEnabled
              ? "bg-gold/15 text-gold shadow-[0_0_14px_color-mix(in_oklab,var(--color-gold)_18%,transparent)]"
              : "text-muted-foreground hover:bg-gold/10 hover:text-gold"
          }
        `}
      >
        <Bell className="h-4 w-4" />
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
          onClick={() =>
            setOpen(false)
          }
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
                onClick={() =>
                  setOpen(false)
                }
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

            {/* Enable */}

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
                onClick={() =>
                  void togglePrayer()
                }
                role="switch"
                aria-checked={isEnabled}
                className={`
                  relative
                  h-7
                  w-12
                  shrink-0
                  overflow-hidden
                  rounded-full
                  transition-all
                  duration-300
                  ${
                    isEnabled
                      ? "bg-gold"
                      : "bg-muted"
                  }
                `}
              >
                <span
                  className={`
                    absolute
                    top-1
                    h-5
                    w-5
                    rounded-full
                    bg-white
                    shadow-sm
                    transition-[left]
                    duration-300
                    ${
                      isEnabled
                        ? "left-6"
                        : "left-1"
                    }
                  `}
                />
              </button>
            </div>

            {/* Minutes */}

            <div className="mt-4">
              <label
                className="
                  text-sm
                  font-semibold
                  text-foreground
                "
              >
                Notify before
              </label>

              <div className="mt-2 flex items-center gap-2">
                {[5, 10, 15].map(
                  (minutes) => (
                    <button
                      key={minutes}
                      type="button"
                      onClick={() =>
                        setSettings(
                          (current) => ({
                            ...current,
                            minutesBefore:
                              minutes,
                          }),
                        )
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
                  ),
                )}
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