import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Shield,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import type { CrewAnalysisResponse } from "../types/api";

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
  const [showRawOutput, setShowRawOutput] = useState(false);
  const [showFullMarkdown, setShowFullMarkdown] = useState(false);

  // Format execution time
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

  // Get status styling
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
          return <AlertTriangle className="h-5 w-5" />;
        default:
          return <Info className="h-5 w-5" />;
      }
    },
    []
  );

  // Extract recommendation badge variant
  const getRecommendationVariant = (recommendation: string) => {
    const rec = recommendation.toLowerCase();
    if (rec.includes("buy") || rec.includes("strong buy")) {
      return "default"; // Green
    } else if (rec.includes("sell") || rec.includes("strong sell")) {
      return "destructive"; // Red
    } else if (rec.includes("hold")) {
      return "secondary"; // Gray
    }
    return "outline";
  };

  // Handle export to PDF
  const handleExport = () => {
    // Create a blob from the markdown content
    const content = analysisResult.markdown_content || JSON.stringify(analysisResult.analysis_result, null, 2);
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-${documentFilename}-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle share (copy to clipboard)
  const handleShare = async () => {
    const content = analysisResult.markdown_content || JSON.stringify(analysisResult.analysis_result, null, 2);
    try {
      await navigator.clipboard.writeText(content);
      alert("Analysis copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Card */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Analysis Report</h2>
                <p className="text-sm text-gray-600 font-normal mt-1">
                  AI-powered financial document analysis
                </p>
              </div>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex items-center space-x-1"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center space-x-1"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </Button>
              <Badge
                className={`${getStatusColor(analysisResult.status)} px-3 py-1`}
                variant="secondary"
              >
                <div className="flex items-center space-x-1">
                  {getStatusIcon(analysisResult.status)}
                  <span className="capitalize font-semibold">{analysisResult.status}</span>
                </div>
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
              <FileText className="h-5 w-5 text-blue-600" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 font-medium">Document</p>
                <p className="text-sm text-gray-900 truncate font-semibold">{documentFilename}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
              <Clock className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Processing Time</p>
                <p className="text-sm text-gray-900 font-semibold">
                  {formatExecutionTime(analysisResult.execution_time)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Validation</p>
                <Badge
                  variant={
                    analysisResult.document_validated
                      ? "default"
                      : "destructive"
                  }
                  className="font-semibold"
                >
                  {analysisResult.document_validated ? "Valid" : "Invalid"}
                </Badge>
              </div>
            </div>
          </div>
          {query && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-semibold text-blue-900">Analysis Query:</span>
                  <p className="text-sm text-blue-800 italic mt-1">"{query}"</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Message */}
      {analysisResult.error_message && (
        <Card className="border-2 border-red-300 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-900 text-lg">Analysis Error</h4>
                <p className="text-red-700 mt-2 leading-relaxed">
                  {analysisResult.error_message}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Investment Recommendation Badge (if available) */}
      {analysisResult.structured_data?.recommendation && (
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-6 w-6 text-green-600" />
              <span>Investment Recommendation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Badge 
                variant={getRecommendationVariant(analysisResult.structured_data.recommendation)}
                className="text-2xl font-bold px-6 py-3"
              >
                {analysisResult.structured_data.recommendation.toUpperCase()}
              </Badge>
              <p className="text-gray-600 text-sm">
                Based on comprehensive financial analysis and market conditions
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Executive Summary */}
      {analysisResult.structured_data?.executive_summary && (
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>Executive Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {analysisResult.structured_data.executive_summary}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Investment Thesis */}
      {analysisResult.structured_data?.investment_thesis && (
        <Card className="border-l-4 border-l-purple-600">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span>Investment Thesis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {analysisResult.structured_data.investment_thesis}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Strengths */}
      {analysisResult.structured_data?.key_strengths && (
        <Card className="border-l-4 border-l-green-600">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Key Strengths & Opportunities</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {analysisResult.structured_data.key_strengths}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Risks */}
      {analysisResult.structured_data?.key_risks && (
        <Card className="border-l-4 border-l-yellow-600 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-yellow-600" />
              <span>Key Risks & Concerns</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {analysisResult.structured_data.key_risks}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations by Investor Profile */}
      {analysisResult.structured_data?.recommendations_section && (
        <Card className="border-l-4 border-l-indigo-600">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-indigo-600" />
              <span>Recommendations by Investor Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {analysisResult.structured_data.recommendations_section}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Markdown Report */}
      {analysisResult.markdown_content && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-gray-700" />
                <span>Full Analysis Report</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullMarkdown(!showFullMarkdown)}
                className="flex items-center space-x-1"
              >
                {showFullMarkdown ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    <span>Collapse</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    <span>Expand</span>
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          {showFullMarkdown && (
            <CardContent>
              <div className="prose prose-sm lg:prose-base max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Custom styling for headings
                    h1: ({node, ...props}) => (
                      <h1 className="text-3xl font-bold text-blue-900 border-b-2 border-blue-200 pb-2 mb-4" {...props} />
                    ),
                    h2: ({node, ...props}) => (
                      <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4" {...props} />
                    ),
                    h3: ({node, ...props}) => (
                      <h3 className="text-xl font-semibold text-gray-700 mt-6 mb-3" {...props} />
                    ),
                    // Custom styling for lists
                    ul: ({node, ...props}) => (
                      <ul className="space-y-2 my-4" {...props} />
                    ),
                    li: ({node, ...props}) => (
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-500 mt-2">•</span>
                        <span className="flex-1" {...props} />
                      </li>
                    ),
                    // Custom styling for strong/bold text
                    strong: ({node, ...props}) => (
                      <strong className="font-bold text-gray-900" {...props} />
                    ),
                    // Custom styling for code blocks
                    code: ({node, className, children, ...props}) => {
                      const isInline = !className;
                      return isInline ? (
                        <code className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                          {children}
                        </code>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                    // Custom styling for blockquotes
                    blockquote: ({node, ...props}) => (
                      <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 italic" {...props} />
                    ),
                  }}
                >
                  {analysisResult.markdown_content}
                </ReactMarkdown>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Raw Output Toggle (for debugging) */}
      <Card className="border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">Raw Analysis Data</span>
              <Badge variant="outline" className="text-xs">
                Developer View
              </Badge>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRawOutput(!showRawOutput)}
              className="flex items-center space-x-1"
            >
              {showRawOutput ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  <span>Hide</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  <span>Show</span>
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {showRawOutput && (
          <CardContent>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-auto max-h-96">
              <pre className="text-xs font-mono whitespace-pre-wrap">
                {JSON.stringify(analysisResult.analysis_result, null, 2)}
              </pre>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Fallback: If no markdown content is available, show a message */}
      {!analysisResult.markdown_content && !analysisResult.error_message && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-yellow-600 mt-1" />
              <div>
                <h4 className="font-medium text-yellow-800">No Formatted Results</h4>
                <p className="text-yellow-700 mt-1">
                  The analysis completed, but no markdown content was returned. 
                  Check the raw data above for results.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalysisReport;