# Three fixes: admin password, Hijri date, offline support

No redesign. Layout, colours, spacing, icons and page structure stay exactly as they are.

## 1. Admin password

Confirmed: the hidden `/admin` panel has no password stored in the code — it signs into the shared committee account, whose password was set to **12345678910**. So `123456789` (9 digits) will not open the panel; the full **12345678910** does. As you chose, nothing changes here — this is just the confirmation.

## 2. Hijri date shows a Gregorian month

The Hijri line is produced by asking the browser for the Islamic (Umm al-Qura) calendar. On some phone browsers that calendar is not available, so the browser silently falls back to the normal calendar and prints a Gregorian month name — which is what you are seeing.

Fix: stop depending on the phone's calendar support and compute the Hijri date in the app itself, so every device shows the same correct value.

- Add a small self-contained Hijri conversion (Umm al-Qura style, India time) with month names Muharram, Safar, Rabi al-Awwal, Rabi al-Thani, Jumada al-Awwal, Jumada al-Thani, Rajab, Shaban, Ramadan, Shawwal, Dhul Qadah, Dhul Hijjah.
- Display in the same "26 Safar 1448 AH" shape and in the same card slot, with Telugu and Urdu month spellings for those two languages.
- Where the phone does support the Islamic calendar, the value matches it, so nothing shifts for users who already saw the right date.
- No visual change to the date/clock strip.

## 3. Works offline

Goal: after the first visit, opening the site with no internet still shows the app with the last-loaded prayer times, announcements, resources, and any Quran pages already viewed.

- Keep the existing "add to home screen" setup and the existing push-notification behaviour untouched — the prayer-notification handlers move into their own worker file that the offline worker loads, so notifications keep working exactly as now.
- Generate the offline worker with the standard PWA build plugin (no hand-written caching), registered from a single guarded module so it never activates in the Lovable editor preview — offline only applies to the published site.
- Caching rules:
  - Pages: try network first, fall back to the cached copy when offline.
  - App files, fonts, icons and images: served from cache for instant loads.
  - Prayer times, announcements, about, contact and resources content: cached after each successful load and reused when offline (so the last known times are shown rather than an empty screen).
  - Quran page images: cached as you read them, capped at a few hundred pages with oldest-first eviction so phone storage stays reasonable.
- Add a small, unobtrusive "Offline — showing last saved times" note using existing colours/typography, shown only when the device is offline.

## Technical notes

- `formatHijri` in `src/components/site/PrayerTimes.tsx` switches to a new `src/lib/hijri.ts` helper (pure arithmetic, no `Intl` calendar dependency); month names localised through the existing i18n dictionaries.
- `vite-plugin-pwa` in `generateSW` mode, `injectRegister: null`, `devOptions.enabled: false`, `registerType: "autoUpdate"`, output `/sw.js`; existing push handlers move to `public/push-sw.js` and are pulled in via `importScripts`.
- Registration moves out of `src/routes/__root.tsx` into one guarded wrapper that refuses to register in dev, in an iframe, on `*.lovableproject.com` / preview hosts, and on `?sw=off` (unregistering any stale worker in those cases). `PrayerNotificationScheduler` reuses the same registration instead of registering `/sw.js` itself.
- Runtime caching: `NetworkFirst` for navigations and Supabase REST reads, `CacheFirst` with expiration for hashed assets and signed Quran page images, `/~oauth` excluded.
- Offline banner driven by `navigator.onLine` plus `online`/`offline` events; existing tokens only.
