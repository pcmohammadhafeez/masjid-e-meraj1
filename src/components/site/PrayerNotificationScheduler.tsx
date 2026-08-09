import { useEffect } from "react";

import { ensureServiceWorker } from "@/lib/register-sw";

const VAPID_PUBLIC_KEY =
  import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(
  base64String: string,
): Uint8Array<ArrayBuffer> {
  const padding =
    "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (
    base64String +
    padding
  )
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  const bytes = new Uint8Array(
    new ArrayBuffer(rawData.length),
  );

  for (let i = 0; i < rawData.length; i += 1) {
    bytes[i] = rawData.charCodeAt(i);
  }

  return bytes;
}

function arrayBufferToBase64Url(
  buffer: ArrayBuffer,
): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return window
    .btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function PrayerNotificationScheduler() {
  useEffect(() => {
    let cancelled = false;

    async function setupPushNotifications() {
      if (!("serviceWorker" in navigator)) {
        console.warn(
          "Service workers are not supported.",
        );
        return;
      }

      if (!("PushManager" in window)) {
        console.warn(
          "Push notifications are not supported.",
        );
        return;
      }

      if (!("Notification" in window)) {
        console.warn(
          "Notifications are not supported.",
        );
        return;
      }

      if (!VAPID_PUBLIC_KEY) {
        console.error(
          "Missing VITE_VAPID_PUBLIC_KEY.",
        );
        return;
      }

      try {
        const registration =
          (await ensureServiceWorker()) ??
          (await navigator.serviceWorker.register(
            "/sw.js",
          ));

        if (cancelled) {
          return;
        }

        await navigator.serviceWorker.ready;

        console.log(
          "Masjid-e-Meraj service worker ready:",
          registration.scope,
        );

        if (
          Notification.permission !==
          "granted"
        ) {
          console.log(
            "Notification permission is not granted.",
          );
          return;
        }

        let subscription =
          await registration.pushManager.getSubscription();

        if (!subscription) {
          subscription =
            await registration.pushManager.subscribe(
              {
                userVisibleOnly: true,
                applicationServerKey:
                  urlBase64ToUint8Array(
                    VAPID_PUBLIC_KEY,
                  ),
              },
            );
        }

        const response = await fetch(
          "/api/push/subscribe",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              endpoint:
                subscription.endpoint,
              keys: {
                p256dh:
                  arrayBufferToBase64Url(
                    subscription.getKey(
                      "p256dh",
                    )!,
                  ),
                auth:
                  arrayBufferToBase64Url(
                    subscription.getKey(
                      "auth",
                    )!,
                  ),
              },
            }),
          },
        );

        if (!response.ok) {
          throw new Error(
            `Subscription API failed: ${response.status}`,
          );
        }

        console.log(
          "Masjid-e-Meraj push subscription saved.",
        );
      } catch (error) {
        console.error(
          "Push notification setup failed:",
          error,
        );
      }
    }

    void setupPushNotifications();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}