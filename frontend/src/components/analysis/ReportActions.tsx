import { Download, Share2 } from "lucide-react";
import { Button } from "../ui/button";

interface ReportActionsProps {
  onExport: () => void;
  onShare: () => void;
}

export const ReportActions = ({ onExport, onShare }: ReportActionsProps) => {
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={onExport}
        className="flex items-center space-x-1"
      >
        <Download className="h-4 w-4" />
        <span>Export</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onShare}
        className="flex items-center space-x-1"
      >
        <Share2 className="h-4 w-4" />
        <span>Share</span>
      </Button>
    </>
  );
};
