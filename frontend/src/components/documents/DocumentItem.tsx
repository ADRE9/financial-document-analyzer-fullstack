import { Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import type { DocumentAnalysisResponse } from "../../types/api";
import { DocumentStatusIcon } from "./DocumentStatusIcon";
import { DocumentStatusBadge } from "./DocumentStatusBadge";
import { getDocumentTypeLabel, formatDate } from "./DocumentTypeUtils";

interface DocumentItemProps {
  document: DocumentAnalysisResponse;
  onView: (document: DocumentAnalysisResponse) => void;
  onDelete: (document: DocumentAnalysisResponse) => void;
}

export const DocumentItem = ({
  document,
  onView,
  onDelete,
}: DocumentItemProps) => {
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
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>Uploaded {formatDate(document.processed_at)}</span>
            {document.confidence_score > 0 && (
              <span>
                Confidence: {Math.round(document.confidence_score * 100)}%
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" onClick={() => onView(document)}>
          <Eye className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(document)}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(document)}
              className="text-red-600"
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
