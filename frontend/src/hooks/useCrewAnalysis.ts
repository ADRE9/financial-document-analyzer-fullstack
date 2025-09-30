// React Query hooks for CrewAI analysis operations

import { useQuery, useMutation } from "@tanstack/react-query";
import {
  runCrewAnalysis,
  getCrewHealth,
  validateDocument,
  analyzeDocument,
} from "../services/api";
import type {
  CrewAnalysisRequest,
  DocumentAnalysisResponse,
} from "../types/api";

// Query keys
export const crewKeys = {
  all: ["crew"] as const,
  health: () => [...crewKeys.all, "health"] as const,
  analyses: () => [...crewKeys.all, "analysis"] as const,
  analysis: (documentId: string) =>
    [...crewKeys.analyses(), documentId] as const,
};

// Get CrewAI health status
export const useCrewHealth = () => {
  return useQuery({
    queryKey: crewKeys.health(),
    queryFn: getCrewHealth,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

// Run CrewAI analysis mutation
export const useRunCrewAnalysis = () => {
  return useMutation({
    mutationFn: (request: CrewAnalysisRequest) => runCrewAnalysis(request),
    onError: (error) => {
      console.error("CrewAI analysis failed:", error);
    },
  });
};

// Validate document mutation
export const useValidateDocument = () => {
  return useMutation({
    mutationFn: (request: CrewAnalysisRequest) => validateDocument(request),
    onError: (error) => {
      console.error("Document validation failed:", error);
    },
  });
};

// Analyze existing document mutation
export const useAnalyzeDocument = () => {
  return useMutation({
    mutationFn: ({ id, query }: { id: string; query?: string }) =>
      analyzeDocument(id, query),
    onError: (error) => {
      console.error("Document analysis failed:", error);
    },
  });
};

// Document analysis workflow hook (wrapper around useAnalyzeDocument)
export const useDocumentAnalysisWorkflow = () => {
  const mutation = useAnalyzeDocument();

  const runAnalysis = async (documentId: string, query: string) => {
    return mutation.mutateAsync({
      id: documentId,
      query: query,
    });
  };

  const resetAnalysis = () => {
    mutation.reset();
  };

  return {
    runAnalysis,
    isAnalyzing: mutation.isPending,
    analysisError: mutation.error,
    analysisResult: mutation.data,
    resetAnalysis,
  };
};
