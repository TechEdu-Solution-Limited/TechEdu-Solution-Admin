import { useState, useEffect } from "react";
import { useCvManager } from "@/hooks/useCvManager";
import { ResumeSection } from "@/types";

export function useCVOperations(
  cvId: string | undefined,
  resumeData: ResumeSection[]
) {
  const [isCreating, setIsCreating] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const {
    cv,
    loading: cvLoading,
    error: cvError,
    createCv,
    updateCv,
    reorderSections,
    toggleSectionVisibility,
    saveDraft,
    publishDraft,
  } = useCvManager(cvId);

  // Auto-save functionality
  useEffect(() => {
    if (!cvId || resumeData.length === 0) return;

    const autoSaveTimer = setTimeout(() => {
      handleSaveDraft();
    }, 2000); // Auto-save every 2 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [resumeData, cvId]);

  // CV Management functions
  const handleCreateCV = async (
    personalInfo: any,
    consent?: { aiProcessing: boolean; aiTraining: boolean }
  ): Promise<string | null> => {
    if (!personalInfo.firstName || !personalInfo.lastName) {
      alert("Please fill in your first and last name before creating CV");
      return null;
    }

    setIsCreating(true);
    try {
      // Get consent from localStorage if not provided
      const savedConsent =
        consent ||
        JSON.parse(
          localStorage.getItem("cv-builder-ai-consent") ||
            '{"aiProcessing": false, "aiTraining": false}'
        );

      const cvData = {
        title: `${personalInfo.firstName} ${personalInfo.lastName} - CV`,
        sections: resumeData,
        consent: savedConsent,
      };

      const result = await createCv(cvData);
      if (result.success && result.data) {
        setLastSaved(new Date());
        alert("CV created successfully!");
        return result.data._id || null; // Return the new CV ID
      } else {
        alert("Failed to create CV. Please try again.");
        return null;
      }
    } catch (error) {
      console.error("Error creating CV:", error);
      alert("Failed to create CV. Please try again.");
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateCV = async () => {
    if (!cvId) return;

    try {
      const result = await updateCv(cvId, {
        sections: resumeData,
      });
      if (result.success) {
        setLastSaved(new Date());
        console.log("CV updated successfully");
      }
    } catch (error) {
      console.error("Error updating CV:", error);
    }
  };

  const handleSaveDraft = async () => {
    try {
      const result = await saveDraft({
        cvId: cvId,
        working: resumeData,
        isDirty: true,
      });
      if (result.success) {
        setLastSaved(new Date());
        console.log("Draft saved successfully");
      }
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  };

  const handlePublishDraft = async (personalInfo: any) => {
    if (!cvId) return;

    try {
      const result = await publishDraft(
        cvId,
        `${personalInfo.firstName} ${personalInfo.lastName} - CV`
      );
      if (result.success) {
        alert("CV published successfully!");
      }
    } catch (error) {
      console.error("Error publishing CV:", error);
      alert("Failed to publish CV. Please try again.");
    }
  };

  return {
    // State
    isCreating,
    lastSaved,
    cv,
    cvLoading,
    cvError,

    // Operations
    handleCreateCV,
    handleUpdateCV,
    handleSaveDraft,
    handlePublishDraft,
    reorderSections,
    toggleSectionVisibility,
  };
}
