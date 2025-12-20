"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Award, Trash2, Sparkles, Loader2, X, Check } from "lucide-react";
import { Skill, PersonalInfo } from "@/types/cv/index";
import { Button } from "@/components/ui/button";
import { cvService } from "@/services/cv/cvServiceOptimized";

interface SkillsSectionProps {
  skills: Skill[];
  personalInfo?: PersonalInfo;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof Skill, value: string) => void;
  onShowAIConsent?: () => void;
  aiConsent?: { aiProcessing: boolean; aiTraining: boolean } | null;
  cvId?: string;
}

type AISuggestion = { name: string; score: number; evidence?: string };

function scoreToLevel(score: number): Skill["level"] {
  if (score >= 85) return "Expert";
  if (score >= 65) return "Advanced";
  if (score >= 45) return "Intermediate";
  return "Beginner";
}

function uniqByName(list: AISuggestion[]) {
  const seen = new Set<string>();
  const out: AISuggestion[] = [];
  for (const s of list) {
    const k = (s.name || "").trim().toLowerCase();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(s);
  }
  return out;
}

export default function SkillsSection({
  skills,
  personalInfo,
  onAdd,
  onRemove,
  onUpdate,
  onShowAIConsent,
  aiConsent,
  cvId,
}: SkillsSectionProps) {
  // --------- AI state ----------
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[] | null>(
    null
  );
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const overlayPanelRef = useRef<HTMLDivElement | null>(null);

  // --------- Optimistic row edits ----------
  const [pending, setPending] = useState<Record<string, Partial<Skill>>>({});
  const setRowEdits = (id: string, patch: Partial<Skill>) =>
    setPending((p) => ({ ...p, [id]: { ...p[id], ...patch } }));

  // Existing skill names (with pending)
  const existingNames = useMemo(() => {
    const s = new Set<string>();
    for (const sk of skills) {
      const name = (pending[sk.id]?.name ?? sk.name ?? "").trim().toLowerCase();
      if (name) s.add(name);
    }
    return s;
  }, [skills, pending]);

  // Queue to fill rows as they are added
  const addQueueRef = useRef<AISuggestion[]>([]);
  const prevCountRef = useRef<number>(skills.length);

  // When parent adds a row, fill with next queued suggestion
  useEffect(() => {
    if (skills.length > prevCountRef.current && addQueueRef.current.length) {
      const newRow = skills[skills.length - 1];
      const suggestion = addQueueRef.current.shift()!;
      const level = scoreToLevel(suggestion.score);

      onUpdate(newRow.id, "name", suggestion.name);
      onUpdate(newRow.id, "level", String(level));
      setRowEdits(newRow.id, { name: suggestion.name, level });

      if (addQueueRef.current.length) onAdd();
    }
    prevCountRef.current = skills.length;
  }, [skills, onAdd, onUpdate]);

  // ---- Add helpers ----
  const addSuggestions = (
    list: AISuggestion[],
    opts: { replace?: boolean; top5?: boolean } = {}
  ) => {
    const base = opts.top5 ? list.slice(0, 5) : list;

    const toAdd = base.filter(
      (s) => !existingNames.has((s.name || "").trim().toLowerCase())
    );

    if (opts.replace) {
      skills.forEach((k) => onRemove(k.id));
    }

    if (toAdd.length === 0) {
      alert("All suggested skills are already present.");
      return;
    }

    addQueueRef.current.push(...toAdd);
    for (let i = 0; i < toAdd.length; i++) onAdd();

    setOverlayOpen(false);
  };

  const selectedList = useMemo(() => {
    if (!aiSuggestions) return [];
    return aiSuggestions.filter((_, idx) => !!selected[idx]);
  }, [aiSuggestions, selected]);

  const toggleSelect = (idx: number) => {
    setSelected((m) => ({ ...m, [idx]: !m[idx] }));
  };

  // ---- Overlay a11y: ESC to close, focus the close button on open ----
  useEffect(() => {
    if (!overlayOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOverlayOpen(false);
    };
    window.addEventListener("keydown", onKey);
    // focus close button
    const btn = overlayPanelRef.current?.querySelector<HTMLButtonElement>(
      '[data-close="true"]'
    );
    btn?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [overlayOpen]);

  // ---- Lock background scroll while overlay is open ----
  useEffect(() => {
    if (!overlayOpen) return;
    const { body } = document;
    const prev = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = prev;
    };
  }, [overlayOpen]);

  // ---- Fetch AI ----
  const generateAISkills = async () => {
    if (!personalInfo?.targetedJobTitle?.trim()) {
      alert("Please fill in your targeted job title first.");
      return;
    }
    if (!cvId || cvId === "undefined" || cvId === "null") {
      alert("CV must be created first.");
      return;
    }

    // Consent: require aiProcessing only (training is optional)
    try {
      const cv = await cvService.getCV(String(cvId)).catch(() => null);
      const processing = !!(
        cv?.consent?.aiProcessing || aiConsent?.aiProcessing
      );
      if (!processing) {
        onShowAIConsent ? onShowAIConsent() : alert("AI consent is required.");
        return;
      }
    } catch {
      if (!aiConsent?.aiProcessing) {
        onShowAIConsent ? onShowAIConsent() : alert("AI consent is required.");
        return;
      }
    }

    setLoadingAI(true);
    try {
      const res = await cvService.generateSkills(
        String(cvId),
        "all",
        undefined,
        {
          targetRole: personalInfo.targetedJobTitle,
          industry: (personalInfo as any)?.industry || undefined, // include industry if you have it
        }
      );

      const raw: AISuggestion[] =
        (res?.skills ?? [])
          .filter((s) => s?.name)
          .map((s) => ({
            name: s.name,
            score: Number(s.score ?? 0),
            evidence: s.evidence,
          })) || [];

      const suggestions = uniqByName(raw);

      if (!suggestions.length) {
        alert("No skill suggestions returned. Try again later.");
        return;
      }

      setAiSuggestions(suggestions);
      setSelected({});
      setOverlayOpen(true);
    } catch (err) {
      console.error("AI skills error", err);
      alert("Failed to generate AI skills. Please try again.");
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div>
      {/* Header row */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-2xl font-bold text-gray-900 dark:text-white" />
        <div className="flex items-center gap-3">
          <button
            onClick={onAdd}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] transition-colors"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span>Add Skill</span>
          </button>

          {/* AI button (opens full-screen overlay) */}
          {/* <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              overlayOpen ? setOverlayOpen(false) : generateAISkills()
            }
            disabled={loadingAI || !cvId}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 disabled:opacity-50 rounded-[8px]"
            title={
              !cvId
                ? "CV must be created first"
                : !personalInfo?.targetedJobTitle?.trim()
                ? "Please fill in your targeted job title first"
                : "Generate AI skill suggestions"
            }
          >
            {loadingAI ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span className="text-sm">
              {overlayOpen ? "Hide AI" : "AI Suggestions"}
            </span>
          </Button> */}
        </div>
      </div>

      {/* Empty state / List */}
      {skills.length === 0 ? (
        <div className="text-center py-12">
          <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No skills added yet
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Click &quot;Add Skill&quot; or use AI to get suggestions
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {skills.map((skill) => {
            const local = pending[skill.id] || {};
            const valueName = (local.name ?? skill.name) || "";
            const valueLevel = (local.level ?? skill.level) || "Beginner";

            return (
              <div
                key={skill.id}
                className="relative p-4 border border-gray-200 dark:border-gray-700 rounded-[10px]"
              >
                <div className="relative flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={valueName}
                    onChange={(e) => {
                      setRowEdits(skill.id, { name: e.target.value });
                      onUpdate(skill.id, "name", e.target.value);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-[10px] focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Skill name"
                  />

                  <div className="w-36">
                    <select
                      value={valueLevel}
                      onChange={(e) => {
                        const v = e.target.value as Skill["level"];
                        setRowEdits(skill.id, { level: v });
                        onUpdate(skill.id, "level", v as string);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-[10px] focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>

                  <button
                    onClick={() => onRemove(skill.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    aria-label="Remove skill"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ---------- FULL-SCREEN OVERLAY SELECTOR ---------- */}
      {overlayOpen && aiSuggestions?.length ? (
        <div
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="AI skill suggestions"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOverlayOpen(false);
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Panel */}
          <div
            ref={overlayPanelRef}
            className="
              relative w-full sm:w-[min(720px,calc(100vw-2rem))]
              max-h-[90vh] sm:max-h-[85vh] min-h-0
              bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
              rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-200/70 dark:border-gray-800
              overflow-hidden transform transition-all
            "
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 flex items-center justify-between">
              <div className="text-sm sm:text-base font-semibold">
                AI Skill Suggestions
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-[8px]"
                  onClick={() => {
                    const all: Record<number, boolean> = {};
                    aiSuggestions.forEach((_, i) => (all[i] = true));
                    setSelected(all);
                  }}
                  title="Select all suggestions"
                >
                  Select all
                </Button>
                <button
                  data-close="true"
                  onClick={() => setOverlayOpen(false)}
                  className="inline-flex items-center justify-center rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* List */}
            <div
              className="px-4 sm:px-6 py-3 overflow-y-auto"
              style={{ maxHeight: "calc(90vh - 112px)" }}
            >
              <p className="text-xs sm:text-sm text-gray-500 mb-3">
                Click items to select. Use the buttons below to add to your
                Skills section.
              </p>

              <ul className="divide-y divide-gray-100 dark:divide-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                {aiSuggestions.map((s, idx) => {
                  const key = (s.name || "").trim().toLowerCase();
                  const alreadyAdded = existingNames.has(key);
                  const isSelected = !!selected[idx];
                  const level = scoreToLevel(s.score);
                  return (
                    <li
                      key={`${s.name}-${idx}`}
                      className={`p-3 sm:p-4 cursor-pointer select-none ${
                        alreadyAdded
                          ? "opacity-50"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/60"
                      }`}
                      onClick={() => {
                        if (alreadyAdded) return;
                        toggleSelect(idx);
                      }}
                      title={
                        alreadyAdded
                          ? "Already in your skills"
                          : `${s.name} (${level}) • Score ${s.score}`
                      }
                      aria-disabled={alreadyAdded}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">
                              {s.name}
                            </span>
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border">
                              {s.score}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {level}
                            </span>
                          </div>
                          {s.evidence && (
                            <div
                              className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2"
                              title={s.evidence}
                            >
                              {s.evidence}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center">
                          {alreadyAdded ? (
                            <Check className="h-5 w-5 text-green-600" />
                          ) : isSelected ? (
                            <div className="h-5 w-5 flex items-center justify-center rounded border border-blue-500 bg-blue-500">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          ) : (
                            <div className="h-5 w-5 rounded border border-gray-300 dark:border-gray-600" />
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Footer actions */}
            <div className="sticky bottom-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-t border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                className="rounded-[8px]"
                onClick={() => {
                  if (!selectedList.length) {
                    alert("Select at least one skill.");
                    return;
                  }
                  addSuggestions(selectedList);
                }}
              >
                Add selected
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-[8px]"
                onClick={() => addSuggestions(aiSuggestions!)}
              >
                Add all
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-[8px]"
                onClick={() => addSuggestions(aiSuggestions!, { top5: true })}
              >
                Add top 5
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-[8px]"
                onClick={() => {
                  if (!selectedList.length) {
                    alert("Select at least one skill.");
                    return;
                  }
                  addSuggestions(selectedList, { replace: true });
                }}
                title="Replace current skills with selected"
              >
                Replace with selected
              </Button>
              <div className="ml-auto">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="rounded-[8px]"
                  onClick={() => setOverlayOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
