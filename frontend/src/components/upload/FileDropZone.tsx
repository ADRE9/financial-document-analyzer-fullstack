import { useCallback } from "react";
import { Upload } from "lucide-react";
import { Button } from "../ui/button";

interface FileDropZoneProps {
  isDragOver: boolean;
  maxSizeBytes: number;
  onFileSelect: (file: File) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  className?: string;
}

export const FileDropZone = ({
  isDragOver,
  maxSizeBytes,
  onFileSelect,
  onDragOver,
  onDragLeave,
  onDrop,
  className = "",
}: FileDropZoneProps) => {
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  return (
    <div
      className={`
        border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
        ${
          isDragOver
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
            : "border-gray-300 hover:border-gray-400 dark:border-gray-600"
        }
        ${className}
      `}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => document.getElementById("file-upload")?.click()}
    >
      <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        Drop your PDF file here or click to browse
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Only PDF files • Max size: {Math.round(maxSizeBytes / (1024 * 1024))}MB
      </p>
      <Button variant="outline" type="button">
        <Upload className="h-4 w-4 mr-2" />
        Choose File
      </Button>
      <input
        id="file-upload"
        type="file"
        className="hidden"
        accept=".pdf"
        onChange={handleFileInputChange}
      />
    </div>
  );
};
