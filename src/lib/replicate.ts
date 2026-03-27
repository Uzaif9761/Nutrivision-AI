import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export interface FoodRecognitionResult {
  food_name: string;
  confidence: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  description: string;
}

export async function recognizeFood(
  imageUrl: string
): Promise<FoodRecognitionResult> {
  const prompt = `You are a nutrition expert AI. Analyze the food in this image and respond ONLY with valid JSON (no markdown, no explanation). Use this exact format:
{
  "food_name": "name of the food",
  "confidence": 0.95,
  "calories": 350,
  "protein_g": 25.0,
  "carbs_g": 40.0,
  "fat_g": 12.0,
  "fiber_g": 5.0,
  "description": "Brief 1-sentence description of the meal"
}

Estimate the nutritional values per typical serving size. Be as accurate as possible.`;

  const output = await replicate.run("yorickvp/llava-13b:80537f9eead1a5bfa72d5ac6ea6414379be41d4d4f6679fd776e9535d1eb58bb", {
    input: {
      image: imageUrl,
      prompt: prompt,
      max_tokens: 512,
      temperature: 0.1,
    },
  });

  // LLaVA returns an array of text chunks
  const responseText = Array.isArray(output) ? output.join("") : String(output);

  try {
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      food_name: parsed.food_name || "Unknown Food",
      confidence: Math.min(1, Math.max(0, parsed.confidence || 0.7)),
      calories: Math.round(parsed.calories || 0),
      protein_g: parseFloat((parsed.protein_g || 0).toFixed(1)),
      carbs_g: parseFloat((parsed.carbs_g || 0).toFixed(1)),
      fat_g: parseFloat((parsed.fat_g || 0).toFixed(1)),
      fiber_g: parseFloat((parsed.fiber_g || 0).toFixed(1)),
      description: parsed.description || "A food item",
    };
  } catch {
    // Fallback if JSON parsing fails
    return {
      food_name: "Unidentified Food",
      confidence: 0.3,
      calories: 200,
      protein_g: 10,
      carbs_g: 25,
      fat_g: 8,
      fiber_g: 3,
      description: responseText.slice(0, 100),
    };
  }
}
