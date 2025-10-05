// src/components/builder/sections/SummarySection.tsx

"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { ProfessionalSummary, PersonalInfo } from "@/types/cv";
import RichTextEditor from "./RichTextEditor";
import { Button } from "@/components/ui/button";
import { cvService } from "@/services/cv/cvServiceOptimized";

interface ProfessionalSummarySectionProps {
  professionalSummary: ProfessionalSummary;
  personalInfo: PersonalInfo;
  onUpdateProfessionalSummary: (updates: Partial<ProfessionalSummary>) => void;
  onShowAIConsent?: () => void;
  aiConsent?: { aiProcessing: boolean; aiTraining: boolean } | null;
  cvId?: string;
  onCheckExistingConsent?: (
    cvId: string
  ) => Promise<{ aiProcessing: boolean; aiTraining: boolean } | null>;
}

export default function ProfessionalSummarySection({
  professionalSummary,
  personalInfo,
  onUpdateProfessionalSummary,
  onShowAIConsent,
  aiConsent,
  cvId,
  onCheckExistingConsent,
}: ProfessionalSummarySectionProps) {
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const generateAISuggestion = async () => {
    if (!personalInfo || !personalInfo.targetedJobTitle) {
      alert(
        "Please fill in your targeted job title in the Personal Information section first."
      );
      return;
    }

    if (!cvId) {
      alert(
        "CV must be created first. Please wait for the CV to be created or refresh the page."
      );
      return;
    }

    if (cvId === "undefined" || cvId === "null") {
      alert("CV ID is invalid. Please refresh the page and try again.");
      return;
    }

    // Check for AI consent - first check existing consent from CV
    let currentConsent = aiConsent;

    if (!currentConsent && cvId && onCheckExistingConsent) {
      console.log("Checking existing consent from CV...");
      currentConsent = await onCheckExistingConsent(cvId);
    }

    // If no consent found or aiProcessing is false, show consent modal
    if (!currentConsent || !currentConsent.aiProcessing) {
      console.log("No valid consent found, showing consent modal");
      if (onShowAIConsent) {
        onShowAIConsent();
      } else {
        alert(
          "AI processing consent is required. Please give consent to use AI features."
        );
      }
      return;
    }

    console.log("Valid consent found:", currentConsent);

    setIsGeneratingAI(true);

    try {
      // Call AI service for professional summary generation
      const requestData = {
        cvId: String(cvId), // Ensure cvId is a string
        tone: "professional and concise",
      };

      console.log("AI Summary Request Data:", requestData);
      console.log("cvId value:", cvId);
      console.log("cvId type:", typeof cvId);

      const summary = await cvService.generateSummary(
        "professional and concise"
      );
      console.log("AI Summary generated:", summary);

      // Update the professional summary with AI-generated content
      onUpdateProfessionalSummary({ summary });
    } catch (error) {
      console.error("Error generating AI summary:", error);
      alert("Failed to generate AI summary. Please try again.");
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={generateAISuggestion}
            disabled={
              isGeneratingAI || !personalInfo?.targetedJobTitle?.trim() || !cvId
            }
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 disabled:opacity-50"
            title={`Debug: isGeneratingAI=${isGeneratingAI}, targetedJobTitle="${
              personalInfo?.targetedJobTitle
            }", cvId="${cvId}", disabled=${
              isGeneratingAI || !personalInfo?.targetedJobTitle?.trim() || !cvId
            }`}
          >
            {isGeneratingAI ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                AI Suggestions
              </>
            )}
          </Button>
        </div>
        <RichTextEditor
          value={professionalSummary.summary || ""}
          onChange={(value) => onUpdateProfessionalSummary({ summary: value })}
          placeholder="Write a brief summary of your professional background and key achievements..."
        />
      </div>
    </div>
  );
}
