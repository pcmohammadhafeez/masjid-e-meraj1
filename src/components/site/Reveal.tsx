import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "article";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      data-visible={visible}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn("reveal", className)}
    >
      {children}
    </Tag>
  );
}

export function SectionHeading({
  eyebrow,
  arabic,
  title,
  description,
  align = "center",
}: {
  eyebrow?: string;
  arabic?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <Reveal
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
      )}
    >
      {arabic && <p className="font-arabic text-2xl text-gold">{arabic}</p>}
      {eyebrow && (
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.35em] text-primary">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl md:text-5xl">
        {title}
      </h2>
      <div
        className={cn("gold-rule mt-5 w-28", align === "center" && "mx-auto")}
        aria-hidden="true"
      />
      {description && (
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">{description}</p>
      )}
    </Reveal>
  );
}