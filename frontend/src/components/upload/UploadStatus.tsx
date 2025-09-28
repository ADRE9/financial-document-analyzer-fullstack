import { AlertTriangle, CheckCircle } from "lucide-react";

interface UploadStatusProps {
  isError: boolean;
  isSuccess: boolean;
  errorMessage?: string;
}

export const UploadStatus = ({
  isError,
  isSuccess,
  errorMessage,
}: UploadStatusProps) => {
  if (isError) {
    return (
      <div className="flex items-center space-x-2 text-red-600 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
        <AlertTriangle className="h-5 w-5" />
        <span className="text-sm">
          {errorMessage || "Upload failed. Please try again."}
        </span>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex items-center space-x-2 text-green-600 bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
        <CheckCircle className="h-5 w-5" />
        <span className="text-sm">Document uploaded successfully!</span>
      </div>
    );
  }

  return null;
};
