import { NextRequest, NextResponse } from "next/server";
import { detectFoodWithYOLO } from "@/lib/yolo";
import { compositions } from "@/lib/ifct2017";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image_base64, manual_food_name } = body;

    let foodName = "";

    // 🟢 STEP 1: HANDLE INPUT
    if (manual_food_name && manual_food_name.trim()) {
      foodName = manual_food_name.trim();
    } 
    else if (image_base64) {
      const detection = await detectFoodWithYOLO(image_base64);

      if (!detection.foodName || detection.foodName === "unknown") {
        return NextResponse.json({
          success: false,
          error: "❌ No recognizable food detected in image",
        });
      }

      foodName = detection.foodName;
    } 
    else {
      return NextResponse.json(
        {
          success: false,
          error: "❌ No input provided",
        },
        { status: 400 }
      );
    }

    // 🟢 STEP 2: IFCT LOOKUP
    const nutrition = await compositions(foodName);

    // ❌ BLOCK NON-IFCT
    if (!nutrition.found) {
      return NextResponse.json({
        success: false,
        data: {
          food_name: foodName,
          confidence: 0,
          calories: 0,
          protein_g: 0,
          carbs_g: 0,
          fat_g: 0,
          fiber_g: 0,
          description: `❌ '${foodName}' not found in IFCT 2017`,
        },
      });
    }

    // 🟢 STEP 3: VALIDATION (FIXED ✅)
    if (
      nutrition.calories === undefined ||
      nutrition.protein_g === undefined
    ) {
      return NextResponse.json({
        success: false,
        error: "❌ Invalid IFCT data",
      });
    }

    // ✅ STEP 4: RETURN CLEAN DATA (FIXED ✅)
    return NextResponse.json({
      success: true,
      data: {
        food_name: nutrition.food_name,
        confidence: nutrition.match_confidence ?? 1,
        calories: nutrition.calories,
        protein_g: nutrition.protein_g,
        carbs_g: nutrition.carbs_g,
        fat_g: nutrition.fat_g,
        fiber_g: nutrition.fiber_g,
        description: `${nutrition.food_name} (IFCT 2017 Verified)`,
        source: "IFCT 2017",
      },
    });
  } catch (error) {
    console.error("API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "❌ Internal server error",
      },
      { status: 500 }
    );
  }
}