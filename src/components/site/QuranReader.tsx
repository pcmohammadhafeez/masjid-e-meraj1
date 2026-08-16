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
  Moon,
  Sun,
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
  const mode = "scroll" as const;
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
      el.scrollTo({ left: (next - 1) * el.clientWidth, behavior });
      
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
      if (true) {
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
      <div className="quran-reader-toolbar flex flex-wrap items-center justify-between gap-2">
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