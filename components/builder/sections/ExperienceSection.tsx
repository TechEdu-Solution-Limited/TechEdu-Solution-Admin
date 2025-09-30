"use client";

import { useState } from "react";
import { Briefcase, Sparkles, Loader2 } from "lucide-react";
import { Experience, PersonalInfo } from "@/types";
import AccordionSection from "./AccordionSection";
import RichTextEditor from "./RichTextEditor";
import { Button } from "@/components/ui/button";
import { postApiRequest } from "@/lib/apiFetch";
import { getTokenFromCookies } from "@/lib/cookies";

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
}

export default function ExperienceSection({
  experiences,
  personalInfo,
  onAdd,
  onRemove,
  onUpdate,
  onShowAIConsent,
}: ExperienceSectionProps) {
  const [isGeneratingAI, setIsGeneratingAI] = useState<string | null>(null);

  const getExperienceTitle = (exp: Experience) => {
    if (exp.position && exp.company) {
      return `${exp.position} at ${exp.company}`;
    }
    return exp.position || exp.company || "";
  };

  const generateAISuggestion = async (expId: string, jobTitle: string) => {
    if (!personalInfo || !personalInfo.industry) {
      alert(
        "Please select your industry in the Personal Information section first."
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

    setIsGeneratingAI(expId);

    try {
      // Get the authentication token
      const token = getTokenFromCookies();

      if (!token) {
        alert("Please log in to use AI suggestions.");
        return;
      }

      // Call real AI service via apiFetch helper
      const response = await postApiRequest(`/api/cv/ai/experience`, token, {
        context: {
          targetRole: jobTitle,
          industry: personalInfo?.industry || "Technology",
          additionalContext: personalInfo?.targetedJobTitle || undefined,
        },
      });

      const data: any = response.data;
      console.log("AI Experience API Response:", data);

      // Use the first suggestion and format it
      if (data.suggestions && data.suggestions.length > 0) {
        const suggestion = data.suggestions[0];
        let description = suggestion.description;

        if (
          suggestion.keyAchievements &&
          suggestion.keyAchievements.length > 0
        ) {
          description += "\n\nKey Achievements:\n";
          suggestion.keyAchievements.forEach((achievement: string) => {
            description += `• ${achievement}\n`;
          });
        }

        // Update the experience with the AI-generated description
        onUpdate(expId, "description", description);
      }
    } catch (error) {
      console.error("Error generating AI suggestions:", error);
      alert("Failed to generate AI suggestions. Please try again.");
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
                  onClick={() => generateAISuggestion(exp.id, exp.position)}
                  disabled={isGeneratingAI === exp.id || !exp.position.trim()}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                >
                  {isGeneratingAI === exp.id ? (
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
                value={exp.description || ""}
                onChange={(value) => onUpdate(exp.id, "description", value)}
                placeholder="Describe your key responsibilities and achievements..."
              />
            </div>
          </>
        )}
      </AccordionSection>
    </>
  );
}
