// src/components/builder/sections/SummarySection.tsx

"use client";

import { ProfessionalSummary } from "@/types";
import RichTextEditor from "./RichTextEditor";

interface ProfessionalSummarySectionProps {
  professionalSummary: ProfessionalSummary;
  onUpdateProfessionalSummary: (updates: Partial<ProfessionalSummary>) => void;
}

export default function ProfessionalSummarySection({
  professionalSummary,
  onUpdateProfessionalSummary,
}: ProfessionalSummarySectionProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Professional Summary
      </h2>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Professional Summary
        </label>
        <RichTextEditor
          value={professionalSummary.summary || ""}
          onChange={(value) => onUpdateProfessionalSummary({ summary: value })}
          placeholder="Write a brief summary of your professional background and key achievements..."
        />
      </div>
    </div>
  );
}
