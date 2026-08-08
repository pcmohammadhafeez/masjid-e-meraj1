import { useEffect, useState } from "react";
import {
  Download,
  X,
  Smartphone,
  Sparkles,
} from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

const DISMISSED_KEY = "masjid-e-meraj-install-dismissed";
const INSTALLED_KEY = "masjid-e-meraj-installed";

export function InstallPrompt() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Do not show after the user has already dismissed it.
    if (localStorage.getItem(DISMISSED_KEY) === "true") {
      return;
    }

    // Do not show if the website is already running as an installed app.
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches ||
      // iOS Safari
      (window.navigator as Navigator & {
        standalone?: boolean;
      }).standalone === true;

    if (standalone) {
      localStorage.setItem(INSTALLED_KEY, "true");
      return;
    }

    const handleBeforeInstallPrompt = (
      event: Event,
    ) => {
      event.preventDefault();

      const installEvent =
        event as BeforeInstallPromptEvent;

      setInstallEvent(installEvent);

      // Small delay so the page loads first.
      window.setTimeout(() => {
        setVisible(true);
      }, 1800);
    };

    const handleAppInstalled = () => {
      localStorage.setItem(INSTALLED_KEY, "true");
      localStorage.removeItem(DISMISSED_KEY);

      setVisible(false);
      setInstallEvent(null);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt,
    );

    window.addEventListener(
      "appinstalled",
      handleAppInstalled,
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );

      window.removeEventListener(
        "appinstalled",
        handleAppInstalled,
      );
    };
  }, []);

  const handleInstall = async () => {
    if (!installEvent) {
      return;
    }

    try {
      await installEvent.prompt();

      const result = await installEvent.userChoice;

      if (result.outcome === "accepted") {
        localStorage.setItem(
          INSTALLED_KEY,
          "true",
        );
      }

      setVisible(false);
      setInstallEvent(null);
    } catch {
      setVisible(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem(
      DISMISSED_KEY,
      "true",
    );

    setVisible(false);
  };

  if (!visible || !installEvent) {
    return null;
  }

  return (
    <div
      className="
        fixed inset-x-3 bottom-3 z-[100]
        sm:inset-x-auto sm:right-5 sm:bottom-5
        sm:w-[390px]
      "
      role="dialog"
      aria-label="Install Masjid-e-Meraj"
    >
      <div
        className="
          relative overflow-hidden
          rounded-[1.5rem]
          border border-gold/30
          bg-[#071a14]/95
          p-4
          shadow-[0_20px_60px_-15px_rgba(0,0,0,0.65)]
          backdrop-blur-xl
          animate-in
          slide-in-from-bottom-6
          fade-in
          duration-500
        "
      >
        {/* Gold ambient glow */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute -right-12 -top-12
            h-32 w-32
            rounded-full
            bg-gold/10
            blur-3xl
          "
        />

        {/* Close */}
        <button
          type="button"
          onClick={handleSkip}
          aria-label="Skip installation"
          className="
            absolute right-3 top-3
            grid h-7 w-7 place-items-center
            rounded-full
            text-white/50
            transition-all duration-300
            hover:bg-white/10
            hover:text-white
            active:scale-90
          "
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative flex gap-3.5">
          {/* App icon */}
          <div
            className="
              grid h-12 w-12 shrink-0
              place-items-center
              rounded-2xl
              bg-gradient-to-br
              from-[#123b2b]
              to-[#082017]
              ring-1 ring-gold/30
              shadow-[0_0_25px_rgba(216,173,74,0.12)]
            "
          >
            <Smartphone
              className="h-5 w-5 text-gold"
            />
          </div>

          <div className="min-w-0 pr-5">
            <div className="flex items-center gap-1.5">
              <Sparkles
                className="h-3 w-3 text-gold"
              />

              <p
                className="
                  text-[0.62rem]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-gold
                "
              >
                Masjid-e-Meraj
              </p>
            </div>

            <h3
              className="
                mt-1
                font-display
                text-base
                font-semibold
                text-white
              "
            >
              Install for quick access
            </h3>

            <p
              className="
                mt-1
                text-xs
                leading-relaxed
                text-white/60
              "
            >
              Prayer times, Quran and Islamic
              resources — right from your home screen.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="relative mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={handleInstall}
            className="
              press
              flex flex-1
              items-center
              justify-center
              gap-2
              rounded-full
              bg-gradient-to-r
              from-[#e4c365]
              to-[#c99a32]
              px-4
              py-2.5
              text-sm
              font-bold
              text-[#071a14]
              shadow-[0_8px_25px_-8px_rgba(216,173,74,0.65)]
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:shadow-[0_12px_30px_-8px_rgba(216,173,74,0.75)]
              active:scale-[0.97]
            "
          >
            <Download className="h-4 w-4" />

            Install
          </button>

          <button
            type="button"
            onClick={handleSkip}
            className="
              rounded-full
              px-4
              py-2.5
              text-sm
              font-medium
              text-white/60
              transition-all
              duration-300
              hover:bg-white/5
              hover:text-white
              active:scale-95
            "
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}