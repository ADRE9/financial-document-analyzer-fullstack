import { Eye, MoreHorizontal, Trash2, Lock, Play } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import type { DocumentAnalysisResponse } from "../../types/api";
import { DocumentStatusIcon } from "./DocumentStatusIcon";
import { DocumentStatusBadge } from "./DocumentStatusBadge";
import { getDocumentTypeLabel, formatDate } from "./DocumentTypeUtils";

interface DocumentItemProps {
  document: DocumentAnalysisResponse;
  onView: (document: DocumentAnalysisResponse) => void;
  onDelete: (document: DocumentAnalysisResponse) => void;
  onAnalyze?: (document: DocumentAnalysisResponse) => void;
}

export const DocumentItem = ({
  document,
  onView,
  onDelete,
  onAnalyze,
}: DocumentItemProps) => {
  const canAnalyze =
    document.status === "uploaded" || document.status === "failed";
  const isProcessing = document.status === "processing";

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <div className="flex-shrink-0">
          <DocumentStatusIcon status={document.status} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
              {document.filename}
            </h4>
            <DocumentStatusBadge status={document.status} />
            <Badge variant="outline" className="text-xs">
              {getDocumentTypeLabel(document.document_type)}
            </Badge>
            {document.is_password_protected && (
              <Badge
                variant="secondary"
                className="text-xs flex items-center gap-1"
              >
                <Lock className="h-3 w-3" />
                Protected
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>Uploaded {formatDate(document.processed_at)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" onClick={() => onView(document)}>
          <Eye className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" disabled={isProcessing}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(document)}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            {onAnalyze && canAnalyze && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onAnalyze(document)}>
                  <Play className="h-4 w-4 mr-2" />
                  {document.status === "failed" ? "Re-analyze" : "Analyze"}
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(document)}
              className="text-red-600"
              disabled={isProcessing}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
