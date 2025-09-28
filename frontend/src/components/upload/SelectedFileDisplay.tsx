import { FileText, X } from "lucide-react";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { DocumentType } from "../../types/api";
import { DocumentTypeSelector } from "./DocumentTypeSelector";
import { DescriptionInput } from "./DescriptionInput";

interface SelectedFileDisplayProps {
  file: File;
  documentType: DocumentType;
  description: string;
  uploadProgress: number;
  isUploading: boolean;
  onDocumentTypeChange: (type: DocumentType) => void;
  onDescriptionChange: (description: string) => void;
  onUpload: () => void;
  onCancel: () => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const SelectedFileDisplay = ({
  file,
  documentType,
  description,
  uploadProgress,
  isUploading,
  onDocumentTypeChange,
  onDescriptionChange,
  onUpload,
  onCancel,
}: SelectedFileDisplayProps) => {
  return (
    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-blue-500" />
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              {file.name}
            </h4>
            <p className="text-sm text-gray-500">
              {formatFileSize(file.size)} • {file.type || "Unknown type"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isUploading}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Document Type and Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <DocumentTypeSelector
          value={documentType}
          onChange={onDocumentTypeChange}
          disabled={isUploading}
        />
        <DescriptionInput
          value={description}
          onChange={onDescriptionChange}
          disabled={isUploading}
        />
      </div>

      {/* Upload Button */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel} disabled={isUploading}>
          Cancel
        </Button>
        <Button
          onClick={onUpload}
          disabled={isUploading}
          className="min-w-[100px]"
        >
          {isUploading ? "Uploading..." : "Upload"}
        </Button>
      </div>
    </div>
  );
};
