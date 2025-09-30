import { Badge } from "../ui/badge";

interface FileRequirementsProps {
  maxSizeBytes: number;
}

export const FileRequirements = ({ maxSizeBytes }: FileRequirementsProps) => {
  return (
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
        🔒 Password-protected PDFs are supported - enter password when uploading
      </p>
    </div>
  );
};
