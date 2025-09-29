import { useMutation, useQuery } from "@tanstack/react-query";
import {
  runCrewAnalysis,
  getCrewHealth,
  validateDocument,
} from "../services/api";
import type {
  CrewAnalysisRequest,
  CrewAnalysisResponse,
  DocumentValidationResponse,
  CrewHealthResponse,
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
 * Combined hook for document upload and analysis workflow
 */
export const useDocumentAnalysisWorkflow = () => {
  const analysisMutation = useCrewAnalysis();

  const runAnalysis = async (
    documentPath: string,
    query: string = "Provide a comprehensive analysis of this financial document"
  ) => {
    try {
      const result = await analysisMutation.mutateAsync({
        document_path: documentPath,
        query: query,
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
