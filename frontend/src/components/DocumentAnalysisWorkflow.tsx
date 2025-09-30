import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { FileText, Upload, Settings, Loader2 } from "lucide-react";

import PDFUploadZone from "./PDFUploadZone";
import AnalysisReport from "./AnalysisReport";
import WorkflowProgress, {
  type WorkflowStep,
} from "./workflow/WorkflowProgress";
import AnalysisControl from "./workflow/AnalysisControl";
import { useDocumentAnalysisWorkflow } from "../hooks/useCrewAnalysis";
import { createErrorMessage } from "../utils/errorHandling";
import type {
  DocumentAnalysisResponse,
  CrewAnalysisResponse,
} from "../types/api";

interface DocumentAnalysisWorkflowProps {
  className?: string;
  onWorkflowComplete?: (analysisResult: CrewAnalysisResponse) => void;
}

export const DocumentAnalysisWorkflow = ({
  className = "",
  onWorkflowComplete,
}: DocumentAnalysisWorkflowProps) => {
  const [uploadedDocument, setUploadedDocument] =
    useState<DocumentAnalysisResponse | null>(null);
  const [analysisQuery, setAnalysisQuery] = useState<string>("");
  const [analysisResult, setAnalysisResult] =
    useState<CrewAnalysisResponse | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const { runAnalysis, isAnalyzing, analysisError, resetAnalysis } =
    useDocumentAnalysisWorkflow();

  // Memoize workflow steps to prevent unnecessary re-renders
  const workflowSteps: WorkflowStep[] = useMemo(
    () => [
      {
        id: "upload",
        title: "Upload Document",
        status: uploadedDocument ? "completed" : "pending",
        description: uploadedDocument
          ? `Uploaded: ${uploadedDocument.filename}`
          : "Select and upload a PDF document",
        icon: <Upload className="h-5 w-5" />,
      },
      {
        id: "analyze",
        title: "AI Analysis",
        status: isAnalyzing
          ? "in-progress"
          : analysisResult
          ? "completed"
          : analysisError
          ? "error"
          : "pending",
        description: isAnalyzing
          ? "Running CrewAI analysis..."
          : analysisResult
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
        status: analysisResult ? "completed" : "pending",
        description: analysisResult
          ? "Analysis results ready for review"
          : "Review analysis findings and insights",
        icon: <FileText className="h-5 w-5" />,
      },
    ],
    [uploadedDocument, isAnalyzing, analysisResult, analysisError]
  );

  const handleUploadSuccess = useCallback(
    (document: DocumentAnalysisResponse, query?: string) => {
      setUploadedDocument(document);
      setAnalysisQuery(
        query || "Provide a comprehensive analysis of this financial document"
      );
      setCurrentStep(1);
      toast.success("Document uploaded successfully. Ready for analysis.");
    },
    []
  );

  const handleUploadError = useCallback((error: string) => {
    toast.error(`Upload failed: ${error}`);
    setUploadedDocument(null);
    setCurrentStep(0);
  }, []);

  const handleRunAnalysis = useCallback(async () => {
    if (!uploadedDocument) {
      toast.error("Please upload a document first");
      return;
    }

    try {
      setCurrentStep(1);

      // Use the document ID to trigger analysis on the backend
      const result = await runAnalysis(
        uploadedDocument.document_id,
        analysisQuery
      );

      // runAnalysis returns CrewAnalysisResponse directly
      const crewResult: CrewAnalysisResponse = result as CrewAnalysisResponse;

      setAnalysisResult(crewResult);
      setCurrentStep(2);

      toast.success("Analysis completed successfully!");
      onWorkflowComplete?.(crewResult);
    } catch (error) {
      console.error("Analysis failed:", error);
      const errorMessage = createErrorMessage(error, "Analysis failed");
      toast.error(errorMessage);
    }
  }, [uploadedDocument, analysisQuery, runAnalysis, onWorkflowComplete]);

  const handleResetWorkflow = useCallback(() => {
    setUploadedDocument(null);
    setAnalysisQuery("");
    setAnalysisResult(null);
    setCurrentStep(0);
    resetAnalysis();
    toast.info("Workflow reset. You can upload a new document.");
  }, [resetAnalysis]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Workflow Progress */}
      <WorkflowProgress
        steps={workflowSteps}
        currentStep={currentStep}
        onReset={handleResetWorkflow}
        showReset={Boolean(uploadedDocument || analysisResult)}
      />

      {/* Step 1: Document Upload */}
      {currentStep <= 1 && (
        <PDFUploadZone
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          maxSizeBytes={100 * 1024 * 1024} // 100MB as per requirements
          className="w-full"
        />
      )}

      {/* Step 2: Analysis Control */}
      {uploadedDocument && currentStep >= 1 && !analysisResult && (
        <AnalysisControl
          uploadedDocument={uploadedDocument}
          analysisQuery={analysisQuery}
          isAnalyzing={isAnalyzing}
          analysisError={analysisError}
          onRunAnalysis={handleRunAnalysis}
        />
      )}

      {/* Step 3: Analysis Results */}
      {analysisResult && uploadedDocument && (
        <AnalysisReport
          analysisResult={analysisResult}
          documentFilename={uploadedDocument.filename}
          query={analysisQuery}
          className="w-full"
        />
      )}
    </div>
  );
};

export default DocumentAnalysisWorkflow;
