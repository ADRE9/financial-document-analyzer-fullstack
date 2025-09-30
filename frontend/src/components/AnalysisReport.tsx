import { useCallback } from "react";
import { TrendingUp, Shield, Target } from "lucide-react";
import type { CrewAnalysisResponse } from "../types/api";
import { ReportHeader } from "./analysis/ReportHeader";
import { RecommendationCard } from "./analysis/RecommendationCard";
import { ReportSection } from "./analysis/ReportSection";
import { MarkdownReport } from "./analysis/MarkdownReport";
import { RawDataViewer } from "./analysis/RawDataViewer";
import { ErrorAlert } from "./analysis/ErrorAlert";
import { NoResultsAlert } from "./analysis/NoResultsAlert";

interface AnalysisReportProps {
  analysisResult: CrewAnalysisResponse;
  documentFilename: string;
  query?: string;
  className?: string;
}

export const AnalysisReport = ({
  analysisResult,
  documentFilename,
  query,
  className = "",
}: AnalysisReportProps) => {
  // Handle export to markdown file
  const handleExport = useCallback(() => {
    const content =
      analysisResult.markdown_content ||
      JSON.stringify(analysisResult.analysis_result, null, 2);
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analysis-${documentFilename}-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [analysisResult, documentFilename]);

  // Handle share (copy to clipboard)
  const handleShare = useCallback(async () => {
    const content =
      analysisResult.markdown_content ||
      JSON.stringify(analysisResult.analysis_result, null, 2);
    try {
      await navigator.clipboard.writeText(content);
      alert("Analysis copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [analysisResult]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Card */}
      <ReportHeader
        documentFilename={documentFilename}
        status={analysisResult.status}
        executionTime={analysisResult.execution_time}
        documentValidated={analysisResult.document_validated}
        errorMessage={analysisResult.error_message}
        query={query}
        onExport={handleExport}
        onShare={handleShare}
      />

      {/* Error Message */}
      {analysisResult.error_message && (
        <ErrorAlert message={analysisResult.error_message} />
      )}

      {/* Investment Recommendation Badge (if available) */}
      {analysisResult.structured_data?.recommendation && (
        <RecommendationCard
          recommendation={analysisResult.structured_data.recommendation}
        />
      )}

      {/* Executive Summary */}
      {analysisResult.structured_data?.executive_summary && (
        <ReportSection
          title="Executive Summary"
          icon={TrendingUp}
          iconColor="text-blue-600"
          borderColor="border-l-blue-600"
          content={analysisResult.structured_data.executive_summary}
        />
      )}

      {/* Investment Thesis */}
      {analysisResult.structured_data?.investment_thesis && (
        <ReportSection
          title="Investment Thesis"
          icon={TrendingUp}
          iconColor="text-purple-600"
          borderColor="border-l-purple-600"
          content={analysisResult.structured_data.investment_thesis}
        />
      )}

      {/* Key Strengths */}
      {analysisResult.structured_data?.key_strengths && (
        <ReportSection
          title="Key Strengths & Opportunities"
          icon={TrendingUp}
          iconColor="text-green-600"
          borderColor="border-l-green-600"
          content={analysisResult.structured_data.key_strengths}
        />
      )}

      {/* Key Risks */}
      {analysisResult.structured_data?.key_risks && (
        <ReportSection
          title="Key Risks & Concerns"
          icon={Shield}
          iconColor="text-yellow-600"
          borderColor="border-l-yellow-600"
          content={analysisResult.structured_data.key_risks}
          bgColor="bg-yellow-50"
        />
      )}

      {/* Recommendations by Investor Profile */}
      {analysisResult.structured_data?.recommendations_section && (
        <ReportSection
          title="Recommendations by Investor Profile"
          icon={Target}
          iconColor="text-indigo-600"
          borderColor="border-l-indigo-600"
          content={analysisResult.structured_data.recommendations_section}
        />
      )}

      {/* Full Markdown Report */}
      {analysisResult.markdown_content && (
        <MarkdownReport markdownContent={analysisResult.markdown_content} />
      )}

      {/* Raw Output (for debugging) */}
      <RawDataViewer analysisResult={analysisResult.analysis_result} />

      {/* Fallback: If no markdown content is available */}
      {!analysisResult.markdown_content && !analysisResult.error_message && (
        <NoResultsAlert />
      )}
    </div>
  );
};

export default AnalysisReport;
