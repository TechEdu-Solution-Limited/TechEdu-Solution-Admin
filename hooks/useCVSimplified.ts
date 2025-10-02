import { useState, useCallback } from "react";
import { cvService, CreateCVRequest } from "@/services/cvServiceOptimized";

export function useCVSimplified() {
  const [cvId, setCvId] = useState<string | undefined>(undefined);
  const [draftId, setDraftId] = useState<string | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Create CV
  const createCV = useCallback(
    async (
      personalInfo: any,
      sections: any[],
      consent?: any
    ): Promise<string | null> => {
      setIsCreating(true);
      try {
        const cvData = cvService.createCVData(personalInfo, sections, consent);
        const newCvId = await cvService.createCV(cvData);
        setCvId(newCvId);
        setLastSaved(new Date());
        console.log("CV created successfully:", newCvId);
        return newCvId;
      } catch (error) {
        console.error("Failed to create CV:", error);
        alert("Failed to create CV. Please try again.");
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    []
  );

  // Update CV
  const updateCV = useCallback(
    async (personalInfo: any, sections: any[]): Promise<void> => {
      if (!cvId) return;

      setIsUpdating(true);
      try {
        const cvData = cvService.createCVData(personalInfo, sections);
        await cvService.updateCV(cvId, cvData);
        setLastSaved(new Date());
        console.log("CV updated successfully");
      } catch (error) {
        console.error("Failed to update CV:", error);
      } finally {
        setIsUpdating(false);
      }
    },
    [cvId]
  );

  // Save Draft with working data - prevents multiple drafts
  const saveDraft = useCallback(
    async (personalInfo: any, sections: any[]): Promise<void> => {
      try {
        const draftData = {
          cvId: cvId,
          working: sections,
          isDirty: true,
          draftId: draftId, // Include existing draftId to update instead of create
        };
        const newDraftId = await cvService.createOrUpdateDraft(draftData);

        // Store the draftId for future updates
        if (!draftId) {
          setDraftId(newDraftId);
        }

        setLastSaved(new Date());
        console.log("Draft saved/updated successfully:", newDraftId);
      } catch (error) {
        console.error("Failed to save draft:", error);
      }
    },
    [cvId, draftId]
  );

  // Publish CV from draft
  const publishCV = useCallback(
    async (draftId: string): Promise<string | null> => {
      try {
        const publishedCvId = await cvService.publishCV(draftId);
        setLastSaved(new Date());
        console.log("CV published successfully:", publishedCvId);
        return publishedCvId;
      } catch (error) {
        console.error("Failed to publish CV:", error);
        return null;
      }
    },
    []
  );

  // Load CV
  const loadCV = useCallback(async (id: string): Promise<any> => {
    try {
      const cvData = await cvService.getCV(id);
      setCvId(id);
      return cvData;
    } catch (error) {
      console.error("Failed to load CV:", error);
      return null;
    }
  }, []);

  // Generate AI Summary
  const generateSummary = useCallback(
    async (
      tone: string = "professional and concise"
    ): Promise<string | null> => {
      if (!cvId) return null;

      try {
        const summary = await cvService.generateSummary(cvId, tone);
        return summary;
      } catch (error) {
        console.error("Failed to generate summary:", error);
        return null;
      }
    },
    [cvId]
  );

  // Publish draft (same as updateCV for now)
  const publishDraft = useCallback(
    async (personalInfo: any, sections: any[]): Promise<void> => {
      if (!cvId) return;
      await updateCV(personalInfo, sections);
    },
    [cvId, updateCV]
  );

  return {
    cvId,
    draftId,
    isCreating,
    isUpdating,
    lastSaved,
    createCV,
    updateCV,
    saveDraft,
    loadCV,
    generateSummary,
    publishDraft,
    publishCV,
    // Legacy method names for compatibility
    handleCreateCV: createCV,
    handleUpdateCV: updateCV,
    handleSaveDraft: saveDraft,
    handleLoadCV: loadCV,
    handlePublishDraft: publishDraft,
    cvLoading: isCreating || isUpdating,
    cvError: null,
  };
}
