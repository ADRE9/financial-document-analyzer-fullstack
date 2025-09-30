import { useMutation, useQuery } from "@tanstack/react-query";
import {
  runCrewAnalysis,
  getCrewHealth,
  validateDocument,
  analyzeDocument,
} from "../services/api";
import type {
  CrewAnalysisRequest,
  CrewAnalysisResponse,
  DocumentValidationResponse,
  CrewHealthResponse,
  DocumentAnalysisResponse,
} from "../types/api";

/**
 * Hook for running CrewAI analysis on documents
 */
export const useCrewAnalysis = () => {
  return useMutation<CrewAnalysisResponse, Error, CrewAnalysisRequest>({
    mutationFn: async (requestData: CrewAnalysisRequest) => {
      return await runCrewAnalysis(requestData);
    },
    retry: false, // Don't retry analysis calls automatically
  });
};

/**
 * Hook for checking CrewAI service health
 */
export const useCrewHealth = () => {
  return useQuery<CrewHealthResponse, Error>({
    queryKey: ["crew", "health"],
    queryFn: async () => {
      return await getCrewHealth();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook for validating documents without full analysis
 */
export const useDocumentValidation = () => {
  return useMutation<DocumentValidationResponse, Error, CrewAnalysisRequest>({
    mutationFn: async (requestData: CrewAnalysisRequest) => {
      return await validateDocument(requestData);
    },
    retry: false,
  });
};

/**
 * Hook for analyzing uploaded documents by ID
 */
export const useAnalyzeDocument = () => {
  return useMutation<
    DocumentAnalysisResponse,
    Error,
    { documentId: string; query?: string }
  >({
    mutationFn: async ({ documentId, query }) => {
      return await analyzeDocument(documentId, query);
    },
    retry: false,
  });
};

/**
 * Combined hook for document upload and analysis workflow
 */
export const useDocumentAnalysisWorkflow = () => {
  const analysisMutation = useAnalyzeDocument();

  const runAnalysis = async (
    documentId: string,
    query: string = "Provide a comprehensive analysis of this financial document"
  ) => {
    try {
      const result = await analysisMutation.mutateAsync({
        documentId,
        query,
      });
      return result;
    } catch (error) {
      console.error("Analysis failed:", error);
      throw error;
    }
  };

  return {
    runAnalysis,
    isAnalyzing: analysisMutation.isPending,
    analysisError: analysisMutation.error,
    analysisResult: analysisMutation.data,
    resetAnalysis: analysisMutation.reset,
  };
};
