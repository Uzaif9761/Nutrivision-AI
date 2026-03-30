import axios from "axios";
import { compositions, NutritionLookupResult } from "@/lib/ifct2017";

const YOLO_API_KEY = process.env.YOLO_API_KEY!;

export interface FoodRecognitionResult {
  food_name: string;
  confidence: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  description: string;
  ifct_source: boolean; // Always true - indicates IFCT 2017 source
  setup_error?: string; // Setup instructions if needed
}

// ═════════════════════════════════════════════════════════════════════════════
// YOLOv8 DETECTION — Custom model trained on Indian foods
// ═════════════════════════════════════════════════════════════════════════════

async function detectFood(imageUrl: string): Promise<string[]> {
  try {
    const response = await axios.post(
      `https://api.ultralytics.com/v1/predict`,
      {
        image: imageUrl,
        conf: 0.5, // Confidence threshold
      },
      {
        headers: {
          "x-api-key": YOLO_API_KEY,
        },
      }
    );

    // Extract detected food classes from YOLOv8 predictions
    const detections = response.data.results || [];
    const foodItems: string[] = detections
      .map((det: any) => det.class_name || det.name)
      .filter((name: string) => name);

    return foodItems.length > 0 ? foodItems : [];
  } catch (error) {
    console.error("YOLOv8 detection error:", error);
    throw new Error("Failed to detect food items");
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// RECOGNIZEFOOD — Process image and return IFCT 2017 nutrition data ONLY
// ═════════════════════════════════════════════════════════════════════════════

export async function recognizeFood(
  imageUrl: string
): Promise<FoodRecognitionResult> {
  try {
    // Step 1: Detect food items using YOLOv8
    const detectedFoods = await detectFood(imageUrl);

    if (!detectedFoods || detectedFoods.length === 0) {
      return {
        food_name: "",
        confidence: 0,
        calories: 0,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
        fiber_g: 0,
        description:
          "No food detected. Please upload a clear image of Indian food.",
        ifct_source: true,
      };
    }

    // Step 2: Get primary detected food
    const primaryFood = detectedFoods[0];

    // Step 3: Query IFCT 2017 ONLY
    const nutritionData: NutritionLookupResult = await compositions(primaryFood);

    if (!nutritionData.found) {
      return {
        food_name: primaryFood,
        confidence: 0,
        calories: 0,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
        fiber_g: 0,
        description: nutritionData.error || `Nutrition data not available in IFCT 2017 for: ${primaryFood}`,
        ifct_source: true,
      };
    }

    // Step 4: Return IFCT 2017 nutrition data
    return {
      food_name: nutritionData.food_name,
      confidence: nutritionData.match_confidence,
      calories: nutritionData.calories,
      protein_g: nutritionData.protein_g,
      carbs_g: nutritionData.carbs_g,
      fat_g: nutritionData.fat_g,
      fiber_g: nutritionData.fiber_g,
      description: `${nutritionData.food_name} (IFCT 2017 - Confidence: ${(nutritionData.match_confidence * 100).toFixed(0)}%)`,
      ifct_source: true,
    };
  } catch (error) {
    console.error("Food recognition error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return {
      food_name: "Error",
      confidence: 0,
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      description: `Food recognition failed: ${errorMessage}`,
      ifct_source: true,
      setup_error: errorMessage,
    };
  }
}
