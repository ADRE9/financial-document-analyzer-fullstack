import { FileText, X, Lock } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import QueryHistory from "../QueryHistory";

interface SelectedFileCardProps {
  file: File;
  password: string;
  analysisQuery: string;
  autoAnalyze: boolean;
  uploadProgress: number;
  isUploading: boolean;
  onPasswordChange: (password: string) => void;
  onQueryChange: (query: string) => void;
  onAutoAnalyzeChange: (autoAnalyze: boolean) => void;
  onCancel: () => void;
  onUpload: () => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const SelectedFileCard = ({
  file,
  password,
  analysisQuery,
  autoAnalyze,
  uploadProgress,
  isUploading,
  onPasswordChange,
  onQueryChange,
  onAutoAnalyzeChange,
  onCancel,
  onUpload,
}: SelectedFileCardProps) => {
  return (
    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
      {/* File Info */}
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

      {/* Password Input */}
      <div className="space-y-2">
        <Label htmlFor="pdf-password" className="text-sm font-medium">
          PDF Password (if protected)
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="pdf-password"
            type="password"
            placeholder="Enter PDF password if the file is password-protected"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            disabled={isUploading}
            className="pl-10"
          />
        </div>
        <p className="text-xs text-gray-500">
          Only required if your PDF is password-protected
        </p>
      </div>

      {/* Analysis Query Input */}
      <div className="space-y-2">
        <Label htmlFor="analysis-query" className="text-sm font-medium">
          Analysis Query
        </Label>
        <textarea
          id="analysis-query"
          placeholder="What would you like to know about this document? (e.g., 'Summarize the key financial metrics', 'What are the main revenue sources?')"
          value={analysisQuery}
          onChange={(e) => onQueryChange(e.target.value)}
          disabled={isUploading}
          className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
          rows={3}
        />
        <p className="text-xs text-gray-500">
          Optional: Specify what you want to analyze or leave blank for general
          analysis
        </p>

        {/* Query History */}
        <QueryHistory onQuerySelect={onQueryChange} className="mt-3" />
      </div>

      {/* Auto-Analyze Option */}
      <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <input
          id="auto-analyze"
          type="checkbox"
          checked={autoAnalyze}
          onChange={(e) => onAutoAnalyzeChange(e.target.checked)}
          disabled={isUploading}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <Label
          htmlFor="auto-analyze"
          className="text-sm font-medium cursor-pointer select-none"
        >
          Analyze immediately after upload
        </Label>
      </div>
      <p className="text-xs text-gray-500">
        {autoAnalyze
          ? "✓ Document will be analyzed automatically using CrewAI after upload"
          : "Document will be uploaded only. You can analyze it later from the document list."}
      </p>

      {/* Upload Button */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel} disabled={isUploading}>
          Cancel
        </Button>
        <Button onClick={onUpload} disabled={isUploading} className="min-w-[100px]">
          {isUploading ? "Uploading..." : "Upload"}
        </Button>
      </div>
    </div>
  );
};
