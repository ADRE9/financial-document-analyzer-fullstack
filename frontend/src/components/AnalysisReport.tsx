import { useMemo } from "react";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  TrendingUp,
  DollarSign,
  Building,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import type { CrewAnalysisResponse } from "../types/api";

interface AnalysisReportProps {
  analysisResult: CrewAnalysisResponse;
  documentFilename: string;
  query?: string;
  className?: string;
}

interface ParsedAnalysisResult {
  summary?: string;
  keyFindings?: string[];
  metrics?: Record<string, any>;
  risks?: string[];
  recommendations?: string[];
  metadata?: Record<string, any>;
  rawContent?: string;
}

export const AnalysisReport = ({
  analysisResult,
  documentFilename,
  query,
  className = "",
}: AnalysisReportProps) => {
  // Parse the analysis result into structured data - memoized with proper dependencies
  const parsedResult = useMemo((): ParsedAnalysisResult => {
    const result = analysisResult.analysis_result;

    // If result is a string (raw output), try to extract key information
    if (typeof result === "string") {
      return {
        rawContent: result,
        summary:
          result.length > 200 ? result.substring(0, 200) + "..." : result,
      };
    }

    // If result is an object, extract structured data
    if (typeof result === "object" && result !== null) {
      return {
        summary:
          result.summary || result.executive_summary || result.analysis_summary,
        keyFindings: Array.isArray(result.key_findings)
          ? result.key_findings
          : Array.isArray(result.findings)
          ? result.findings
          : undefined,
        metrics:
          result.financial_metrics || result.metrics || result.key_metrics,
        risks: Array.isArray(result.risks)
          ? result.risks
          : Array.isArray(result.risk_factors)
          ? result.risk_factors
          : undefined,
        recommendations: Array.isArray(result.recommendations)
          ? result.recommendations
          : undefined,
        metadata: result.document_info || result.metadata,
        rawContent: JSON.stringify(result, null, 2),
      };
    }

    return {
      rawContent: "No analysis result available",
    };
  }, [analysisResult.analysis_result]);

  // Memoize utility functions to prevent recreation on every render
  const formatExecutionTime = useMemo(
    () =>
      (seconds: number): string => {
        if (seconds < 60) {
          return `${seconds.toFixed(1)}s`;
        }
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
      },
    []
  );

  const getStatusColor = useMemo(
    () => (status: string) => {
      switch (status.toLowerCase()) {
        case "success":
          return "text-green-600 bg-green-50";
        case "error":
          return "text-red-600 bg-red-50";
        case "warning":
          return "text-yellow-600 bg-yellow-50";
        default:
          return "text-gray-600 bg-gray-50";
      }
    },
    []
  );

  const getStatusIcon = useMemo(
    () => (status: string) => {
      switch (status.toLowerCase()) {
        case "success":
          return <CheckCircle className="h-5 w-5" />;
        case "error":
          return <AlertTriangle className="h-5 w-5" />;
        case "warning":
          return <AlertCircle className="h-5 w-5" />;
        default:
          return <Info className="h-5 w-5" />;
      }
    },
    []
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <span>Analysis Report</span>
            <Badge
              className={`ml-auto ${getStatusColor(analysisResult.status)}`}
              variant="secondary"
            >
              <div className="flex items-center space-x-1">
                {getStatusIcon(analysisResult.status)}
                <span className="capitalize">{analysisResult.status}</span>
              </div>
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FileText className="h-4 w-4" />
                <span className="font-medium">Document:</span>
                <span className="truncate">{documentFilename}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Processing Time:</span>
                <span>
                  {formatExecutionTime(analysisResult.execution_time)}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Document Validated:</span>
                <Badge
                  variant={
                    analysisResult.document_validated
                      ? "default"
                      : "destructive"
                  }
                >
                  {analysisResult.document_validated ? "Yes" : "No"}
                </Badge>
              </div>
              {query && (
                <div className="flex items-start space-x-2 text-sm text-gray-600">
                  <Info className="h-4 w-4 mt-0.5" />
                  <div>
                    <span className="font-medium">Query:</span>
                    <p className="mt-1 text-gray-700 italic">"{query}"</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {analysisResult.error_message && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-1" />
              <div>
                <h4 className="font-medium text-red-800">Analysis Error</h4>
                <p className="text-red-700 mt-1">
                  {analysisResult.error_message}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {parsedResult.summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>Executive Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              {parsedResult.summary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Key Findings */}
      {parsedResult.keyFindings && parsedResult.keyFindings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Key Findings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {parsedResult.keyFindings.map((finding, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span className="text-gray-700">{finding}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Financial Metrics */}
      {parsedResult.metrics && Object.keys(parsedResult.metrics).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span>Financial Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(parsedResult.metrics).map(([key, value]) => (
                <div key={key} className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-600 capitalize">
                    {key.replace(/_/g, " ")}
                  </div>
                  <div className="text-lg font-semibold text-gray-900 mt-1">
                    {typeof value === "object"
                      ? JSON.stringify(value)
                      : String(value)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risks */}
      {parsedResult.risks && parsedResult.risks.length > 0 && (
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span>Risk Factors</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {parsedResult.risks.map((risk, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <AlertTriangle className="flex-shrink-0 h-4 w-4 text-yellow-500 mt-1" />
                  <span className="text-gray-700">{risk}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {parsedResult.recommendations &&
        parsedResult.recommendations.length > 0 && (
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {parsedResult.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle className="flex-shrink-0 h-4 w-4 text-green-500 mt-1" />
                    <span className="text-gray-700">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

      {/* Document Metadata */}
      {parsedResult.metadata &&
        Object.keys(parsedResult.metadata).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5 text-gray-600" />
                <span>Document Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(parsedResult.metadata).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-600 capitalize min-w-0 flex-shrink-0">
                      {key.replace(/_/g, " ")}:
                    </span>
                    <span className="text-sm text-gray-800 truncate">
                      {typeof value === "object"
                        ? JSON.stringify(value)
                        : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Raw Output (expandable) */}
      {parsedResult.rawContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-gray-600" />
              <span>Raw Analysis Output</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800">
                Click to view raw analysis data
              </summary>
              <div className="mt-3 p-4 bg-gray-50 rounded-lg overflow-auto">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                  {parsedResult.rawContent}
                </pre>
              </div>
            </details>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalysisReport;
