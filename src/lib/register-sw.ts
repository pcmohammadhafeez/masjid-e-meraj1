/**
 * Single registration point for the offline service worker.
 *
 * The worker must never activate inside the Lovable editor preview or during
 * development, otherwise stale HTML and deleted chunks can be served back.
 */

const SW_URL = "/sw.js";

function isPreviewHost(hostname: string): boolean {
  return (
    hostname.startsWith("id-preview--") ||
    hostname.startsWith("preview--") ||
    hostname === "lovableproject.com" ||
    hostname.endsWith(".lovableproject.com") ||
    hostname === "lovableproject-dev.com" ||
    hostname.endsWith(".lovableproject-dev.com") ||
    hostname === "beta.lovable.dev" ||
    hostname.endsWith(".beta.lovable.dev")
  );
}

function shouldRegister(): boolean {
  if (typeof window === "undefined") return false;
  if (!("serviceWorker" in navigator)) return false;
  if (!import.meta.env.PROD) return false;
  if (window.self !== window.top) return false;
  if (isPreviewHost(window.location.hostname)) return false;
  if (new URLSearchParams(window.location.search).has("sw=off")) return false;
  if (window.location.search.includes("sw=off")) return false;

  return true;
}

async function unregisterExisting(): Promise<void> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  const registrations =
    await navigator.serviceWorker.getRegistrations();

  await Promise.allSettled(
    registrations
      .filter((registration) =>
        (
          registration.active ??
          registration.waiting ??
          registration.installing
        )?.scriptURL.endsWith(SW_URL),
      )
      .map((registration) => registration.unregister()),
  );
}

let registration: Promise<ServiceWorkerRegistration | null> | null = null;

/** Registers once; later callers reuse the same registration. */
export function ensureServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (registration) return registration;

  if (!shouldRegister()) {
    registration = unregisterExisting().then(() => null);
    return registration;
  }

  registration = navigator.serviceWorker
    .register(SW_URL, { scope: "/" })
    .catch((error) => {
      console.error("Service worker registration failed:", error);
      return null;
    });

  return registration;
}
