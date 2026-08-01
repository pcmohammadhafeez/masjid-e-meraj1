import { useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  BookOpen,
  Maximize2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

export function QuranViewer() {
  const { content } = useContent();
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const frameWrapRef = useRef<HTMLDivElement>(null);

  const src = content.quranPdfUrl
    ? `${content.quranPdfUrl}#page=${page}&zoom=${zoom}&view=FitH`
    : "";

  const onFullscreen = () => {
    const el = frameWrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
  };

  return (
    <div className="rounded-[2.5rem] surface-card p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="grid h-11 w-11 place-items-center rounded-2xl gradient-emerald text-primary-foreground"
            aria-hidden="true"
          >
            <BookOpen className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-xl font-semibold text-foreground">{t("res.quran")}</h3>
            {content.quranPdfName && (
              <p className="text-xs text-muted-foreground">{content.quranPdfName}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outlineGold"
            size="sm"
            className="rounded-full"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            aria-label={t("quran.prev")}
          >
            <ChevronLeft /> <span className="hidden sm:inline">{t("quran.prev")}</span>
          </Button>
          <span className="rounded-full bg-secondary px-4 py-2 text-sm font-medium tabular-nums text-foreground">
            {t("quran.page")} {page}
          </span>
          <Button
            variant="outlineGold"
            size="sm"
            className="rounded-full"
            onClick={() => setPage((p) => p + 1)}
            aria-label={t("quran.next")}
          >
            <span className="hidden sm:inline">{t("quran.next")}</span> <ChevronRight />
          </Button>
          <Button
            variant="outlineGold"
            size="sm"
            className="rounded-full"
            onClick={() => setZoom((z) => Math.max(50, z - 25))}
            aria-label={t("quran.zoomOut")}
          >
            <ZoomOut />
          </Button>
          <span className="text-sm tabular-nums text-muted-foreground">{zoom}%</span>
          <Button
            variant="outlineGold"
            size="sm"
            className="rounded-full"
            onClick={() => setZoom((z) => Math.min(300, z + 25))}
            aria-label={t("quran.zoomIn")}
          >
            <ZoomIn />
          </Button>
          <Button
            variant="outlineGold"
            size="sm"
            className="rounded-full"
            onClick={onFullscreen}
            aria-label={t("quran.fullscreen")}
          >
            <Maximize2 />
          </Button>
        </div>
      </div>

      <div
        ref={frameWrapRef}
        className="mt-6 overflow-hidden rounded-3xl border border-border bg-muted"
      >
        {src ? (
          <iframe
            key={src}
            src={src}
            title={t("res.quran")}
            className="h-[70vh] min-h-[420px] w-full"
          />
        ) : (
          <div className="grid h-[40vh] min-h-[240px] place-items-center px-6 text-center">
            <p className="text-sm text-muted-foreground">{t("quran.missing")}</p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <Button variant="gold" className="rounded-full" asChild disabled={!content.quranPdfUrl}>
          <a
            href={content.quranPdfUrl || "#"}
            download={content.quranPdfName || "quran.pdf"}
            aria-disabled={!content.quranPdfUrl}
          >
            <Download /> {t("quran.download")}
          </a>
        </Button>
      </div>
    </div>
  );
}
