import { memo } from "react";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import { RefreshCw } from "lucide-react";

export interface WorkflowStep {
  id: string;
  title: string;
  status: "pending" | "in-progress" | "completed" | "error";
  description?: string;
  icon: React.ReactNode;
}

interface WorkflowProgressProps {
  steps: WorkflowStep[];
  currentStep: number;
  onReset?: () => void;
  showReset?: boolean;
}

const getStepStatusColor = (status: WorkflowStep["status"]) => {
  switch (status) {
    case "completed":
      return "text-green-600 bg-green-100";
    case "in-progress":
      return "text-blue-600 bg-blue-100";
    case "error":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

const getStepStatusIcon = (status: WorkflowStep["status"]) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4" />;
    case "error":
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return null;
  }
};

export const WorkflowProgress = memo<WorkflowProgressProps>(
  ({ steps, currentStep, onReset, showReset = false }) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Document Analysis Workflow</span>
            {showReset && onReset && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reset</span>
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="relative">
              <Progress
                value={(currentStep / (steps.length - 1)) * 100}
                className="h-2"
              />
            </div>

            {/* Step Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    index === currentStep
                      ? "border-blue-500 bg-blue-50"
                      : step.status === "completed"
                      ? "border-green-500 bg-green-50"
                      : step.status === "error"
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-full ${getStepStatusColor(
                        step.status
                      )}`}
                    >
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">
                          {step.title}
                        </h4>
                        {getStepStatusIcon(step.status)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

WorkflowProgress.displayName = "WorkflowProgress";

export default WorkflowProgress;
