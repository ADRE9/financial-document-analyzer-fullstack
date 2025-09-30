import { useState } from "react";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

interface MarkdownReportProps {
  markdownContent: string;
}

export const MarkdownReport = ({ markdownContent }: MarkdownReportProps) => {
  const [showFullMarkdown, setShowFullMarkdown] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-gray-700" />
            <span>Full Analysis Report</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFullMarkdown(!showFullMarkdown)}
            className="flex items-center space-x-1"
          >
            {showFullMarkdown ? (
              <>
                <ChevronUp className="h-4 w-4" />
                <span>Collapse</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                <span>Expand</span>
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      {showFullMarkdown && (
        <CardContent>
          <div className="prose prose-sm lg:prose-base max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ ...props }) => (
                  <h1
                    className="text-3xl font-bold text-blue-900 border-b-2 border-blue-200 pb-2 mb-4"
                    {...props}
                  />
                ),
                h2: ({ ...props }) => (
                  <h2
                    className="text-2xl font-semibold text-gray-800 mt-8 mb-4"
                    {...props}
                  />
                ),
                h3: ({ ...props }) => (
                  <h3
                    className="text-xl font-semibold text-gray-700 mt-6 mb-3"
                    {...props}
                  />
                ),
                ul: ({ ...props }) => (
                  <ul className="space-y-2 my-4" {...props} />
                ),
                li: ({ ...props }) => (
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-2">•</span>
                    <span className="flex-1" {...props} />
                  </li>
                ),
                strong: ({ ...props }) => (
                  <strong className="font-bold text-gray-900" {...props} />
                ),
                code: ({ className, children, ...props }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code
                      className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono"
                      {...props}
                    >
                      {children}
                    </code>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
                blockquote: ({ ...props }) => (
                  <blockquote
                    className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 italic"
                    {...props}
                  />
                ),
              }}
            >
              {markdownContent}
            </ReactMarkdown>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
