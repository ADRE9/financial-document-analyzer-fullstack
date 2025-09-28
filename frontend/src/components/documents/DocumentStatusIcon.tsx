import { FileText, Clock, CheckCircle, AlertTriangle } from "lucide-react";

interface DocumentStatusIconProps {
  status: string;
}

export const DocumentStatusIcon = ({ status }: DocumentStatusIconProps) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "processing":
      return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
    case "failed":
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case "uploaded":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    default:
      return <FileText className="h-4 w-4 text-gray-400" />;
  }
};
