import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, CheckCircle, Info, Leaf } from "lucide-react";

interface FertilizerRecommendation {
  name: string;
  amount: number;
  unit: string;
  purpose: string;
}

interface PredictionResult {
  yield: number;
  crop: string;
  cropImage: string;
  fertilizerRecommendations?: FertilizerRecommendation[];
}

interface OptimizationSuggestion {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

interface PredictionResultsProps {
  result: PredictionResult;
  suggestions: OptimizationSuggestion[];
}

export const PredictionResults = ({ result, suggestions }: PredictionResultsProps) => {
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="h-4 w-4" />;
      case "medium":
        return <Info className="h-4 w-4" />;
      case "low":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/30";
      case "medium":
        return "bg-accent/10 text-accent border-accent/30";
      case "low":
        return "bg-primary/10 text-primary border-primary/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <Card className="overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/5 border-primary/30 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-primary/20 to-secondary/10">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <TrendingUp className="h-5 w-5 text-primary animate-pulse" />
            Prediction Results
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {result.cropImage && (
              <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden shadow-md ring-2 ring-primary/20">
                <img
                  src={result.cropImage}
                  alt={result.crop}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
              </div>
            )}
            <div className="flex-1 space-y-2">
              <div className="text-sm text-muted-foreground">Predicted Yield for {result.crop}</div>
              <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {result.yield} <span className="text-2xl">tons/ha</span>
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Based on ML RandomForest model analysis
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {result.fertilizerRecommendations && result.fertilizerRecommendations.length > 0 && (
        <Card className="overflow-hidden shadow-lg border-secondary/30">
          <CardHeader className="bg-gradient-to-r from-secondary/10 to-accent/5 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Leaf className="h-5 w-5 text-secondary" />
              Fertilizer Recommendations
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Optimized fertilizer plan for maximum yield
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.fertilizerRecommendations.map((fert, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border-2 border-border/50 bg-gradient-to-br from-card to-muted/20 hover:border-secondary/50 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="font-semibold text-foreground text-sm">{fert.name}</div>
                    <Badge variant="secondary" className="text-xs whitespace-nowrap">
                      {fert.amount} {fert.unit}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{fert.purpose}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-accent/10 border border-accent/30">
              <p className="text-xs text-muted-foreground">
                <strong className="text-accent">Note:</strong> Apply fertilizers in split doses for better absorption. 
                Conduct soil tests regularly to adjust these recommendations.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-border/50">
          <CardTitle className="text-foreground">AI Optimization Suggestions</CardTitle>
          <p className="text-sm text-muted-foreground">
            Personalized recommendations to maximize your yield
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 transition-all ${getPriorityColor(
                  suggestion.priority
                )}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getPriorityIcon(suggestion.priority)}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-foreground">{suggestion.title}</div>
                      <Badge
                        variant={
                          suggestion.priority === "high"
                            ? "destructive"
                            : suggestion.priority === "medium"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {suggestion.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
