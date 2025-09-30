import { Info } from "lucide-react";
import { Card, CardContent } from "../ui/card";

export const NoResultsAlert = () => {
  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardContent className="pt-6">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-yellow-600 mt-1" />
          <div>
            <h4 className="font-medium text-yellow-800">
              No Formatted Results
            </h4>
            <p className="text-yellow-700 mt-1">
              The analysis completed, but no markdown content was returned.
              Check the raw data above for results.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
