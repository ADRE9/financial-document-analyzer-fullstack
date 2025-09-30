import { useState, useCallback, useEffect } from "react";
import type {
  DocumentAnalysisResponse,
  CrewAnalysisResponse,
} from "../types/api";

interface WorkflowState {
  uploadedDocument: DocumentAnalysisResponse | null;
  analysisQuery: string;
  analysisResult: CrewAnalysisResponse | null;
  currentStep: number;
}

interface UseWorkflowStateReturn {
  state: WorkflowState;
  actions: {
    setUploadedDocument: (document: DocumentAnalysisResponse | null) => void;
    setAnalysisQuery: (query: string) => void;
    setAnalysisResult: (result: CrewAnalysisResponse | null) => void;
    setCurrentStep: (step: number) => void;
    resetWorkflow: () => void;
  };
}

const initialState: WorkflowState = {
  uploadedDocument: null,
  analysisQuery: "",
  analysisResult: null,
  currentStep: 0,
};

/**
 * Hook for managing document analysis workflow state
 * Provides centralized state management with proper cleanup
 */
export const useWorkflowState = (): UseWorkflowStateReturn => {
  const [state, setState] = useState<WorkflowState>(initialState);

  // Individual setters with proper state updates
  const setUploadedDocument = useCallback(
    (document: DocumentAnalysisResponse | null) => {
      setState((prevState) => ({
        ...prevState,
        uploadedDocument: document,
      }));
    },
    []
  );

  const setAnalysisQuery = useCallback((query: string) => {
    setState((prevState) => ({
      ...prevState,
      analysisQuery: query,
    }));
  }, []);

  const setAnalysisResult = useCallback(
    (result: CrewAnalysisResponse | null) => {
      setState((prevState) => ({
        ...prevState,
        analysisResult: result,
      }));
    },
    []
  );

  const setCurrentStep = useCallback((step: number) => {
    setState((prevState) => ({
      ...prevState,
      currentStep: step,
    }));
  }, []);

  const resetWorkflow = useCallback(() => {
    setState(initialState);
  }, []);

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Cleanup any pending operations when component unmounts
      setState(initialState);
    };
  }, []);

  return {
    state,
    actions: {
      setUploadedDocument,
      setAnalysisQuery,
      setAnalysisResult,
      setCurrentStep,
      resetWorkflow,
    },
  };
};
