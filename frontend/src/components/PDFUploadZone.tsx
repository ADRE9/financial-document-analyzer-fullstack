import { useState, useCallback, useMemo } from "react";
import { FileText, AlertTriangle, CheckCircle, X, Lock } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useUploadDocument } from "../hooks/useDocuments";
import { DocumentType, type DocumentAnalysisResponse } from "../types/api";
import { FileDropZone } from "./upload/FileDropZone";
import { UploadStatus } from "./upload/UploadStatus";
import { useFileValidation, useFileDragAndDrop } from "../hooks/useFileUpload";
import QueryHistory, { useQueryHistory } from "./QueryHistory";

interface PDFUploadZoneProps {
  onUploadSuccess?: (
    document: DocumentAnalysisResponse,
    analysisQuery?: string
  ) => void;
  onUploadError?: (error: string) => void;
  maxSizeBytes?: number;
  className?: string;
}

export const PDFUploadZone = ({
  onUploadSuccess,
  onUploadError,
  maxSizeBytes = 10 * 1024 * 1024, // 10MB limit for security
  className = "",
}: PDFUploadZoneProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [password, setPassword] = useState("");
  const [analysisQuery, setAnalysisQuery] = useState("");

  const uploadMutation = useUploadDocument();
  const { validateFile } = useFileValidation(maxSizeBytes);
  const { addToHistory } = useQueryHistory();

  const handleFileSelect = useCallback(
    (file: File) => {
      const error = validateFile(file);
      if (error) {
        toast.error(error);
        onUploadError?.(error);
        return;
      }

      setSelectedFile(file);
      toast.success(`File "${file.name}" selected`);
    },
    [validateFile, onUploadError]
  );

  const { isDragOver, handleDragOver, handleDragLeave, handleDrop } =
    useFileDragAndDrop(handleFileSelect);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }, []);

  const resetForm = useCallback(() => {
    setSelectedFile(null);
    setUploadProgress(0);
    setPassword("");
    setAnalysisQuery("");
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    try {
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await uploadMutation.mutateAsync({
        file: selectedFile,
        uploadData: {
          filename: selectedFile.name,
          document_type: DocumentType.OTHER,
          description: undefined,
          password: password || undefined,
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success(`Document "${selectedFile.name}" uploaded successfully`);

      // Add query to history if provided
      if (analysisQuery.trim()) {
        addToHistory(analysisQuery);
      }

      onUploadSuccess?.(result, analysisQuery || undefined);

      // Reset form
      resetForm();
    } catch (error: unknown) {
      setUploadProgress(0);

      let errorMessage = "Upload failed";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      // Provide more specific error messages for common issues
      if (errorMessage.includes("422")) {
        errorMessage =
          "Invalid file format or missing required fields. Please check your file and try again.";
      } else if (errorMessage.includes("401")) {
        errorMessage = "Authentication required. Please log in and try again.";
      } else if (errorMessage.includes("413")) {
        errorMessage = "File too large. Please choose a smaller file.";
      } else if (errorMessage.includes("403")) {
        errorMessage =
          "Access denied. You don't have permission to upload files.";
      }

      toast.error(errorMessage);
      onUploadError?.(errorMessage);
    }
  }, [
    selectedFile,
    password,
    uploadMutation,
    onUploadSuccess,
    onUploadError,
    resetForm,
  ]);

  const getStatusIcon = useMemo(() => {
    if (uploadMutation.isPending) {
      return <FileText className="h-5 w-5 animate-pulse text-blue-500" />;
    }
    if (uploadMutation.isError) {
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
    if (uploadMutation.isSuccess) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <FileText className="h-5 w-5 text-gray-400" />;
  }, [
    uploadMutation.isPending,
    uploadMutation.isError,
    uploadMutation.isSuccess,
  ]);

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {getStatusIcon}
          <span>Upload Financial Document</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Drop Zone */}
        {!selectedFile && (
          <FileDropZone
            isDragOver={isDragOver}
            maxSizeBytes={maxSizeBytes}
            onFileSelect={handleFileSelect}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          />
        )}

        {/* Selected File Display */}
        {selectedFile && (
          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {selectedFile.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(selectedFile.size)} •{" "}
                    {selectedFile.type || "Unknown type"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetForm}
                disabled={uploadMutation.isPending}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Upload Progress */}
            {uploadMutation.isPending && (
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
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={uploadMutation.isPending}
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
                onChange={(e) => setAnalysisQuery(e.target.value)}
                disabled={uploadMutation.isPending}
                className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                rows={3}
              />
              <p className="text-xs text-gray-500">
                Optional: Specify what you want to analyze or leave blank for
                general analysis
              </p>

              {/* Query History */}
              <QueryHistory
                onQuerySelect={(query) => setAnalysisQuery(query)}
                className="mt-3"
              />
            </div>

            {/* Upload Button */}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={resetForm}
                disabled={uploadMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                className="min-w-[100px]"
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
        )}

        {/* Upload Status */}
        <UploadStatus
          isError={uploadMutation.isError}
          isSuccess={uploadMutation.isSuccess}
          errorMessage={uploadMutation.error?.message}
        />

        {/* File Requirements */}
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">PDF Only</Badge>
            <Badge variant="outline">Password Protected Supported</Badge>
          </div>
          <p>Maximum file size: {Math.round(maxSizeBytes / (1024 * 1024))}MB</p>
          <p className="text-red-600">
            ⚠️ Only PDF files are accepted for security reasons
          </p>
          <p className="text-blue-600">
            🔒 Password-protected PDFs are supported - enter password when
            uploading
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PDFUploadZone;
