"use client";

import { useState } from "react";
import { Award, Trash2, Sparkles, Loader2 } from "lucide-react";
import { Skill, PersonalInfo } from "@/types/cv";
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
  onCheckExistingConsent?: (
    cvId: string
  ) => Promise<{ aiProcessing: boolean; aiTraining: boolean } | null>;
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
  onCheckExistingConsent,
}: SkillsSectionProps) {
  const [isGeneratingAI, setIsGeneratingAI] = useState<string | null>(null);

  const generateAISkills = async (skillId: string) => {
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

    setIsGeneratingAI(skillId);

    try {
      // Call AI service using optimized CV service
      const data = await cvService.generateSkills(
        cvId,
        "all", // Generate all skills
        undefined, // No specific prompt
        {
          targetRole: personalInfo.targetedJobTitle,
          emphasize: [], // No specific emphasis
        }
      );

      console.log("AI Skills API Response:", data);

      // Use the first suggestion and update the skill
      if (data.skills && data.skills.length > 0) {
        const suggestedSkill = data.skills[0];
        onUpdate(skillId, "name", suggestedSkill.name || "");
        console.log("AI skill suggestion applied:", suggestedSkill);
      } else {
        console.log("No skills suggestions received from AI");
        alert(
          "No skills suggestions available. Please try again or add skills manually."
        );
      }
    } catch (error) {
      console.error("Error generating AI skills:", error);
      alert("Failed to generate AI skills. Please try again.");
    } finally {
      setIsGeneratingAI(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {/* Skills */}
        </span>
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
      </div>

      {skills.length === 0 ? (
        <div className="text-center py-12">
          <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No skills added yet
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Click &quot;Add Skill&quot; to get started
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-[10px]"
            >
              <div className="relative flex-1 flex items-center space-x-2">
                <input
                  type="text"
                  value={skill.name}
                  onChange={(e) => onUpdate(skill.id, "name", e.target.value)}
                  className="relative flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-[10px] focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Skill name"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => generateAISkills(skill.id)}
                  disabled={isGeneratingAI === skill.id || !cvId}
                  className="absolute right-1 flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 disabled:opacity-50 min-w-[60px] rounded-[5px]"
                  title={
                    !cvId
                      ? "CV must be created first"
                      : !personalInfo?.targetedJobTitle?.trim()
                      ? "Please fill in your targeted job title first"
                      : !aiConsent?.aiProcessing
                      ? "AI processing consent required - click to give consent"
                      : "Generate AI-powered skill suggestion"
                  }
                >
                  {isGeneratingAI === skill.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3" />
                      <span className="text-xs">AI</span>
                    </>
                  )}
                </Button>
              </div>
              <div className="w-32">
                <select
                  value={skill.level}
                  onChange={(e) => onUpdate(skill.id, "level", e.target.value)}
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
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
