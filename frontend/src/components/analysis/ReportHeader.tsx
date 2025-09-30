import { FileText, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { ReportActions } from "./ReportActions";

interface ReportHeaderProps {
  documentFilename: string;
  status: string;
  executionTime: number;
  documentValidated: boolean;
  errorMessage?: string;
  query?: string;
  onExport: () => void;
  onShare: () => void;
}

const formatExecutionTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
};

const getStatusColor = (status: string): string => {
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
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "success":
      return <CheckCircle className="h-5 w-5" />;
    case "error":
    case "warning":
      return <AlertTriangle className="h-5 w-5" />;
    default:
      return <FileText className="h-5 w-5" />;
  }
};

export const ReportHeader = ({
  documentFilename,
  status,
  executionTime,
  documentValidated,
  errorMessage,
  query,
  onExport,
  onShare,
}: ReportHeaderProps) => {
  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Analysis Report
              </h2>
              <p className="text-sm text-gray-600 font-normal mt-1">
                AI-powered financial document analysis
              </p>
            </div>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <ReportActions onExport={onExport} onShare={onShare} />
            <Badge
              className={`${getStatusColor(status)} px-3 py-1`}
              variant="secondary"
            >
              <div className="flex items-center space-x-1">
                {getStatusIcon(status)}
                <span className="capitalize font-semibold">{status}</span>
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
              <p className="text-sm text-gray-900 truncate font-semibold">
                {documentFilename}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
            <Clock className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-xs text-gray-500 font-medium">
                Processing Time
              </p>
              <p className="text-sm text-gray-900 font-semibold">
                {formatExecutionTime(executionTime)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
            {documentValidated ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
            <div>
              <p className="text-xs text-gray-500 font-medium">Validation</p>
              <Badge
                variant={documentValidated ? "default" : "destructive"}
                className="font-semibold"
              >
                {documentValidated ? "Valid" : "Invalid"}
              </Badge>
            </div>
          </div>
        </div>
        {!documentValidated && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Document Validation Failed</AlertTitle>
            <AlertDescription>
              The uploaded document could not be validated as a financial
              document. Please ensure you are uploading a valid financial
              document such as an annual report, financial statement, or similar
              document.
              {errorMessage && (
                <div className="mt-2 text-sm">
                  Error details: {errorMessage}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
        {query && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-sm font-semibold text-blue-900">
                  Analysis Query:
                </span>
                <p className="text-sm text-blue-800 italic mt-1">"{query}"</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
