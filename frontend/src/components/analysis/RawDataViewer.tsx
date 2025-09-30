import { useState } from "react";
import { Info, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface RawDataViewerProps {
  analysisResult: Record<string, unknown>;
}

export const RawDataViewer = ({ analysisResult }: RawDataViewerProps) => {
  const [showRawOutput, setShowRawOutput] = useState(false);

  return (
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
              {JSON.stringify(analysisResult, null, 2)}
            </pre>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
