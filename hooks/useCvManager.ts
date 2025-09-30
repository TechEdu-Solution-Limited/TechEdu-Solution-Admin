"use client";

import { useState, useEffect, useCallback } from "react";
import { ResumeSection } from "@/types";

// Types based on the API documentation
interface CvData {
  _id?: string;
  userId?: string;
  title: string;
  sections: ResumeSection[];
  templateId?: string;
  theme?: {
    primary: string;
    secondary: string;
    font: string;
    spacing: number;
  };
  privacy?: {
    visibility: string;
    shareSlug?: string;
    allowDownload: boolean;
  };
  consent: {
    aiProcessing: boolean;
    aiTraining: boolean;
  };
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface CreateCvRequest {
  title: string;
  sections: ResumeSection[];
  consent: {
    aiProcessing: boolean;
    aiTraining: boolean;
  };
}

interface UpdateCvRequest {
  title?: string;
  sections?: ResumeSection[];
  consent?: {
    aiProcessing: boolean;
    aiTraining: boolean;
  };
}

interface DraftData {
  _id?: string;
  cvId?: string;
  working: ResumeSection[];
  isDirty: boolean;
  aiSuggestions?: {
    bullets: Array<{
      idx: number;
      old: string;
      suggestion: string;
    }>;
    headline: string;
    matchScore: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    message: string;
    details?: any[];
  };
}

// Helper function to get auth token (implement based on your auth system)
const getAuthToken = (): string => {
  // TODO: Implement based on your authentication system
  // This could be from localStorage, cookies, or a context
  return localStorage.getItem("authToken") || "";
};

// Helper function to handle API responses
const handleApiResponse = async <T>(
  response: Response
): Promise<ApiResponse<T>> => {
  const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      error: {
        message: data.message || "API request failed",
        details: data.details || [],
      },
    };
  }

  return {
    success: true,
    data: data.data || data,
    message: data.message,
  };
};

export const useCvManager = (cvId?: string) => {
  const [cv, setCv] = useState<CvData | null>(null);
  const [draft, setDraft] = useState<DraftData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error when component unmounts or cvId changes
  useEffect(() => {
    setError(null);
  }, [cvId]);

  // Create CV
  const createCv = useCallback(
    async (cvData: CreateCvRequest): Promise<ApiResponse<CvData>> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/cv", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cvData),
        });

        const result = await handleApiResponse<CvData>(response);

        if (result.success && result.data) {
          setCv(result.data);
        } else {
          setError(result.error?.message || "Failed to create CV");
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Network error";
        setError(errorMessage);
        return {
          success: false,
          error: { message: errorMessage },
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get CV
  const getCv = useCallback(
    async (id: string): Promise<ApiResponse<CvData>> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/cv/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        });

        const result = await handleApiResponse<CvData>(response);

        if (result.success && result.data) {
          setCv(result.data);
        } else {
          setError(result.error?.message || "Failed to load CV");
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Network error";
        setError(errorMessage);
        return {
          success: false,
          error: { message: errorMessage },
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Update CV
  const updateCv = useCallback(
    async (
      id: string,
      cvData: UpdateCvRequest
    ): Promise<ApiResponse<CvData>> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/cv/${id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cvData),
        });

        const result = await handleApiResponse<CvData>(response);

        if (result.success && result.data) {
          setCv(result.data);
        } else {
          setError(result.error?.message || "Failed to update CV");
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Network error";
        setError(errorMessage);
        return {
          success: false,
          error: { message: errorMessage },
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Reorder sections
  const reorderSections = useCallback(
    async (
      id: string,
      sectionOrder: string[]
    ): Promise<ApiResponse<CvData>> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/cv/${id}/reorder`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sectionOrder }),
        });

        const result = await handleApiResponse<CvData>(response);

        if (result.success && result.data) {
          setCv(result.data);
        } else {
          setError(result.error?.message || "Failed to reorder sections");
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Network error";
        setError(errorMessage);
        return {
          success: false,
          error: { message: errorMessage },
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Toggle section visibility
  const toggleSectionVisibility = useCallback(
    async (id: string, sectionId: string): Promise<ApiResponse<CvData>> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/cv/${id}/toggle-section`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sectionId }),
        });

        const result = await handleApiResponse<CvData>(response);

        if (result.success && result.data) {
          setCv(result.data);
        } else {
          setError(
            result.error?.message || "Failed to toggle section visibility"
          );
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Network error";
        setError(errorMessage);
        return {
          success: false,
          error: { message: errorMessage },
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Create/Update Draft
  const saveDraft = useCallback(
    async (
      draftData: Omit<DraftData, "_id" | "createdAt" | "updatedAt">
    ): Promise<ApiResponse<DraftData>> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/cv/drafts", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(draftData),
        });

        const result = await handleApiResponse<DraftData>(response);

        if (result.success && result.data) {
          setDraft(result.data);
        } else {
          setError(result.error?.message || "Failed to save draft");
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Network error";
        setError(errorMessage);
        return {
          success: false,
          error: { message: errorMessage },
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get Draft
  const getDraft = useCallback(
    async (draftId: string): Promise<ApiResponse<DraftData>> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/cv/drafts/${draftId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        });

        const result = await handleApiResponse<DraftData>(response);

        if (result.success && result.data) {
          setDraft(result.data);
        } else {
          setError(result.error?.message || "Failed to load draft");
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Network error";
        setError(errorMessage);
        return {
          success: false,
          error: { message: errorMessage },
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Publish Draft
  const publishDraft = useCallback(
    async (draftId: string, title: string): Promise<ApiResponse<CvData>> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/cv/publish-draft", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ draftId, title }),
        });

        const result = await handleApiResponse<CvData>(response);

        if (result.success && result.data) {
          setCv(result.data);
          setDraft(null); // Clear draft after publishing
        } else {
          setError(result.error?.message || "Failed to publish draft");
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Network error";
        setError(errorMessage);
        return {
          success: false,
          error: { message: errorMessage },
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // AI Analysis
  const analyzeWithAI = useCallback(
    async (endpoint: string, data: any): Promise<ApiResponse<any>> => {
      if (!cvId) {
        setError("CV ID is required for AI analysis");
        return {
          success: false,
          error: { message: "CV ID is required for AI analysis" },
        };
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/cv/ai/${endpoint}?cvId=${cvId}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const result = await handleApiResponse<any>(response);

        if (!result.success) {
          setError(result.error?.message || "AI analysis failed");
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Network error";
        setError(errorMessage);
        return {
          success: false,
          error: { message: errorMessage },
        };
      } finally {
        setLoading(false);
      }
    },
    [cvId]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load CV on mount if cvId is provided
  useEffect(() => {
    if (cvId) {
      getCv(cvId);
    }
  }, [cvId, getCv]);

  return {
    // State
    cv,
    draft,
    loading,
    error,

    // CV Management
    createCv,
    getCv,
    updateCv,
    reorderSections,
    toggleSectionVisibility,

    // Draft Management
    saveDraft,
    getDraft,
    publishDraft,

    // AI Features
    analyzeWithAI,

    // Utilities
    clearError,
  };
};
