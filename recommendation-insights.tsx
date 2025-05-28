import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp, Target, Clock } from "lucide-react";

export default function RecommendationInsights() {
  const insights = [
    {
      icon: Brain,
      title: "AI Matching",
      description: "Advanced algorithms analyze your skills and experience for precise job matching",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: TrendingUp,
      title: "Skill Analysis",
      description: "Identify skill gaps and get recommendations for career advancement",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      icon: Target,
      title: "Relevance Score",
      description: "Each job shows a detailed match percentage based on your profile",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      icon: Clock,
      title: "Real-time Updates",
      description: "Get notified about new job opportunities that match your profile",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Recommendation Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 ${insight.bgColor} rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <Icon className={`${insight.color} text-xl`} size={24} />
                </div>
                <h4 className="font-medium text-slate-900 mb-1">{insight.title}</h4>
                <p className="text-sm text-slate-600">{insight.description}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
