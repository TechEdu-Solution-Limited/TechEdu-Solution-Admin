"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { ProfessionalSummary, PersonalInfo } from "@/types/cv/index";
import { Button } from "@/components/ui/button";
import { cvService } from "@/services/cv/cvServiceOptimized";
import { aiConsentService } from "@/services/auth/aiConsentService"; // ⬅️ NEW
import QuillTextEditor, { EditorApi } from "./QuillTextEditor";

interface ProfessionalSummarySectionProps {
  professionalSummary: ProfessionalSummary;
  personalInfo: PersonalInfo;
  onUpdateProfessionalSummary: (updates: Partial<ProfessionalSummary>) => void;
  onShowAIConsent?: () => void; // training-only modal
  aiConsent?: { aiProcessing: boolean; aiTraining: boolean } | null;
  cvId?: string;
  onCheckExistingConsent?: (
    cvId: string
  ) => Promise<{ aiProcessing: boolean; aiTraining: boolean } | null>;
}

type AISummary = { content?: string; bullets?: string[] };

function stripTags(s = "") {
  return s.replace(/<[^>]*>/g, "");
}
function normalizeHtml(s = "") {
  return s.replace(/\s+/g, " ").trim();
}
function buildHtml({
  content,
  bullets,
  includeContent,
  includeBullets,
}: {
  content?: string;
  bullets?: string[];
  includeContent: boolean;
  includeBullets: boolean;
}) {
  const blocks: string[] = [];
  if (includeContent && content?.trim()) {
    blocks.push(`<p>${stripTags(content.trim())}</p>`);
  }
  if (includeBullets && bullets && bullets.length) {
    const items = bullets
      .filter((b) => b && b.trim())
      .map((b) => `<li>${stripTags(b.trim())}</li>`)
      .join("");
    if (items) blocks.push(`<ul>${items}</ul>`);
  }
  return blocks.join("");
}

// Small helper to detect the backend "processing not permitted" error
function isProcessingNotPermitted(err: any): boolean {
  try {
    const code = err?.error?.code || err?.code;
    const details: string[] =
      err?.error?.details ||
      err?.details ||
      err?.response?.data?.error?.details ||
      [];
    const msg = (err?.message || err?.error?.message || "")
      .toString()
      .toLowerCase();
    return (
      (code === "VALIDATION_ERROR" &&
        (details || []).some((d) =>
          (d || "")
            .toString()
            .toLowerCase()
            .includes("processing not permitted")
        )) ||
      msg.includes("processing not permitted")
    );
  } catch {
    return false;
  }
}

