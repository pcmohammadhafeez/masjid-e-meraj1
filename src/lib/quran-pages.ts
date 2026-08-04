import { supabase } from "@/integrations/supabase/client";

/**
 * Quran page library.
 *
 * The Quran is stored as individual optimised WebP page images inside a
 * private storage bucket. The reader never downloads a PDF and never loads the
 * whole book: it signs and fetches only the handful of pages around the one
 * being read.
 */
export type QuranPagesConfig = {
  bucket: string;
  prefix: string;
  pageCount: number;
  ext: string;
};

export const QURAN_PAGES_BUCKET = "quran-pages";

const FALLBACK: QuranPagesConfig = {
  bucket: QURAN_PAGES_BUCKET,
  prefix: "v1",
  pageCount: 0,
  ext: "webp",
};

export function pagePath(cfg: QuranPagesConfig, page: number): string {
  return `${cfg.prefix}/${String(page).padStart(4, "0")}.${cfg.ext}`;
}

export async function fetchQuranPagesConfig(): Promise<QuranPagesConfig> {
  const { data, error } = await supabase
    .from("quran_pages")
    .select("bucket, prefix, page_count, ext")
    .eq("id", "default")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return FALLBACK;
  return {
    bucket: data.bucket || FALLBACK.bucket,
    prefix: data.prefix || FALLBACK.prefix,
    pageCount: data.page_count ?? 0,
    ext: data.ext || FALLBACK.ext,
  };
}

/** Signed URLs live long enough that revisiting a page hits the browser cache. */
const SIGN_TTL_SECONDS = 60 * 60 * 6;
const urlCache = new Map<string, { url: string; expiresAt: number }>();

/**
 * Signs a small batch of pages in a single request and memoises the result, so
 * reading through the book costs one tiny round trip per window of pages.
 */
export async function signPages(
  cfg: QuranPagesConfig,
  pages: number[],
): Promise<Record<number, string>> {
  const now = Date.now();
  const out: Record<number, string> = {};
  const missing: number[] = [];

  for (const page of pages) {
    const key = pagePath(cfg, page);
    const hit = urlCache.get(key);
    if (hit && hit.expiresAt > now) out[page] = hit.url;
    else missing.push(page);
  }
  if (!missing.length) return out;

  const { data, error } = await supabase.storage
    .from(cfg.bucket)
    .createSignedUrls(
      missing.map((p) => pagePath(cfg, p)),
      SIGN_TTL_SECONDS,
    );
  if (error) throw new Error(error.message);

  (data ?? []).forEach((entry, i) => {
    const page = missing[i];
    if (page === undefined || !entry.signedUrl) return;
    urlCache.set(pagePath(cfg, page), {
      url: entry.signedUrl,
      expiresAt: now + (SIGN_TTL_SECONDS - 300) * 1000,
    });
    out[page] = entry.signedUrl;
  });
  return out;
}

/**
 * Admin replacement flow: uploads a fresh set of page images under a brand new
 * folder version, then points the reader at it. Nothing is overwritten, so
 * readers never see a half-replaced Quran and no redeploy is needed.
 */
export async function replaceQuranPages(
  files: File[],
  onProgress?: (done: number, total: number) => void,
): Promise<QuranPagesConfig> {
  const ordered = [...files].sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true }));
  const first = ordered[0];
  if (!first) throw new Error("Select the page images first");

  const ext = (first.name.split(".").pop() || "webp").toLowerCase();
  const prefix = `v${Date.now()}`;
  const cfg: QuranPagesConfig = {
    bucket: QURAN_PAGES_BUCKET,
    prefix,
    pageCount: ordered.length,
    ext,
  };

  let done = 0;
  const queue = ordered.map((file, i) => ({ file, page: i + 1 }));
  const workers = Array.from({ length: 4 }, async () => {
    for (;;) {
      const job = queue.shift();
      if (!job) return;
      const { error } = await supabase.storage
        .from(cfg.bucket)
        .upload(pagePath(cfg, job.page), job.file, {
          upsert: true,
          contentType: job.file.type || `image/${ext}`,
          cacheControl: "31536000",
        });
      if (error) throw new Error(error.message);
      done += 1;
      onProgress?.(done, ordered.length);
    }
  });
  await Promise.all(workers);

  const { error } = await supabase.from("quran_pages").upsert({
    id: "default",
    bucket: cfg.bucket,
    prefix: cfg.prefix,
    page_count: cfg.pageCount,
    ext: cfg.ext,
  });
  if (error) throw new Error(error.message);
  return cfg;
}