import { useState, useCallback } from "react";
import cvApi, {
  AIExperienceRequest,
  AIExperienceResponse,
} from "@/lib/api/cvApi";

interface UseAIFeaturesReturn {
  isAnalyzing: boolean;
  error: string | null;
  analyzeExperience: (
    jobTitle: string,
    description: string
  ) => Promise<AIExperienceResponse | null>;
  clearError: () => void;
}

export function useAIFeatures(): UseAIFeaturesReturn {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const analyzeExperience = useCallback(
    async (
      jobTitle: string,
      description: string
    ): Promise<AIExperienceResponse | null> => {
      setIsAnalyzing(true);
      setError(null);

      try {
        const request: AIExperienceRequest = {
          jobTitle,
          description,
        };

        const response = await cvApi.analyzeExperience(request);

        console.log("Experience analysis completed:", response);
        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to analyze experience";
        setError(errorMessage);
        console.error("Error analyzing experience:", err);
        return null;
      } finally {
        setIsAnalyzing(false);
      }
    },
    []
  );

  return {
    isAnalyzing,
    error,
    analyzeExperience,
    clearError,
  };
}

export default useAIFeatures;
