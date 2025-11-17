import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sprout, MapPin, Droplets, Thermometer, MapPinned } from "lucide-react";
import wheatImg from "@/assets/wheat.jpg";
import riceImg from "@/assets/rice.jpg";
import maizeImg from "@/assets/maize.jpg";
import sugarcaneImg from "@/assets/sugarcane.jpg";
import cottonImg from "@/assets/cotton.jpg";

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

interface FertilizerRecommendation {
  name: string;
  amount: number;
  unit: string;
  purpose: string;
}

interface LocationData {
  name: string;
  rainfall: number;
  avgTemp: number;
  soilType: string;
}

const cropImages: Record<string, string> = {
  Rice: riceImg,
  Wheat: wheatImg,
  Maize: maizeImg,
  Sugarcane: sugarcaneImg,
  "Cotton(lint)": cottonImg,
};

const locationData: LocationData[] = [
  { name: "Hamirpur", rainfall: 850, avgTemp: 26, soilType: "Sandy Loam" },
  { name: "Kanpur", rainfall: 780, avgTemp: 27, soilType: "Alluvial" },
  { name: "Gorakhpur", rainfall: 1200, avgTemp: 26, soilType: "Clay Loam" },
  { name: "Greater Noida", rainfall: 720, avgTemp: 25, soilType: "Alluvial" },
  { name: "Lucknow", rainfall: 900, avgTemp: 26, soilType: "Sandy Clay" },
  { name: "Jhansi", rainfall: 680, avgTemp: 28, soilType: "Red Sandy" },
];

const fertilizerTypes = [
  { value: "urea", label: "Urea (46-0-0)", npk: "46-0-0" },
  { value: "dap", label: "DAP (18-46-0)", npk: "18-46-0" },
  { value: "mop", label: "MOP (0-0-60)", npk: "0-0-60" },
  { value: "npk", label: "NPK (19-19-19)", npk: "19-19-19" },
  { value: "ssp", label: "SSP (0-16-0)", npk: "0-16-0" },
  { value: "organic", label: "Organic Compost", npk: "Variable" },
];

