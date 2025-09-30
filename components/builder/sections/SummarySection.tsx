// src/components/builder/sections/SummarySection.tsx

"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { ProfessionalSummary, PersonalInfo } from "@/types";
import RichTextEditor from "./RichTextEditor";
import { Button } from "@/components/ui/button";
import { postApiRequest } from "@/lib/apiFetch";
import { getTokenFromCookies } from "@/lib/cookies";

interface ProfessionalSummarySectionProps {
  professionalSummary: ProfessionalSummary;
  personalInfo: PersonalInfo;
  onUpdateProfessionalSummary: (updates: Partial<ProfessionalSummary>) => void;
  onShowAIConsent?: () => void;
}

export default function ProfessionalSummarySection({
  professionalSummary,
  personalInfo,
  onUpdateProfessionalSummary,
  onShowAIConsent,
}: ProfessionalSummarySectionProps) {
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const generateAISuggestion = async () => {
    if (!personalInfo || !personalInfo.targetedJobTitle) {
      alert(
        "Please fill in your targeted job title in the Personal Information section first."
      );
      return;
    }

    // Check for AI consent
    const savedConsent = localStorage.getItem("cv-builder-ai-consent");
    if (!savedConsent) {
      // Show consent modal
      if (onShowAIConsent) {
        onShowAIConsent();
      } else {
        alert(
          "AI processing consent is required. Please give consent to use AI features."
        );
      }
      return;
    }

    const consent = JSON.parse(savedConsent);
    if (!consent.aiProcessing) {
      alert(
        "AI processing consent is required. Please give consent to use AI features."
      );
      return;
    }

    setIsGeneratingAI(true);

    try {
      // Get the authentication token
      const token = getTokenFromCookies();

      if (!token) {
        alert("Please log in to use AI suggestions.");
        return;
      }

      // Call AI service for professional summary generation
      const response = await postApiRequest(`/api/cv/ai/summary`, token, {
        tone: "professional and concise",
      });

      const data: any = response.data;
      console.log("AI Summary API Response:", data);

      // Update the professional summary with AI-generated content
      if (data.summary) {
        onUpdateProfessionalSummary({ summary: data.summary });
      } else if (data.suggestions && data.suggestions.length > 0) {
        // Handle case where response has suggestions array
        onUpdateProfessionalSummary({ summary: data.suggestions[0] });
      }
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
            disabled={isGeneratingAI || !personalInfo?.targetedJobTitle?.trim()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 disabled:opacity-50"
            title={`Debug: isGeneratingAI=${isGeneratingAI}, targetedJobTitle="${
              personalInfo?.targetedJobTitle
            }", disabled=${
              isGeneratingAI || !personalInfo?.targetedJobTitle?.trim()
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
