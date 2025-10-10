"use client";

import { useState } from "react";
import { Briefcase, Sparkles, Loader2 } from "lucide-react";
import { Experience, PersonalInfo } from "@/types/cv";
import AccordionSection from "./AccordionSection";
import { Button } from "@/components/ui/button";
import QuillTextEditor from "./QuillTextEditor";
import {
  cvService,
  type ExperienceAssessment,
} from "@/services/cv/cvServiceOptimized";

interface ExperienceSectionProps {
  experiences: Experience[];
  personalInfo: PersonalInfo;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (
    id: string,
    field: keyof Experience,
    value: string | boolean
  ) => void;
  onShowAIConsent?: () => void;
  aiConsent?: { aiProcessing: boolean; aiTraining: boolean } | null;
  cvId?: string;
  onCheckExistingConsent?: (
    cvId: string
  ) => Promise<{ aiProcessing: boolean; aiTraining: boolean } | null>;
}

/* ---------------- helpers ---------------- */
function stripTags(s = "") {
  return s.replace(/<[^>]*>/g, "");
}

function normalizeHtml(s = "") {
  return s.replace(/\s+/g, " ").trim();
}

/** Build Quill-friendly HTML: rationale as <p>, topSkills as <ul><li> */
function buildExperienceHtml(rationale?: string, topSkills?: string[]) {
  const blocks: string[] = [];
  const r = (rationale || "").trim();
  if (r) blocks.push(`<p>${stripTags(r)}</p>`);

  const items = (topSkills || [])
    .map((b) => String(b || "").trim())
    .filter(Boolean)
    .map((b) => `<li>${stripTags(b)}</li>`)
    .join("");

  if (items) blocks.push(`<ul>${items}</ul>`);
  return blocks.join("");
}
/* ----------------------------------------- */

/* ---------------- extra helpers ---------------- */

// Parse "YYYY-MM" safely
function parseYyyyMm(s?: string) {
  if (!s) return null;
  const [y, m] = s.split("-").map((v) => Number(v));
  if (!Number.isFinite(y) || !Number.isFinite(m)) return null;
  // month in JS Date is 0-based
  return new Date(y, Math.max(0, Math.min(11, m - 1)), 1);
}

function yearsBetween(start?: string, end?: string, current?: boolean) {
  const startDt = parseYyyyMm(start);
  const endDt = current ? new Date() : parseYyyyMm(end) || new Date();
  if (!startDt || !endDt) return 0;

  const months =
    (endDt.getFullYear() - startDt.getFullYear()) * 12 +
    (endDt.getMonth() - startDt.getMonth());
  if (!Number.isFinite(months) || months < 0) return 0;

  // floor to integer years for minYears (API expects an int)
  return Math.floor(months / 12);
}

function buildExperienceRationale(
  targetRole: string,
  industry: string,
  years: number
) {
  return [
    `Produce a crisp, impact-focused rationale and a prioritized skills list for a ${targetRole} in ${industry} with ${Math.max(
      years,
      0
    )}+ years of relevant experience.`,
    "Write in a professional, concise tone. Quantify outcomes (%, time, $) where reasonable.",
    "Start bullets with strong verbs and keep one idea per bullet.",
    "Return 5–9 precise, role-aligned skills (deduplicated, ATS-friendly; no soft-skill fluff).",
    'Avoid meta phrases like "CV indicates", "based on the CV", "CV lacks", "role with no prior history" or "the candidate".',
    "Return only content — no preamble or explanations.",
  ].join(" ");
}
/* ---------------------------------------------- */

