import { useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  BookOpen,
  Maximize2,
  Search,
  MoveHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useContent } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import quranAsset from "@/assets/quran-majeed.pdf.asset.json";

export function QuranViewer() {
  const { content } = useContent();
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [query, setQuery] = useState("");
  const [term, setTerm] = useState("");
  const [fitWidth, setFitWidth] = useState(true);
  const frameWrapRef = useRef<HTMLDivElement>(null);

  // Uploaded PDF wins; otherwise fall back to the public static file, which
  // works identically in development and after deployment.
  const pdfUrl = content.quranPdfUrl || quranAsset.url;
  const src = `${pdfUrl}#page=${page}&zoom=${fitWidth ? "page-width" : zoom}${
    fitWidth ? "&view=FitH" : ""
  }${term ? `&search=${encodeURIComponent(term)}` : ""}`;

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
            className="grid h-11 w-11 place-items-center rounded-2xl gradient-emerald on-emerald"
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
            onClick={() => {
              setFitWidth(false);
              setZoom((z) => Math.max(50, z - 25));
            }}
            aria-label={t("quran.zoomOut")}
          >
            <ZoomOut />
          </Button>
          <span className="text-sm tabular-nums text-muted-foreground">
            {fitWidth ? "Fit" : `${zoom}%`}
          </span>
          <Button
            variant="outlineGold"
            size="sm"
            className="rounded-full"
            onClick={() => {
              setFitWidth(false);
              setZoom((z) => Math.min(300, z + 25));
            }}
            aria-label={t("quran.zoomIn")}
          >
            <ZoomIn />
          </Button>
          <Button
            variant="outlineGold"
            size="sm"
            className="rounded-full"
            onClick={() => setFitWidth(true)}
            aria-label="Fit width"
          >
            <MoveHorizontal /> <span className="hidden sm:inline">Fit width</span>
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

      <form
        className="mt-5 flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setTerm(query.trim());
        }}
      >
        <label htmlFor="quran-search" className="sr-only">
          {t("quran.search")}
        </label>
        <Input
          id="quran-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("quran.searchPlaceholder")}
          className="h-10 max-w-xs rounded-full"
        />
        <Button type="submit" variant="outlineGold" size="sm" className="rounded-full">
          <Search /> {t("quran.search")}
        </Button>
      </form>

      <div
        ref={frameWrapRef}
        className="mt-5 overflow-hidden rounded-3xl border border-border bg-muted"
      >
        <iframe
          key={src}
          src={src}
          title={t("res.quran")}
          className="h-[70vh] min-h-[420px] w-full"
        />
      </div>

      <div className="mt-6">
        <Button variant="gold" className="rounded-full" asChild>
          <a href={pdfUrl} download={content.quranPdfName || "quran.pdf"}>
            <Download /> {t("quran.download")}
          </a>
        </Button>
      </div>
    </div>
  );
}
