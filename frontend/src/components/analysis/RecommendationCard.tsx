import { Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

interface RecommendationCardProps {
  recommendation: string;
}

const getRecommendationVariant = (recommendation: string) => {
  const rec = recommendation.toLowerCase();
  if (rec.includes("buy") || rec.includes("strong buy")) {
    return "default";
  } else if (rec.includes("sell") || rec.includes("strong sell")) {
    return "destructive";
  } else if (rec.includes("hold")) {
    return "secondary";
  }
  return "outline";
};

export const RecommendationCard = ({
  recommendation,
}: RecommendationCardProps) => {
  return (
    <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-6 w-6 text-green-600" />
          <span>Investment Recommendation</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Badge
            variant={getRecommendationVariant(recommendation)}
            className="text-2xl font-bold px-6 py-3"
          >
            {recommendation.toUpperCase()}
          </Badge>
          <p className="text-gray-600 text-sm">
            Based on comprehensive financial analysis and market conditions
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
