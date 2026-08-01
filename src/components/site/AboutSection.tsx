import { useState } from "react";
import { Building2, ArrowRight } from "lucide-react";

import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useContent } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

export function AboutSection() {
  const { content } = useContent();
  const { t, lang, dir } = useI18n();
  const [open, setOpen] = useState(false);

  const summary = content.aboutSummary[lang] || content.aboutSummary.en;
  const full = content.aboutFull[lang] || content.aboutFull.en || summary;

  return (
    <Reveal as="article" className="h-full" delay={90}>
      <div id="about" className="surface-card h-full scroll-mt-24 rounded-[2rem] p-7">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl gradient-emerald text-primary-foreground"
            aria-hidden="true"
          >
            <Building2 className="h-5 w-5" />
          </span>
          <h2 className="truncate text-sm font-semibold uppercase tracking-[0.25em] text-foreground">
            {t("about.title")}
          </h2>
        </div>
        <div className="gold-rule mt-5" aria-hidden="true" />
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{summary}</p>
        <Button
          variant="gold"
          size="sm"
          className="mt-6 rounded-full"
          onClick={() => setOpen(true)}
        >
          {t("about.readMore")} <ArrowRight />
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent
            dir={dir}
            className="max-h-[80vh] overflow-y-auto rounded-[2rem] sm:max-w-2xl"
          >
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">{t("about.title")}</DialogTitle>
              <DialogDescription className="font-arabic text-base text-gold">
                مسجد معراج
              </DialogDescription>
            </DialogHeader>
            <div className="gold-rule" aria-hidden="true" />
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              {full.split("\n").filter(Boolean).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Reveal>
  );
}
