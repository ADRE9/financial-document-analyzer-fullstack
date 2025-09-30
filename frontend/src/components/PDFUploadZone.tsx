import { useState, useCallback, useMemo } from "react";
import { FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useUploadDocument } from "../hooks/useDocuments";
import { DocumentType, type DocumentAnalysisResponse } from "../types/api";
import { FileDropZone } from "./upload/FileDropZone";
import { SelectedFileCard } from "./upload/SelectedFileCard";
import { UploadStatus } from "./upload/UploadStatus";
import { FileRequirements } from "./upload/FileRequirements";
import { useFileValidation, useFileDragAndDrop } from "../hooks/useFileUpload";
import { useQueryHistory } from "./QueryHistory";

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
  const [autoAnalyze, setAutoAnalyze] = useState(false);

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

  const resetForm = useCallback(() => {
    setSelectedFile(null);
    setUploadProgress(0);
    setPassword("");
    setAnalysisQuery("");
    setAutoAnalyze(false);
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

      const result = (await uploadMutation.mutateAsync({
        file: selectedFile,
        uploadData: {
          filename: selectedFile.name,
          document_type: DocumentType.OTHER,
          description: undefined,
          password: password || undefined,
          auto_analyze: autoAnalyze,
          analysis_query: analysisQuery || undefined,
        },
      })) as DocumentAnalysisResponse;

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success(`Document "${selectedFile.name}" uploaded successfully`);

      // Add query to history if provided
      if (analysisQuery.trim()) {
        addToHistory(analysisQuery);
      }

      onUploadSuccess?.(result, analysisQuery || undefined);
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
    analysisQuery,
    autoAnalyze,
    uploadMutation,
    onUploadSuccess,
    onUploadError,
    resetForm,
    addToHistory,
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

        {/* Selected File Card */}
        {selectedFile && (
          <SelectedFileCard
            file={selectedFile}
            password={password}
            analysisQuery={analysisQuery}
            autoAnalyze={autoAnalyze}
            uploadProgress={uploadProgress}
            isUploading={uploadMutation.isPending}
            onPasswordChange={setPassword}
            onQueryChange={setAnalysisQuery}
            onAutoAnalyzeChange={setAutoAnalyze}
            onCancel={resetForm}
            onUpload={handleUpload}
          />
        )}

        {/* Upload Status */}
        <UploadStatus
          isError={uploadMutation.isError}
          isSuccess={uploadMutation.isSuccess}
          errorMessage={uploadMutation.error?.message}
        />

        {/* File Requirements */}
        <FileRequirements maxSizeBytes={maxSizeBytes} />
      </CardContent>
    </Card>
  );
};

export default PDFUploadZone;
