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
          error: "❌ No input provided (image or food name required)",
        },
        { status: 400 }
      );
    }

    // 🟢 STEP 2: STRICT IFCT LOOKUP
    const nutrition = await compositions(foodName);

    // ❌ BLOCK NON-IFCT RESULTS COMPLETELY
    if (!nutrition.found || !nutrition.food_name) {
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
          description: `❌ '${foodName}' is not available in IFCT 2017 database.`,
          suggestion:
            "Try: Roti, Chapati, Dal, Rice, Biryani, Paneer, Idli, Dosa",
        },
        source: "IFCT 2017",
      });
    }

    // 🟢 STEP 3: VALIDATE DATA (FIXED ✅)
    if (
      nutrition.energy_kcal === undefined ||
      nutrition.protein_g === undefined
    ) {
      return NextResponse.json({
        success: false,
        error: "❌ Invalid nutrition data from IFCT",
      });
    }

    // ✅ STEP 4: RETURN CLEAN IFCT DATA ONLY (FIXED ✅)
    return NextResponse.json({
      success: true,
      data: {
        food_name: nutrition.food_name,
        confidence: nutrition.confidence ?? 1,
        calories: nutrition.energy_kcal,
        protein_g: nutrition.protein_g,
        carbs_g: nutrition.carbohydrates_g,
        fat_g: nutrition.fat_g,
        fiber_g: nutrition.fiber_g,
        description: `${nutrition.food_name} (IFCT 2017 Verified)`,

        // 🔒 Compliance flags
        source: "IFCT 2017",
        ifct_source: true,
      },
    });
  } catch (error) {
    console.error("API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "❌ Internal server error",
        source: "IFCT 2017",
      },
      { status: 500 }
    );
  }
}