import { memo } from "react";
import { FileText, Settings, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import type { DocumentAnalysisResponse } from "../../types/api";

interface AnalysisControlProps {
  uploadedDocument: DocumentAnalysisResponse;
  analysisQuery: string;
  isAnalyzing: boolean;
  analysisError: Error | null;
  onRunAnalysis: () => void;
}

export const AnalysisControl = memo<AnalysisControlProps>(
  ({
    uploadedDocument,
    analysisQuery,
    isAnalyzing,
    analysisError,
    onRunAnalysis,
  }) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-blue-600" />
            <span>Run Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-blue-600 mt-1" />
              <div>
                <h4 className="font-medium text-blue-900">
                  Ready for Analysis
                </h4>
                <p className="text-blue-700 text-sm mt-1">
                  Document "{uploadedDocument.filename}" has been uploaded
                  successfully.
                </p>
                {analysisQuery && (
                  <div className="mt-2">
                    <span className="text-blue-800 font-medium">Query: </span>
                    <span className="text-blue-700 italic">
                      "{analysisQuery}"
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={onRunAnalysis}
              disabled={isAnalyzing}
              size="lg"
              className="flex items-center space-x-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Settings className="h-5 w-5" />
                  <span>Run AI Analysis</span>
                </>
              )}
            </Button>
          </div>

          {analysisError && (
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-1" />
                <div>
                  <h4 className="font-medium text-red-900">Analysis Error</h4>
                  <p className="text-red-700 text-sm mt-1">
                    {analysisError.message}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRunAnalysis}
                    className="mt-2"
                  >
                    Retry Analysis
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);

AnalysisControl.displayName = "AnalysisControl";

export default AnalysisControl;
