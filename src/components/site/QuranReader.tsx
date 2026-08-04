import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  MoveVertical,
  Moon,
  Sun,
  ZoomIn,
  ZoomOut,
  ArrowLeftRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { fetchQuranPagesConfig, signPages } from "@/lib/quran-pages";

/** Aspect ratio of the scanned pages — keeps skeletons the exact page size. */
const ASPECT = 900 / 1400;
const BEHIND = 1;
const AHEAD = 2;
const KEEP = 6;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const LAST_PAGE_KEY = "quran.lastPage";
const BOOKMARKS_KEY = "quran.bookmarks";

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function QuranReader() {
  const { data: cfg, isLoading } = useQuery({
    queryKey: ["quran-pages-config"],
    queryFn: fetchQuranPagesConfig,
    staleTime: 5 * 60 * 1000,
  });
  const total = cfg?.pageCount ?? 0;

  const [page, setPage] = useState(1);
  const [mode, setMode] = useState<"swipe" | "scroll">("swipe");
  const [zoom, setZoom] = useState(1);
  const [night, setNight] = useState(false);
  const [urls, setUrls] = useState<Record<number, string>>({});
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [resume, setResume] = useState<number | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [jump, setJump] = useState("");

  const wrapRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const fromScroll = useRef(false);
  const rafRef = useRef(0);
  const pageRef = useRef(1);
  pageRef.current = page;

  /* ---------- saved reading position + bookmarks ---------- */
  useEffect(() => {
    try {
      const last = Number(localStorage.getItem(LAST_PAGE_KEY) || "");
      if (Number.isFinite(last) && last > 1) setResume(last);
      const saved = JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || "[]");
      if (Array.isArray(saved)) setBookmarks(saved.filter((n) => typeof n === "number"));
    } catch {
      /* first visit */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LAST_PAGE_KEY, String(page));
    } catch {
      /* storage unavailable */
    }
  }, [page]);

  const toggleBookmark = () => {
    setBookmarks((prev) => {
      const next = prev.includes(page) ? prev.filter((n) => n !== page) : [...prev, page].sort((a, b) => a - b);
      try {
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  };

  /* ---------- only a handful of pages ever exist in the DOM ---------- */
  const windowPages = useMemo(() => {
    if (!total) return [] as number[];
    const from = Math.max(1, page - BEHIND);
    const to = Math.min(total, page + AHEAD);
    const list: number[] = [];
    for (let p = from; p <= to; p += 1) list.push(p);
    return list;
  }, [page, total]);

  useEffect(() => {
    if (!cfg || !windowPages.length) return;
    let alive = true;
    void signPages(cfg, windowPages).then((signed) => {
      if (!alive) return;
      setUrls((prev) => {
        const next: Record<number, string> = {};
        // Drop pages that are far away so their bitmaps get released.
        Object.entries({ ...prev, ...signed }).forEach(([key, url]) => {
          const p = Number(key);
          if (Math.abs(p - pageRef.current) <= KEEP) next[p] = url;
        });
        return next;
      });
    });
    return () => {
      alive = false;
    };
  }, [cfg, windowPages]);

  /* ---------- navigation ---------- */
  const goTo = useCallback(
    (target: number, instant = false) => {
      if (!total) return;
      const next = clamp(Math.round(target), 1, total);
      setPage(next);
      const el = scrollerRef.current;
      if (!el) return;
      const slot = el.children[next - 1] as HTMLElement | undefined;
      if (!slot) return;
      const behavior: ScrollBehavior = instant ? "auto" : "smooth";
      fromScroll.current = true;
      if (mode === "swipe") el.scrollTo({ left: (next - 1) * el.clientWidth, behavior });
      else el.scrollTo({ top: slot.offsetTop, behavior });
      window.setTimeout(
        () => {
          fromScroll.current = false;
        },
        instant ? 120 : 450,
      );
    },
    [mode, total],
  );

  const onScroll = () => {
    if (fromScroll.current || rafRef.current) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = 0;
      const el = scrollerRef.current;
      if (!el || !total) return;
      let index: number;
      if (mode === "swipe") {
        index = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
      } else {
        const slot = el.firstElementChild as HTMLElement | null;
        const h = slot?.offsetHeight || el.clientHeight;
        index = Math.floor((el.scrollTop + h * 0.35) / Math.max(1, h));
      }
      const next = clamp(index + 1, 1, total);
      if (next !== pageRef.current) setPage(next);
    });
  };

  /* ---------- pinch + double tap zoom ---------- */
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let startDist = 0;
    let startZoom = 1;
    let lastTap = 0;

    const dist = (t: TouchList) =>
      Math.hypot(t[0]!.clientX - t[1]!.clientX, t[0]!.clientY - t[1]!.clientY);

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        startDist = dist(e.touches);
        setZoom((z) => {
          startZoom = z;
          return z;
        });
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || !startDist) return;
      e.preventDefault();
      setZoom(clamp(startZoom * (dist(e.touches) / startDist), MIN_ZOOM, MAX_ZOOM));
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0 && startDist) {
        startDist = 0;
        return;
      }
      const now = Date.now();
      if (now - lastTap < 280) {
        setZoom((z) => (z > 1.05 ? 1 : 2.2));
        lastTap = 0;
      } else {
        lastTap = now;
      }
    };
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      setZoom((z) => clamp(z * Math.exp(-dy * 0.0015), MIN_ZOOM, MAX_ZOOM));
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("wheel", onWheel);
    };
  }, []);

  /* ---------- fullscreen + keyboard ---------- */
  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const onFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void wrapRef.current?.requestFullscreen?.();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goTo(pageRef.current + 1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goTo(pageRef.current - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo]);

  // Switching layout keeps the reader on the same page.
  useEffect(() => {
    const id = window.setTimeout(() => goTo(pageRef.current, true), 50);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const bookmarked = bookmarks.includes(page);
  const viewportHeight = fullscreen ? "calc(100vh - 132px)" : "min(76vh, 720px)";

  return (
    <div
      ref={wrapRef}
      className={cn(
        "surface-card rounded-[2rem] p-3 sm:rounded-[2.5rem] sm:p-5",
        fullscreen && "rounded-none bg-background p-2",
      )}
    >
      {/* ---------- top bar ---------- */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="icon-chip grid h-9 w-9 shrink-0 place-items-center rounded-xl text-gold" aria-hidden="true">
            <BookOpen className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate font-display text-base font-bold text-foreground sm:text-lg">
              Holy Quran
            </h2>
            <p className="text-[11px] text-muted-foreground">
              {total ? `Page ${page} of ${total}` : "Preparing pages…"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outlineGold"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={toggleBookmark}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark this page"}
          >
            {bookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </Button>
          <Button
            variant="outlineGold"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => setNight((n) => !n)}
            aria-label={night ? "Light pages" : "Dark pages"}
          >
            {night ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button
            variant="outlineGold"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => setMode((m) => (m === "swipe" ? "scroll" : "swipe"))}
            aria-label={mode === "swipe" ? "Switch to vertical scrolling" : "Switch to swipe pages"}
          >
            {mode === "swipe" ? <MoveVertical className="h-4 w-4" /> : <ArrowLeftRight className="h-4 w-4" />}
          </Button>
          <Button
            variant="outlineGold"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={onFullscreen}
            aria-label={fullscreen ? "Exit full screen" : "Full screen"}
          >
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* ---------- continue reading ---------- */}
      {resume && resume !== page && (
        <button
          type="button"
          onClick={() => {
            goTo(resume);
            setResume(null);
          }}
          className="mt-3 w-full rounded-2xl border border-gold/40 bg-secondary/60 px-4 py-2 text-left text-xs font-medium text-foreground transition-colors hover:bg-secondary press"
        >
          Continue reading from page {resume}
        </button>
      )}

      {/* ---------- bookmarks ---------- */}
      {bookmarks.length > 0 && (
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
          {bookmarks.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => goTo(b)}
              className={cn(
                "shrink-0 rounded-full border border-border px-3 py-1 text-[11px] tabular-nums text-muted-foreground transition-colors",
                b === page && "border-gold/60 text-gold",
              )}
            >
              {b}
            </button>
          ))}
        </div>
      )}

      {/* ---------- pages ---------- */}
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className={cn(
          "mt-3 rounded-2xl bg-muted overscroll-contain",
          "[-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          mode === "swipe"
            ? "flex overflow-x-auto overflow-y-auto"
            : "block overflow-y-auto overflow-x-auto",
          mode === "swipe" && zoom <= 1.02 && "snap-x snap-mandatory",
        )}
        style={{ height: viewportHeight, touchAction: zoom > 1.02 ? "pan-x pan-y" : undefined }}
      >
        {Array.from({ length: total }, (_, i) => i + 1).map((p) => {
          const url = urls[p];
          const visible = windowPages.includes(p);
          return (
            <div
              key={p}
              className={cn(
                "shrink-0",
                mode === "swipe" ? "h-full w-full snap-center snap-always" : "w-full pb-2",
              )}
            >
              <div
                className="mx-auto"
                style={
                  mode === "swipe"
                    ? { width: `${zoom * 100}%`, height: "100%" }
                    : { width: `${zoom * 100}%`, aspectRatio: String(ASPECT) }
                }
              >
                {visible && url ? (
                  <img
                    src={url}
                    alt={`Quran page ${p}`}
                    width={900}
                    height={1400}
                    decoding="async"
                    loading={p === page ? "eager" : "lazy"}
                    draggable={false}
                    className={cn(
                      "h-full w-full select-none object-contain",
                      night && "invert-[0.92] hue-rotate-180 brightness-[0.95]",
                    )}
                  />
                ) : (
                  <div
                    className="h-full w-full animate-pulse rounded-xl bg-gradient-to-b from-secondary/70 via-muted to-secondary/70"
                    aria-hidden="true"
                  />
                )}
              </div>
            </div>
          );
        })}
        {!total && (
          <div className="grid h-full w-full place-items-center p-6 text-center text-sm text-muted-foreground">
            {isLoading ? "Loading the Quran…" : "Quran pages have not been uploaded yet."}
          </div>
        )}
      </div>

      {/* ---------- bottom bar ---------- */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Button
            variant="outlineGold"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => goTo(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold tabular-nums text-foreground">
            {page}
            <span className="text-muted-foreground"> / {total || "—"}</span>
          </span>
          <Button
            variant="outlineGold"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => goTo(page + 1)}
            disabled={!total || page >= total}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outlineGold"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => setZoom((z) => clamp(z - 0.25, MIN_ZOOM, MAX_ZOOM))}
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="w-10 text-center text-xs tabular-nums text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="outlineGold"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => setZoom((z) => clamp(z + 0.25, MIN_ZOOM, MAX_ZOOM))}
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <form
          className="flex items-center gap-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            const n = Number(jump);
            if (Number.isFinite(n) && n >= 1) goTo(n);
            setJump("");
          }}
        >
          <label htmlFor="quran-jump" className="sr-only">
            Jump to page
          </label>
          <Input
            id="quran-jump"
            inputMode="numeric"
            value={jump}
            onChange={(e) => setJump(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="Page"
            className="h-9 w-20 rounded-full text-center text-xs"
          />
          <Button type="submit" variant="gold" size="sm" className="h-9 rounded-full px-4 text-xs">
            Go
          </Button>
        </form>
      </div>
    </div>
  );
}