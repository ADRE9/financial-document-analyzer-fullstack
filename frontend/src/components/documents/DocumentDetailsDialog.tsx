import { FileText } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import type { DocumentAnalysisResponse } from "../../types/api";
import { DocumentStatusBadge } from "./DocumentStatusBadge";
import { getDocumentTypeLabel, formatDate } from "./DocumentTypeUtils";

interface DocumentDetailsDialogProps {
  document: DocumentAnalysisResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentDetailsDialog = ({
  document,
  isOpen,
  onClose,
}: DocumentDetailsDialogProps) => {
  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>{document.filename}</span>
          </DialogTitle>
          <DialogDescription>
            Document analysis results and metadata
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Document Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Document Type</h4>
              <Badge variant="outline">
                {getDocumentTypeLabel(document.document_type)}
              </Badge>
            </div>
            <div>
              <h4 className="font-medium mb-2">Status</h4>
              <DocumentStatusBadge status={document.status} />
            </div>
            <div>
              <h4 className="font-medium mb-2">Upload Date</h4>
              <p className="text-sm text-gray-600">
                {formatDate(document.processed_at)}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Confidence Score</h4>
              <p className="text-sm text-gray-600">
                {document.confidence_score > 0
                  ? `${Math.round(document.confidence_score * 100)}%`
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* Analysis Results */}
          {document.analysis_results &&
            Object.keys(document.analysis_results).length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Analysis Results</h4>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(document.analysis_results, null, 2)}
                  </pre>
                </div>
              </div>
            )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