export default function ProfessionalSummarySection({
  professionalSummary,
  personalInfo,
  onUpdateProfessionalSummary,
  onShowAIConsent,
  aiConsent,
  cvId,
}: ProfessionalSummarySectionProps) {
  // --- Editor state ---
  const incoming = professionalSummary?.summary || "";
  const [localSummary, setLocalSummary] = useState<string>(incoming);
  const [isLocalDirty, setIsLocalDirty] = useState(false);
  const editorApiRef = useRef<EditorApi | null>(null);

  useEffect(() => {
    if (
      !isLocalDirty &&
      normalizeHtml(incoming) !== normalizeHtml(localSummary)
    ) {
      setLocalSummary(incoming);
    }
  }, [incoming, isLocalDirty, localSummary]);

  useEffect(() => {
    if (
      normalizeHtml(incoming) === normalizeHtml(localSummary) &&
      isLocalDirty
    ) {
      setIsLocalDirty(false);
    }
  }, [incoming, localSummary, isLocalDirty]);

  // --- AI state ---
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [ai, setAi] = useState<AISummary | null>(null);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [insertMode, setInsertMode] = useState<"append" | "replace">("append");

  // default mode: replace when editor empty, else append
  useEffect(() => {
    const empty = normalizeHtml(localSummary).length === 0;
    setInsertMode(empty ? "replace" : "append");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedBullets = useMemo(() => {
    if (!ai?.bullets?.length) return [];
    return ai.bullets.filter((_, idx) => !!selected[idx]);
  }, [ai, selected]);

  // --- Insert helpers ---
  const commitHtml = (html: string, mode: "append" | "replace") => {
    let next = html;
    if (mode === "append" && normalizeHtml(localSummary).length) {
      next = `${localSummary}\n<p></p>\n${html}`;
    }
    if (normalizeHtml(next) === normalizeHtml(localSummary)) return;
    setLocalSummary(next);
    setIsLocalDirty(true);
    onUpdateProfessionalSummary({ summary: next });
  };

  // --- AI request (training-gated; processing auto-accepted) ---
  const generateAISuggestion = async () => {
    if (!personalInfo?.targetedJobTitle?.trim()) {
      alert("Please fill in your targeted job title in Personal Information.");
      return;
    }
    if (!cvId || cvId === "undefined" || cvId === "null") {
      alert("CV must be created first.");
      return;
    }

    // 1) Ensure processing consent (silent, idempotent)
    await aiConsentService.acceptProcessing();

    // 2) Gate on aiTraining only (UI/flow requirement)
    try {
      const cv = await cvService.getCV(String(cvId)).catch(() => null);
      const trainingAllowed =
        !!cv?.consent?.aiTraining || !!aiConsent?.aiTraining;
      if (!trainingAllowed) {
        onShowAIConsent?.();
        return;
      }
    } catch {
      if (!aiConsent?.aiTraining) {
        onShowAIConsent?.();
        return;
      }
    }

    // 3) Call AI (with smart retry on processing error)
    setIsGeneratingAI(true);
    try {
      const run = async () => {
        return await cvService.generateSummary(
          String(cvId),
          "professional and concise"
        );
      };

      let result: { content?: string; bullets?: string[] } | null = null;

      try {
        result = await run();
      } catch (err1: any) {
        if (isProcessingNotPermitted(err1)) {
          // Accept & retry once
          const ok = await aiConsentService.acceptProcessing();
          if (ok) {
            result = await run();
          } else {
            throw err1;
          }
        } else {
          throw err1;
        }
      }

      const { content = "", bullets = [] } = result || {};
      setAi({ content, bullets });
      setSelected({});

      const hasContent = !!content?.trim();
      const hasBullets = Array.isArray(bullets) && bullets.length > 0;
      if (!hasContent && !hasBullets) {
        alert("AI returned empty result.");
        return;
      }

      const html = buildHtml({
        content,
        bullets,
        includeContent: hasContent,
        includeBullets: hasBullets,
      });

      const editorIsEmpty = normalizeHtml(localSummary).length === 0;
      const mode: "append" | "replace" = editorIsEmpty ? "replace" : insertMode;

      let next = html;
      if (mode === "append" && normalizeHtml(localSummary).length) {
        next = `${localSummary}\n<p></p>\n${html}`;
      }
      setLocalSummary(next);
      setIsLocalDirty(true);
      onUpdateProfessionalSummary({ summary: next });
      if (mode === "replace") setInsertMode("append");

      requestAnimationFrame(() => {
        const api = editorApiRef.current;
        if (!api || !api.isReady()) {
          requestAnimationFrame(() =>
            editorApiRef.current?.setHtml(html, mode)
          );
          return;
        }
        api.setHtml(html, mode);
      });
    } catch (e) {
      console.error("AI summary error:", e);
      alert(
        isProcessingNotPermitted(e)
          ? "AI processing consent is required and could not be set. Please try again."
          : "Failed to generate AI summary. Please try again."
      );
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Professional Summary
      </h2>

      <div className="md:col-span-2">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Professional Summary
          </label>

          <div className="flex items-center gap-2">
            {/* Insert mode toggle */}
            <div className="text-xs text-gray-600 dark:text-gray-300 border rounded-md overflow-hidden">
              <button
                type="button"
                onClick={() => setInsertMode("append")}
                className={`px-2 py-1 ${
                  insertMode === "append"
                    ? "bg-blue-600 text-white"
                    : "bg-transparent"
                }`}
                title="Append to the editor"
              >
                Append
              </button>
              <button
                type="button"
                onClick={() => setInsertMode("replace")}
                className={`px-2 py-1 ${
                  insertMode === "replace"
                    ? "bg-blue-600 text-white"
                    : "bg-transparent"
                }`}
                title="Replace editor content"
              >
                Replace
              </button>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generateAISuggestion}
              disabled={
                isGeneratingAI ||
                !cvId ||
                !personalInfo?.targetedJobTitle?.trim()
              }
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 disabled:opacity-50 rounded-[10px]"
              title={
                !personalInfo?.targetedJobTitle?.trim()
                  ? "Please fill in your targeted job title first"
                  : !cvId
                  ? "CV must be created first"
                  : aiConsent && !aiConsent.aiTraining
                  ? "AI training consent required, clicking will prompt"
                  : "Generate AI suggestions"
              }
            >
              {isGeneratingAI ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-8 w-8" />
                  AI Suggestions
                </>
              )}
            </Button>
          </div>
        </div>

        <QuillTextEditor
          value={localSummary}
          onChange={(value) => {
            if (normalizeHtml(value) === normalizeHtml(localSummary)) return;
            setLocalSummary(value);
            setIsLocalDirty(true);
            onUpdateProfessionalSummary({ summary: value });
          }}
          onReady={(api) => {
            editorApiRef.current = api;
            // eslint-disable-next-line no-console
            console.log("[Parent] Editor ready?", api.isReady());
          }}
          placeholder="Write a brief summary of your professional background and key achievements..."
        />
      </div>
    </div>
  );
}
