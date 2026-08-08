import { useEffect } from "react";

export function PrayerNotificationScheduler() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      console.warn(
        "Service workers are not supported in this browser.",
      );
      return;
    }

    let cancelled = false;

    async function registerServiceWorker() {
      try {
        const registration =
          await navigator.serviceWorker.register(
            "/sw.js",
          );

        if (cancelled) {
          return;
        }

        await navigator.serviceWorker.ready;

        console.log(
          "Masjid-e-Meraj notification service ready:",
          registration.scope,
        );
      } catch (error) {
        console.error(
          "Notification service worker registration failed:",
          error,
        );
      }
    }

    void registerServiceWorker();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}