export const CropPredictor = ({
  onPredictionComplete,
}: {
  onPredictionComplete: (result: PredictionResult, suggestions: OptimizationSuggestion[]) => void;
}) => {
  const [formData, setFormData] = useState({
    location: "",
    crop: "Rice",
    area: "",
    rainfall: "",
    temperature: "",
    soilType: "",
    fertilizerType: "urea",
    fertilizerAmount: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleLocationChange = (location: string) => {
    const locationInfo = locationData.find((loc) => loc.name === location);
    if (locationInfo) {
      setFormData({
        ...formData,
        location,
        rainfall: locationInfo.rainfall.toString(),
        temperature: locationInfo.avgTemp.toString(),
        soilType: locationInfo.soilType,
      });
    }
  };

  const calculateFertilizerRecommendations = (
    crop: string,
    area: number,
    selectedFertilizer: string
  ): FertilizerRecommendation[] => {
    const recommendations: FertilizerRecommendation[] = [];
    
    // Base recommendations per hectare
    const baseN = crop === "Rice" ? 120 : crop === "Wheat" ? 150 : crop === "Maize" ? 140 : 100;
    const baseP = crop === "Rice" ? 60 : crop === "Wheat" ? 60 : crop === "Maize" ? 70 : 50;
    const baseK = crop === "Rice" ? 40 : crop === "Wheat" ? 40 : crop === "Maize" ? 50 : 40;

    // Selected fertilizer gets priority
    const selectedFertInfo = fertilizerTypes.find(f => f.value === selectedFertilizer);
    if (selectedFertInfo) {
      const amount = Math.round((baseN * 0.4) * area);
      recommendations.push({
        name: selectedFertInfo.label,
        amount,
        unit: "kg",
        purpose: "Primary nutrient source (selected)",
      });
    }

    // Add complementary fertilizers
    recommendations.push(
      {
        name: "DAP (18-46-0)",
        amount: Math.round((baseP / 0.46) * area),
        unit: "kg",
        purpose: "Phosphorus for root development",
      },
      {
        name: "MOP (0-0-60)",
        amount: Math.round((baseK / 0.60) * area),
        unit: "kg",
        purpose: "Potassium for disease resistance",
      },
      {
        name: "Urea (46-0-0)",
        amount: Math.round(((baseN * 0.6) / 0.46) * area),
        unit: "kg",
        purpose: "Nitrogen for vegetative growth",
      },
      {
        name: "Zinc Sulphate",
        amount: Math.round(25 * area),
        unit: "kg",
        purpose: "Micronutrient supplementation",
      }
    );

    return recommendations;
  };

  const generateOptimizations = (
    crop: string,
    area: number,
    rainfall: number,
    temperature: number,
    fertilizer: number,
    predictedYield: number,
    soilType: string
  ): OptimizationSuggestion[] => {
    const suggestions: OptimizationSuggestion[] = [];

    // Rainfall-based suggestions
    if (rainfall < 800) {
      suggestions.push({
        title: "Implement Drip Irrigation",
        description: `Low rainfall detected (${rainfall}mm). Install drip irrigation to improve water efficiency by 40-60% and boost yields.`,
        priority: "high",
      });
    } else if (rainfall > 2500) {
      suggestions.push({
        title: "Improve Drainage Systems",
        description: `High rainfall (${rainfall}mm) detected. Install proper drainage to prevent waterlogging and root diseases.`,
        priority: "high",
      });
    }

    // Temperature-based suggestions
    if (temperature < 20 && (crop === "Rice" || crop === "Maize")) {
      suggestions.push({
        title: "Consider Cold-Resistant Varieties",
        description: `Temperature ${temperature}°C is below optimal. Switch to cold-resistant ${crop.toLowerCase()} varieties for better yields.`,
        priority: "medium",
      });
    } else if (temperature > 35) {
      suggestions.push({
        title: "Apply Shade Nets & Mulching",
        description: `High temperature (${temperature}°C) can stress crops. Use shade nets and mulching to reduce heat stress.`,
        priority: "high",
      });
    }

    // Fertilizer optimization
    const fertilizerPerHectare = fertilizer / area;
    if (fertilizerPerHectare < 100) {
      suggestions.push({
        title: "Increase Fertilizer Application",
        description: `Current rate is ${Math.round(fertilizerPerHectare)} kg/ha. Increase to 150-200 kg/ha with soil testing for optimal nutrient balance.`,
        priority: "high",
      });
    } else if (fertilizerPerHectare > 300) {
      suggestions.push({
        title: "Reduce Fertilizer to Prevent Burning",
        description: `Over-fertilization detected (${Math.round(fertilizerPerHectare)} kg/ha). Reduce by 30% to prevent nutrient burn and save costs.`,
        priority: "medium",
      });
    }

    // Crop-specific suggestions
    if (crop === "Wheat" && temperature > 30) {
      suggestions.push({
        title: "Adjust Wheat Planting Schedule",
        description: "High temperature affects wheat. Plant earlier (Oct-Nov) to avoid heat stress during grain filling.",
        priority: "medium",
      });
    }

    if (crop === "Rice" && rainfall < 1000) {
      suggestions.push({
        title: "Switch to SRI Method",
        description: "System of Rice Intensification (SRI) reduces water needs by 25-30% while maintaining or increasing yields.",
        priority: "medium",
      });
    }

    // Yield-based suggestions
    if (predictedYield < 2) {
      suggestions.push({
        title: "Conduct Comprehensive Soil Testing",
        description: "Low predicted yield indicates possible soil deficiencies. Test for NPK, micronutrients, and pH levels.",
        priority: "high",
      });
    }

    // Area-based suggestion
    if (area > 50) {
      suggestions.push({
        title: "Implement Precision Agriculture",
        description: `With ${area} hectares, invest in GPS-guided equipment and variable rate technology for optimized input application.`,
        priority: "low",
      });
    }

    return suggestions.slice(0, 4); // Return top 4 suggestions
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate ML prediction using RandomForest logic
    setTimeout(() => {
      const area = parseFloat(formData.area);
      const rainfall = parseFloat(formData.rainfall);
      const temperature = parseFloat(formData.temperature);
      const fertilizer = parseFloat(formData.fertilizerAmount);

      // Simplified RandomForest-like prediction
      let baseYield = 1.5;
      
      // Crop-specific base yields
      const cropMultipliers: Record<string, number> = {
        Rice: 1.2,
        Wheat: 1.1,
        Maize: 1.0,
        Sugarcane: 3.5,
        "Cotton(lint)": 0.5,
      };

      baseYield *= cropMultipliers[formData.crop] || 1.0;

      // Factor in rainfall
      if (rainfall > 1000 && rainfall < 2000) {
        baseYield *= 1.3;
      } else if (rainfall < 800) {
        baseYield *= 0.7;
      }

      // Factor in temperature
      if (temperature > 20 && temperature < 30) {
        baseYield *= 1.2;
      } else if (temperature < 15 || temperature > 35) {
        baseYield *= 0.8;
      }

      // Factor in fertilizer
      const fertilizerPerHectare = fertilizer / area;
      if (fertilizerPerHectare > 100 && fertilizerPerHectare < 250) {
        baseYield *= 1.15;
      } else if (fertilizerPerHectare < 50) {
        baseYield *= 0.85;
      }

      const predictedYield = Math.max(0.1, baseYield * (0.9 + Math.random() * 0.2));

      const fertilizerRecommendations = calculateFertilizerRecommendations(
        formData.crop,
        area,
        formData.fertilizerType
      );

      const result: PredictionResult = {
        yield: Math.round(predictedYield * 10) / 10,
        crop: formData.crop,
        cropImage: cropImages[formData.crop] || "",
        fertilizerRecommendations,
      };

      const optimizations = generateOptimizations(
        formData.crop,
        area,
        rainfall,
        temperature,
        fertilizer,
        predictedYield,
        formData.soilType
      );

      onPredictionComplete(result, optimizations);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <Card className="w-full shadow-lg border-border/50 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/5 border-b border-border/50">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Sprout className="h-6 w-6 text-primary animate-pulse" />
          AI Crop Yield Predictor
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Enter your farm details to get AI-powered yield predictions and optimization suggestions
        </p>
      </CardHeader>
      <CardContent className="mt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location Section */}
          <div className="p-4 rounded-lg bg-muted/30 border border-border/50 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <MapPin className="h-4 w-4" />
              Location Details
            </div>
            <div>
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPinned className="h-4 w-4 text-primary" />
                Select Location
              </Label>
              <Select value={formData.location} onValueChange={handleLocationChange}>
                <SelectTrigger id="location" className="mt-2">
                  <SelectValue placeholder="Choose your district" />
                </SelectTrigger>
                <SelectContent>
                  {locationData.map((location) => (
                    <SelectItem key={location.name} value={location.name}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="crop">Crop Type</Label>
              <Select value={formData.crop} onValueChange={(value) => setFormData({ ...formData, crop: value })}>
                <SelectTrigger id="crop" className="mt-2">
                  <SelectValue placeholder="Select crop" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rice">Rice</SelectItem>
                  <SelectItem value="Wheat">Wheat</SelectItem>
                  <SelectItem value="Maize">Maize</SelectItem>
                  <SelectItem value="Sugarcane">Sugarcane</SelectItem>
                  <SelectItem value="Cotton(lint)">Cotton</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="area">Area (hectares)</Label>
              <Input
                id="area"
                type="number"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="e.g., 10"
                required
                className="mt-2 bg-background"
              />
            </div>

            <div>
              <Label htmlFor="rainfall" className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-secondary" />
                Annual Rainfall (mm)
              </Label>
              <Input
                id="rainfall"
                type="number"
                value={formData.rainfall}
                onChange={(e) => setFormData({ ...formData, rainfall: e.target.value })}
                placeholder="e.g., 1000"
                required
                className="mt-2 bg-background"
                disabled={!formData.location}
              />
            </div>

            <div>
              <Label htmlFor="temperature" className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-accent" />
                Average Temperature (°C)
              </Label>
              <Input
                id="temperature"
                type="number"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                placeholder="e.g., 25"
                required
                className="mt-2 bg-background"
                disabled={!formData.location}
              />
            </div>

            <div>
              <Label htmlFor="soilType">Soil Type</Label>
              <Input
                id="soilType"
                type="text"
                value={formData.soilType}
                onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                placeholder="e.g., Alluvial"
                required
                className="mt-2 bg-background"
                disabled={!formData.location}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="fertilizerType">Primary Fertilizer Type</Label>
              <Select 
                value={formData.fertilizerType} 
                onValueChange={(value) => setFormData({ ...formData, fertilizerType: value })}
              >
                <SelectTrigger id="fertilizerType" className="mt-2">
                  <SelectValue placeholder="Select fertilizer type" />
                </SelectTrigger>
                <SelectContent>
                  {fertilizerTypes.map((fertilizer) => (
                    <SelectItem key={fertilizer.value} value={fertilizer.value}>
                      {fertilizer.label} - NPK: {fertilizer.npk}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="fertilizerAmount">Fertilizer Amount (kg)</Label>
              <Input
                id="fertilizerAmount"
                type="number"
                value={formData.fertilizerAmount}
                onChange={(e) => setFormData({ ...formData, fertilizerAmount: e.target.value })}
                placeholder="e.g., 200"
                required
                className="mt-2 bg-background"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary via-primary to-secondary hover:from-primary/90 hover:via-primary/80 hover:to-secondary/90 text-primary-foreground shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
            disabled={isLoading || !formData.location}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Sprout className="mr-2 h-4 w-4" />
                Predict Yield & Get Recommendations
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