export default function ExperienceSection({
  experiences,
  personalInfo,
  onAdd,
  onRemove,
  onUpdate,
  onShowAIConsent,
  aiConsent,
  cvId,
}: ExperienceSectionProps) {
  const [isGeneratingAI, setIsGeneratingAI] = useState<string | null>(null);

  const getExperienceTitle = (exp: Experience) => {
    if (exp.position && exp.company) {
      return `${exp.position} at ${exp.company}`;
    }
    return exp.position || exp.company || "";
  };

  const generateAISuggestion = async (
    expId: string,
    jobTitle: string,
    company: string
  ) => {
    if (!personalInfo || !personalInfo.industry) {
      alert(
        "Please select your industry in the Personal Information section first."
      );
      return;
    }

    // Always fetch latest consent from server by CV id
    let currentConsent = aiConsent as {
      aiProcessing: boolean;
      aiTraining: boolean;
    } | null;
    try {
      if (cvId) {
        const cv = await cvService.getCV(String(cvId));
        const serverConsent = cv?.consent;
        if (serverConsent) {
          currentConsent = {
            aiProcessing: !!serverConsent.aiProcessing,
            aiTraining: !!serverConsent.aiTraining,
          };
        }
      }
    } catch {
      // fall back to local aiConsent
    }

    if (
      !currentConsent ||
      !currentConsent.aiProcessing ||
      !currentConsent.aiTraining
    ) {
      if (onShowAIConsent) onShowAIConsent();
      else
        alert(
          "AI processing and AI training consent are required. Please give consent to use AI features."
        );
      return;
    }

    setIsGeneratingAI(expId);

    try {
      const exp = experiences.find((e) => e.id === expId);
      const years = yearsBetween(exp?.startDate, exp?.endDate, exp?.current);

      const targetRole = (jobTitle || personalInfo?.targetedJobTitle).trim();
      const industry = (personalInfo?.industry || "General").trim();
      const rationale = buildExperienceRationale(targetRole, industry, years);

      // Optional: pass a bit of seed context for sharper results
      const seedExperience = {
        title: jobTitle || undefined,
        company: company || undefined,
        // responsibilities: [], // you can populate from your UI if you collect them
        // wins: [],             // same here
      };

      const data = await cvService.generateExperience(String(cvId), {
        targetRole,
        industry,
        rationale,
        minYears: years, // ✅ real years derived from dates
        seedExperience, // ✅ optional extra signal
      });

      const html = buildExperienceHtml(data?.rationale, data?.topSkills);
      if (!html) {
        alert("AI did not return any content for this experience.");
        return;
      }

      onUpdate(expId, "description", html);
    } catch (error) {
      console.error("Error generating AI suggestions:", error);
      alert(
        (error as Error)?.message ||
          "Failed to generate AI suggestions. Please try again."
      );
    } finally {
      setIsGeneratingAI(null);
    }
  };

  return (
    <>
      <AccordionSection
        title="Work Experience"
        items={experiences}
        emptyStateIcon={Briefcase}
        emptyStateTitle="No work experience added yet"
        emptyStateDescription='Click "Add Experience" to get started'
        addButtonText="Add Experience"
        onAdd={onAdd}
        onRemove={onRemove}
        getItemTitle={getExperienceTitle}
      >
        {(exp: Experience) => (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => onUpdate(exp.id, "company", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Position
                </label>
                <input
                  type="text"
                  value={exp.position}
                  onChange={(e) => onUpdate(exp.id, "position", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Job title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={exp.location || ""}
                  onChange={(e) => onUpdate(exp.id, "location", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="City, State"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="month"
                  value={exp.startDate}
                  onChange={(e) =>
                    onUpdate(exp.id, "startDate", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="month"
                  value={exp.endDate || ""}
                  onChange={(e) => onUpdate(exp.id, "endDate", e.target.value)}
                  disabled={exp.current}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={exp.current}
                  onChange={(e) =>
                    onUpdate(exp.id, "current", e.target.checked)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Currently working here
                </label>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    generateAISuggestion(exp.id, exp.position, exp.company)
                  }
                  disabled={
                    isGeneratingAI === exp.id || !exp.position.trim() || !cvId
                  }
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 disabled:opacity-50 rounded-[10px]"
                  title={
                    !exp.position.trim()
                      ? "Please enter a job position first"
                      : !cvId
                      ? "CV must be created first"
                      : !aiConsent?.aiProcessing
                      ? "AI processing consent required - click to give consent"
                      : "Generate AI-powered experience description"
                  }
                >
                  {isGeneratingAI === exp.id ? (
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

              {/* 🔄 Quill Text Editor (controlled) */}
              <QuillTextEditor
                value={exp.description || ""}
                onChange={(value) => {
                  // avoid noisy updates if identical
                  if (
                    normalizeHtml(value) ===
                    normalizeHtml(exp.description || "")
                  )
                    return;
                  onUpdate(exp.id, "description", value);
                }}
                placeholder="Describe your key responsibilities and achievements..."
              />
            </div>
          </>
        )}
      </AccordionSection>
    </>
  );
}
