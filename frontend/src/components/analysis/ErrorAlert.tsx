import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "../ui/card";

interface ErrorAlertProps {
  message: string;
}

export const ErrorAlert = ({ message }: ErrorAlertProps) => {
  return (
    <Card className="border-2 border-red-300 bg-red-50">
      <CardContent className="pt-6">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-red-900 text-lg">
              Analysis Error
            </h4>
            <p className="text-red-700 mt-2 leading-relaxed">{message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
