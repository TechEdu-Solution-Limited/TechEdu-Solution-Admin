// components/cv/RatingModal.tsx
"use client";

import React, { useEffect, useMemo, useRef, useId } from "react";
import { CVRatingResult } from "@/services/cv/cvServiceOptimized";
import {
  X,
  CheckCircle2,
  Gauge,
  Sparkles,
  FileText,
  Layers,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/* -------------------------- helpers & primitives -------------------------- */

export interface RatingModalProps {
  open: boolean;
  data: CVRatingResult | null;
  onClose: () => void;
  onStartEditing: () => void;
}

function formatFileSize(bytes: number = 0) {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function clamp(n: number | undefined, min = 0, max = 100) {
  const v = Number.isFinite(n as number) ? (n as number) : 0;
  return Math.max(min, Math.min(max, v));
}

/** Circular gauge using a conic gradient with `currentColor` */
function ScoreGauge({
  value = 0,
  label,
  id,
}: {
  value?: number;
  label?: string;
  id?: string;
}) {
  const v = clamp(value);
  const angle = (v / 100) * 360;
  return (
    <div className="flex flex-col items-center justify-center text-purple-600">
      <div
        role="img"
        aria-labelledby={id}
        className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-full"
        style={{
          // foreground uses currentColor so you can theme via text-* utils
          background: `conic-gradient(currentColor ${angle}deg, hsl(0 0% 90% / 0.4) ${angle}deg)`,
        }}
      >
        <div className="absolute inset-2 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-inner">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold">{v}</div>
            <div className="text-[10px] sm:text-xs text-gray-500">/100</div>
          </div>
        </div>
      </div>
      {label && (
        <div
          id={id}
          className="mt-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          {label}
        </div>
      )}
    </div>
  );
}

function Bar({ value = 0, label }: { value?: number; label?: string }) {
  const v = clamp(value);
  return (
    <div className="w-full">
      {!!label && (
        <span className="sr-only">
          {label}: {v} out of 100
        </span>
      )}
      <div
        className="w-full h-2.5 bg-gray-200/70 dark:bg-gray-700/60 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={v}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full transition-all"
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
}

/* --------------------------------- main ---------------------------------- */

export default function RatingModal({
  open,
  data,
  onClose,
  onStartEditing,
}: RatingModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus the close button on open (after dialog mount)
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      const btn = panelRef.current?.querySelector<HTMLButtonElement>(
        '[data-close="true"]'
      );
      btn?.focus();
    }, 50);
    return () => clearTimeout(t);
  }, [open]);

  const rating = data?.rating;
  const fileMeta = data?.fileMeta;

  const sectionEntries = useMemo(() => {
    const obj = rating?.sections || {};
    // Optional: sort by score desc for more helpful ordering
    return (Object.entries(obj) as [string, number][]).sort(
      (a, b) => clamp(b[1]) - clamp(a[1])
    );
  }, [rating?.sections]);

  if (!open || !data || !rating) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        // width/height & container styling to match your sheet-like feel
        className="w-full sm:w-[min(720px,calc(100vw-2rem))] h-[90vh] sm:h-[85vh] max-h-[90vh] sm:max-h-[85vh] p-0 overflow-hidden rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col"
      >
        <div ref={panelRef} className="flex flex-col h-full min-h-0 overflow-hidden">
          <style jsx global>{`
            @media (prefers-reduced-motion: no-preference) {
              .rt-animate-up {
                animation: rt-slideUp 0.2s ease-out both;
              }
              @keyframes rt-slideUp {
                from {
                  transform: translateY(10px);
                  opacity: 0;
                }
                to {
                  transform: translateY(0);
                  opacity: 1;
                }
              }
            }
          `}</style>

          {/* Header */}
          <div className="shrink-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <DialogHeader className="p-0">
                <DialogTitle
                  id={titleId}
                  className="text-base sm:text-lg font-semibold"
                >
                  CV Rating &amp; Feedback
                </DialogTitle>
              </DialogHeader>
            </div>
            <Button
              data-close="true"
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div
            className="flex-1 min-h-0 px-4 sm:px-6 py-4 sm:py-6 overflow-y-auto overscroll-contain space-y-6 rt-animate-up"
            style={{ 
              WebkitOverflowScrolling: "touch",
            }}
          >
            {/* Top row: Overall & badges */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <ScoreGauge
                  value={rating.overall}
                  label="Overall Score"
                  id={`${titleId}-overall`}
                />
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200 text-xs sm:text-sm font-medium">
                    <Gauge className="h-4 w-4" />
                    Score calculated from content, structure & ATS checks
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {rating.atsFriendly ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium">
                        <CheckCircle2 className="h-4 w-4" />
                        ATS Friendly
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-medium">
                        <AlertTriangle className="h-4 w-4" />
                        ATS Issues Detected
                      </span>
                    )}
                    {typeof rating.keywordCoverage === "number" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200 text-xs font-medium">
                        <Layers className="h-4 w-4" />
                        Keywords: {clamp(rating.keywordCoverage)}%
                      </span>
                    )}
                    {!!rating.seniority && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 text-xs font-medium capitalize">
                        <ShieldCheck className="h-4 w-4" />
                        {rating.seniority}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!!fileMeta && (
                <div className="grid grid-cols-3 gap-3 w-full sm:w-auto">
                  <MetaCard
                    title="Size"
                    value={formatFileSize(fileMeta.bytes || 0)}
                  />
                  <MetaCard
                    title="Pages"
                    value={String(fileMeta.pages ?? "–")}
                  />
                  <MetaCard
                    title="Type"
                    value={fileMeta.mime || fileMeta.ext || "—"}
                  />
                </div>
              )}
            </div>

            {/* Sections grid */}
            {sectionEntries.length > 0 && (
              <div>
                <SectionHeading
                  icon={<FileText className="h-4 w-4" />}
                  title="Section Scores"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sectionEntries.map(([key, val]) => (
                    <div
                      key={key}
                      className="rounded-xl border border-gray-200 dark:border-gray-800 p-3 sm:p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium capitalize">
                          {key}
                        </span>
                        <span className="text-sm font-semibold">
                          {clamp(val)}
                        </span>
                      </div>
                      <Bar value={val} label={`${key} score`} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths & Gaps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ListCard
                title="Strengths"
                items={rating.strengths}
                color="green"
              />
              <ListCard title="Gaps" items={rating.gaps} color="rose" />
            </div>

            {/* Notes */}
            {!!rating.notes && (
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
                <h4 className="text-sm font-semibold mb-1">Notes</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {rating.notes}
                </p>
              </div>
            )}

            {/* Job Match */}
            {!!rating.match && (
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold">Job Match</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Score</span>
                    <div className="min-w-[100px]">
                      <Bar value={rating.match.score} label="Job match score" />
                    </div>
                    <span className="text-sm font-semibold w-8 text-right">
                      {clamp(rating.match.score)}
                    </span>
                  </div>
                </div>

                {Array.isArray(rating.match.missingSkills) &&
                  rating.match.missingSkills.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-500 mb-1">
                        Missing skills
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {rating.match.missingSkills.map((s, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {Array.isArray(rating.match.reasons) &&
                  rating.match.reasons.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-500 mb-1">Reasons</div>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {rating.match.reasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-t border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
              data-close="true"
            >
              Close
            </Button>
            <Button
              onClick={onStartEditing}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 text-white"
            >
              Start Editing This CV
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------- presentational bits -------------------------- */

function SectionHeading({
  icon,
  title,
}: {
  icon?: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
        {icon}
      </div>
      <h4 className="text-sm font-semibold">{title}</h4>
    </div>
  );
}

function MetaCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-3 text-center">
      <div className="text-[11px] uppercase tracking-wide text-gray-500">
        {title}
      </div>
      <div className="mt-0.5 text-sm font-semibold">{value}</div>
    </div>
  );
}

function ListCard({
  title,
  items,
  color = "gray",
}: {
  title: string;
  items?: string[];
  color?: "green" | "rose" | "gray";
}) {
  const palette =
    color === "green"
      ? {
          dot: "bg-green-500",
          header: "text-green-700 dark:text-green-300",
          chip: "bg-green-50 dark:bg-green-900/20",
        }
      : color === "rose"
      ? {
          dot: "bg-rose-500",
          header: "text-rose-700 dark:text-rose-300",
          chip: "bg-rose-50 dark:bg-rose-900/20",
        }
      : {
          dot: "bg-gray-500",
          header: "text-gray-700 dark:text-gray-300",
          chip: "bg-gray-100 dark:bg-gray-800",
        };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-2">
        <span className={`h-2 w-2 rounded-full ${palette.dot}`} />
        <h4 className={`text-sm font-semibold ${palette.header}`}>{title}</h4>
      </div>
      {Array.isArray(items) && items.length > 0 ? (
        <ul className="list-disc list-inside text-sm space-y-1">
          {items.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      ) : (
        <div className="text-xs text-gray-500">No items provided.</div>
      )}
    </div>
  );
}
