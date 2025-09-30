import { FileText } from "lucide-react";
import { useDocumentTypeAnalytics } from "../../hooks/useAnalytics";
import { Card } from "../ui/card";
import type { DocumentTypeAnalytics as DocumentTypeAnalyticsType } from "../../types/api";

export const DocumentTypeAnalytics = () => {
  const { data: analytics, isLoading } = useDocumentTypeAnalytics() as {
    data: DocumentTypeAnalyticsType | undefined;
    isLoading: boolean;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(Math.round(num));
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          Loading document type analytics...
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {analytics?.type_breakdown &&
      Object.keys(analytics.type_breakdown).length > 0 ? (
        Object.entries(analytics.type_breakdown).map(([type, count]) => (
          <Card key={type} className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-medium text-gray-900 capitalize">
                {type}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Total Documents</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(count)}
                </div>
              </div>
            </div>
          </Card>
        ))
      ) : (
        <Card className="p-6">
          <div className="text-center text-gray-500">
            No document type data available
          </div>
        </Card>
      )}

      {analytics?.last_updated && (
        <div className="text-xs text-gray-500 text-center">
          Last updated: {new Date(analytics.last_updated).toLocaleString()}
        </div>
      )}
    </div>
  );
};
