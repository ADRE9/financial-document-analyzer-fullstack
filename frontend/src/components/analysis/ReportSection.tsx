import { type LucideIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface ReportSectionProps {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  borderColor: string;
  content: string;
  bgColor?: string;
}

export const ReportSection = ({
  title,
  icon: Icon,
  iconColor,
  borderColor,
  content,
  bgColor,
}: ReportSectionProps) => {
  return (
    <Card className={`border-l-4 ${borderColor} ${bgColor || ""}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Icon className={`h-5 w-5 ${iconColor}`} />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
};
