import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

import { useI18n } from "@/lib/i18n";

/** Quiet strip shown only while the device has no connection. */
export function OfflineNotice() {
  const { lang } = useI18n();
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);

    sync();

    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);

    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  if (!offline) return null;

  const message =
    lang === "te"
      ? "ఆఫ్‌లైన్ — చివరిగా సేవ్ చేసిన సమయాలు చూపుతున్నాము"
      : lang === "ur"
        ? "آف لائن — آخری محفوظ اوقات دکھائے جا رہے ہیں"
        : "Offline — showing last saved times";

  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-3 z-50 flex justify-center px-4"
    >
      <span className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-gold/40 bg-secondary/90 px-3.5 py-1.5 text-[0.7rem] font-semibold tracking-[0.08em] text-foreground shadow-soft backdrop-blur">
        <WifiOff className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
        {message}
      </span>
    </div>
  );
}
