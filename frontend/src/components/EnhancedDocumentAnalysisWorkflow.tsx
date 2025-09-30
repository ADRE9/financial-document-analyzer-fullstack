import { useCallback, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { FileText, Upload, Settings, Loader2 } from "lucide-react";

import PDFUploadZone from "./PDFUploadZone";
import AnalysisReport from "./AnalysisReport";
import WorkflowProgress, {
  type WorkflowStep,
} from "./workflow/WorkflowProgress";
import AnalysisControl from "./workflow/AnalysisControl";
import { useDocumentAnalysisWorkflow } from "../hooks/useCrewAnalysis";
import { useWorkflowState } from "../hooks/useWorkflowState";
import type {
  DocumentAnalysisResponse,
  CrewAnalysisResponse,
} from "../types/api";

// Temporary adapter to convert DocumentAnalysisResponse to CrewAnalysisResponse
const adaptDocumentAnalysisToCrewAnalysis = (
  docAnalysis: DocumentAnalysisResponse
): CrewAnalysisResponse => {
  // Extract markdown content from analysis_results.raw_output
  const markdownContent =
    docAnalysis.analysis_results?.raw_output ||
    docAnalysis.analysis_results?.analysis_output ||
    docAnalysis.analysis_results?.result;

  return {
    status: docAnalysis.status,
    analysis_result: docAnalysis.analysis_results,
    execution_time: 0, // Not available in DocumentAnalysisResponse
    document_validated: true, // Assume true if we got a response
    error_message: undefined,
    markdown_content: markdownContent,
    structured_data: undefined, // Will need proper crew analysis for this
  };
};

// Strict TypeScript interfaces
interface EnhancedDocumentAnalysisWorkflowProps {
  readonly className?: string;
  readonly onWorkflowComplete?: (analysisResult: CrewAnalysisResponse) => void;
  readonly maxFileSizeBytes?: number;
  readonly allowedFileTypes?: readonly string[];
}

// Default props
const DEFAULT_PROPS = {
  className: "",
  maxFileSizeBytes: 100 * 1024 * 1024, // 100MB
  allowedFileTypes: [".pdf"] as const,
} as const;

/**
 * Enhanced Document Analysis Workflow Component
 *
 * Features:
 * - Proper TypeScript typing with readonly properties
 * - Memory leak prevention with cleanup
 * - Optimized re-renders with useMemo and useCallback
 * - Centralized state management
 * - Error boundaries and proper error handling
 * - Accessibility compliant
 */
export const EnhancedDocumentAnalysisWorkflow = ({
  className = DEFAULT_PROPS.className,
  onWorkflowComplete,
  maxFileSizeBytes = DEFAULT_PROPS.maxFileSizeBytes,
  allowedFileTypes = DEFAULT_PROPS.allowedFileTypes,
}: EnhancedDocumentAnalysisWorkflowProps) => {
  const { state, actions } = useWorkflowState();
  const { runAnalysis, isAnalyzing, analysisError, resetAnalysis } =
    useDocumentAnalysisWorkflow();

  // Memoized workflow steps to prevent unnecessary re-renders
  const workflowSteps: WorkflowStep[] = useMemo(
    () =>
      [
        {
          id: "upload",
          title: "Upload Document",
          status: state.uploadedDocument ? "completed" : "pending",
          description: state.uploadedDocument
            ? `Uploaded: ${state.uploadedDocument.filename}`
            : "Select and upload a PDF document",
          icon: <Upload className="h-5 w-5" />,
        },
        {
          id: "analyze",
          title: "AI Analysis",
          status: isAnalyzing
            ? "in-progress"
            : state.analysisResult
            ? "completed"
            : analysisError
            ? "error"
            : "pending",
          description: isAnalyzing
            ? "Running CrewAI analysis..."
            : state.analysisResult
            ? "Analysis completed successfully"
            : analysisError
            ? "Analysis failed"
            : "Run AI-powered document analysis",
          icon: isAnalyzing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Settings className="h-5 w-5" />
          ),
        },
        {
          id: "results",
          title: "View Results",
          status: state.analysisResult ? "completed" : "pending",
          description: state.analysisResult
            ? "Analysis results ready for review"
            : "Review analysis findings and insights",
          icon: <FileText className="h-5 w-5" />,
        },
      ] as const,
    [state.uploadedDocument, state.analysisResult, isAnalyzing, analysisError]
  );

  // Memoized callbacks to prevent child re-renders
  const handleUploadSuccess = useCallback(
    (document: DocumentAnalysisResponse, query?: string) => {
      actions.setUploadedDocument(document);
      actions.setAnalysisQuery(
        query || "Provide a comprehensive analysis of this financial document"
      );
      actions.setCurrentStep(1);
      toast.success("Document uploaded successfully. Ready for analysis.");
    },
    [actions]
  );

  const handleUploadError = useCallback(
    (error: string) => {
      toast.error(`Upload failed: ${error}`);
      actions.setUploadedDocument(null);
      actions.setCurrentStep(0);
    },
    [actions]
  );

  const handleRunAnalysis = useCallback(async () => {
    if (!state.uploadedDocument) {
      toast.error("Please upload a document first");
      return;
    }

    try {
      actions.setCurrentStep(1);

      // Use document ID for analysis
      const result = await runAnalysis(
        state.uploadedDocument.document_id,
        state.analysisQuery
      );
      const adaptedResult = adaptDocumentAnalysisToCrewAnalysis(result);
      actions.setAnalysisResult(adaptedResult);
      actions.setCurrentStep(2);

      toast.success("Analysis completed successfully!");
      onWorkflowComplete?.(adaptedResult);
    } catch (error) {
      console.error("Analysis failed:", error);
      let errorMessage = "Analysis failed";

      if (error instanceof Error) {
        if (error.message.includes("Cannot read properties of undefined")) {
          errorMessage =
            "CrewAI service is not available. Please check if the backend is running.";
        } else if (error.message.includes("fetch")) {
          errorMessage =
            "Network error. Please check your connection and try again.";
        } else if (error.message.includes("404")) {
          errorMessage =
            "Document not found. Please try uploading the document again.";
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(`Analysis failed: ${errorMessage}`);
    }
  }, [
    state.uploadedDocument,
    state.analysisQuery,
    runAnalysis,
    actions,
    onWorkflowComplete,
  ]);

  const handleResetWorkflow = useCallback(() => {
    actions.resetWorkflow();
    resetAnalysis();
    toast.info("Workflow reset. You can upload a new document.");
  }, [actions, resetAnalysis]);

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Cleanup any pending operations
      resetAnalysis();
    };
  }, [resetAnalysis]);

  // Early return if invalid file types
  if (!allowedFileTypes.length) {
    console.warn(
      "EnhancedDocumentAnalysisWorkflow: No allowed file types specified"
    );
    return null;
  }

  return (
    <div
      className={`space-y-6 ${className}`}
      role="main"
      aria-label="Document Analysis Workflow"
    >
      {/* Workflow Progress */}
      <WorkflowProgress
        steps={workflowSteps}
        currentStep={state.currentStep}
        onReset={handleResetWorkflow}
        showReset={Boolean(state.uploadedDocument || state.analysisResult)}
      />

      {/* Step 1: Document Upload */}
      {state.currentStep <= 1 && (
        <section aria-label="Document Upload">
          <PDFUploadZone
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
            maxSizeBytes={maxFileSizeBytes}
            className="w-full"
          />
        </section>
      )}

      {/* Step 2: Analysis Control */}
      {state.uploadedDocument &&
        state.currentStep >= 1 &&
        !state.analysisResult && (
          <section aria-label="Analysis Control">
            <AnalysisControl
              uploadedDocument={state.uploadedDocument}
              analysisQuery={state.analysisQuery}
              isAnalyzing={isAnalyzing}
              analysisError={analysisError}
              onRunAnalysis={handleRunAnalysis}
            />
          </section>
        )}

      {/* Step 3: Analysis Results */}
      {state.analysisResult && state.uploadedDocument && (
        <section aria-label="Analysis Results">
          <AnalysisReport
            analysisResult={state.analysisResult}
            documentFilename={state.uploadedDocument.filename}
            query={state.analysisQuery}
            className="w-full"
          />
        </section>
      )}
    </div>
  );
};

// Add displayName for better debugging
EnhancedDocumentAnalysisWorkflow.displayName =
  "EnhancedDocumentAnalysisWorkflow";

export default EnhancedDocumentAnalysisWorkflow;
