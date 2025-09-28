import { Badge } from "../ui/badge";

interface DocumentStatusBadgeProps {
  status: string;
}

export const DocumentStatusBadge = ({ status }: DocumentStatusBadgeProps) => {
  switch (status) {
    case "completed":
      return (
        <Badge variant="default" className="bg-green-500">
          Completed
        </Badge>
      );
    case "processing":
      return (
        <Badge variant="default" className="bg-blue-500">
          Processing
        </Badge>
      );
    case "failed":
      return <Badge variant="destructive">Failed</Badge>;
    case "uploaded":
      return <Badge variant="secondary">Uploaded</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};
