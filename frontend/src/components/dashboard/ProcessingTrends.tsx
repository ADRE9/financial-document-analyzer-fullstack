import { useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useProcessingTrends } from "../../hooks/useAnalytics";
import { Card } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export const ProcessingTrends = () => {
  const [days, setDays] = useState(30);
  const { data: trends, isLoading } = useProcessingTrends(days);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(Math.round(num));
  };

  const getTrendIcon = () => {
    if (isLoading || !trends) return null;
    switch (trends.trend_direction) {
      case "increasing":
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case "decreasing":
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      default:
        return <Minus className="h-5 w-5 text-gray-500" />;
    }
  };

  const getMaxCount = () => {
    if (!trends?.daily_counts) return 0;
    return Math.max(...trends.daily_counts.map((d) => d.count));
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Processing Trends</h3>
        <Select
          value={days.toString()}
          onValueChange={(value) => setDays(parseInt(value))}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select days" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="90">90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {isLoading ? "..." : formatNumber(trends?.total_processed || 0)}
          </div>
          <div className="text-sm text-gray-500">Total Processed</div>
        </div>
        <div className="text-center flex flex-col items-center">
          <div className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            {isLoading ? "..." : formatNumber(trends?.average_daily || 0)}
            {getTrendIcon()}
          </div>
          <div className="text-sm text-gray-500">Daily Average</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {isLoading
              ? "..."
              : formatNumber(
                  trends?.daily_counts?.[trends.daily_counts.length - 1]
                    ?.count || 0
                )}
          </div>
          <div className="text-sm text-gray-500">Today</div>
        </div>
      </div>

      {/* Chart */}
      {!isLoading && trends?.daily_counts && (
        <div className="h-64 mt-4">
          <div className="flex h-full items-end">
            {trends.daily_counts.map((day, index) => {
              const height = (day.count / getMaxCount()) * 100;
              return (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center group"
                  title={`${day.date}: ${day.count} documents`}
                >
                  <div
                    className="w-full bg-blue-500 opacity-75 hover:opacity-100 transition-opacity rounded-t"
                    style={{ height: `${height}%` }}
                  />
                  {/* Only show every 7th date label or if it's the first/last date */}
                  {(index % 7 === 0 ||
                    index === 0 ||
                    index === (trends.daily_counts?.length || 0) - 1) && (
                    <div className="text-xs text-gray-500 mt-2 -rotate-45 origin-top-left">
                      {new Date(day.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="text-sm text-gray-500 text-right mt-4">
        Last updated:{" "}
        {isLoading
          ? "..."
          : new Date(
              trends?.daily_counts?.slice(-1)[0]?.date || ""
            ).toLocaleDateString()}
      </div>
    </Card>
  );
};
