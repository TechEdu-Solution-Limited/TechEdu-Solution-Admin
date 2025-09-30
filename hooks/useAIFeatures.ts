"use client";

import { useState, useCallback } from "react";
import { useCvManager } from "./useCvManager";

interface AIAnalysisResult {
  success: boolean;
  data?: any;
  error?: {
    message: string;
    details?: any[];
  };
}

interface ExperienceAnalysisContext {
  targetRole?: string;
  industry?: string;
  companySize?: string;
  region?: string;
}

interface ExperienceAnalysisRequest {
  context?: ExperienceAnalysisContext;
  prompt?: string;
}

interface SummaryGenerationRequest {
  tone?: string;
  prompt?: string;
  context?: {
    targetRole?: string;
  };
}

interface SkillsExtractionRequest {
  level?: "top-5" | "all";
  context?: {
    targetRole?: string;
  };
}

interface MatchScoreRequest {
  jobDescription?: string;
  context?: {
    targetRole?: string;
    industry?: string;
  };
}

interface SectionAnalysisRequest {
  context?: {
    purpose?: string;
    targetRole?: string;
  };
  prompt?: string;
}

export const useAIFeatures = (cvId?: string) => {
  const { analyzeWithAI, loading, error } = useCvManager(cvId);
  const [aiResults, setAiResults] = useState<Record<string, any>>({});

  // Experience Analysis
  const analyzeExperience = useCallback(
    async (
      request: ExperienceAnalysisRequest = {}
    ): Promise<AIAnalysisResult> => {
      const result = await analyzeWithAI("experience", request);

      if (result.success && result.data) {
        setAiResults((prev) => ({
          ...prev,
          experience: result.data,
        }));
      }

      return result;
    },
    [analyzeWithAI]
  );

  // Summary Generation
  const generateSummary = useCallback(
    async (
      request: SummaryGenerationRequest = {}
    ): Promise<AIAnalysisResult> => {
      const result = await analyzeWithAI("summary", request);

      if (result.success && result.data) {
        setAiResults((prev) => ({
          ...prev,
          summary: result.data,
        }));
      }

      return result;
    },
    [analyzeWithAI]
  );

  // Skills Extraction
  const extractSkills = useCallback(
    async (
      request: SkillsExtractionRequest = {}
    ): Promise<AIAnalysisResult> => {
      const result = await analyzeWithAI("skills", request);

      if (result.success && result.data) {
        setAiResults((prev) => ({
          ...prev,
          skills: result.data,
        }));
      }

      return result;
    },
    [analyzeWithAI]
  );

  // Match Score Analysis
  const getMatchScore = useCallback(
    async (request: MatchScoreRequest = {}): Promise<AIAnalysisResult> => {
      const result = await analyzeWithAI("match-score", request);

      if (result.success && result.data) {
        setAiResults((prev) => ({
          ...prev,
          matchScore: result.data,
        }));
      }

      return result;
    },
    [analyzeWithAI]
  );

  // Section-specific AI Analysis
  const analyzePersonalInfo = useCallback(
    async (request: SectionAnalysisRequest = {}): Promise<AIAnalysisResult> => {
      const result = await analyzeWithAI("section/personal-info", request);

      if (result.success && result.data) {
        setAiResults((prev) => ({
          ...prev,
          personalInfo: result.data,
        }));
      }

      return result;
    },
    [analyzeWithAI]
  );

  const enhanceWorkExperience = useCallback(
    async (request: SectionAnalysisRequest = {}): Promise<AIAnalysisResult> => {
      const result = await analyzeWithAI("section/work-experience", request);

      if (result.success && result.data) {
        setAiResults((prev) => ({
          ...prev,
          workExperience: result.data,
        }));
      }

      return result;
    },
    [analyzeWithAI]
  );

  const formatEducation = useCallback(
    async (request: SectionAnalysisRequest = {}): Promise<AIAnalysisResult> => {
      const result = await analyzeWithAI("section/education", request);

      if (result.success && result.data) {
        setAiResults((prev) => ({
          ...prev,
          education: result.data,
        }));
      }

      return result;
    },
    [analyzeWithAI]
  );

  const prioritizeSkills = useCallback(
    async (request: SectionAnalysisRequest = {}): Promise<AIAnalysisResult> => {
      const result = await analyzeWithAI("section/skills", request);

      if (result.success && result.data) {
        setAiResults((prev) => ({
          ...prev,
          skills: result.data,
        }));
      }

      return result;
    },
    [analyzeWithAI]
  );

  const summarizeProjects = useCallback(
    async (request: SectionAnalysisRequest = {}): Promise<AIAnalysisResult> => {
      const result = await analyzeWithAI("section/projects", request);

      if (result.success && result.data) {
        setAiResults((prev) => ({
          ...prev,
          projects: result.data,
        }));
      }

      return result;
    },
    [analyzeWithAI]
  );

  // Clear specific AI result
  const clearAIResult = useCallback((key: string) => {
    setAiResults((prev) => {
      const newResults = { ...prev };
      delete newResults[key];
      return newResults;
    });
  }, []);

  // Clear all AI results
  const clearAllAIResults = useCallback(() => {
    setAiResults({});
  }, []);

  return {
    // State
    aiResults,
    loading,
    error,

    // Core AI Features
    analyzeExperience,
    generateSummary,
    extractSkills,
    getMatchScore,

    // Section-specific AI Features
    analyzePersonalInfo,
    enhanceWorkExperience,
    formatEducation,
    prioritizeSkills,
    summarizeProjects,

    // Utilities
    clearAIResult,
    clearAllAIResults,
  };
};
