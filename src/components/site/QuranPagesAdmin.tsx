import { useEffect, useState, type ChangeEvent } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  fetchQuranPagesConfig,
  replaceQuranPages,
  type QuranPagesConfig,
} from "@/lib/quran-pages";

/**
 * Lets the committee swap the Quran page images live from the admin panel.
 * Uploading a new set publishes it instantly — no redeploy needed.
 */
export function QuranPagesAdmin() {
  const [cfg, setCfg] = useState<QuranPagesConfig | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  useEffect(() => {
    void fetchQuranPagesConfig()
      .then(setCfg)
      .catch(() => setCfg(null));
  }, []);

  const onPick = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setProgress({ done: 0, total: files.length });
    try {
      const next = await replaceQuranPages(files, (done, total) => setProgress({ done, total }));
      setCfg(next);
      toast.success(`Published ${next.pageCount} Quran pages`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setProgress(null);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        The reader shows one image per page. Select every page image at once (named in page order,
        e.g. <code>0001.webp</code>) — WebP or optimised JPEG works best.
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="outlineGold" className="rounded-full" asChild disabled={Boolean(progress)}>
          <label className="cursor-pointer">
            <Upload /> {progress ? "Uploading…" : "Upload Quran pages"}
            <input
              type="file"
              accept="image/webp,image/jpeg,image/png"
              multiple
              className="sr-only"
              onChange={(e) => void onPick(e)}
            />
          </label>
        </Button>
        <p className="text-sm text-muted-foreground">
          {progress
            ? `${progress.done} / ${progress.total} uploaded`
            : cfg?.pageCount
              ? `${cfg.pageCount} pages live (set ${cfg.prefix})`
              : "No page images yet"}
        </p>
      </div>
    </div>
  );
}