import { NextRequest, NextResponse } from "next/server";
import { recognizeFood } from "@/lib/yolo";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image_url, image_base64 } = body;

    let imageInput: string;

    if (image_url) {
      imageInput = image_url;
    } else if (image_base64) {
      // Convert base64 to data URL if needed
      imageInput = image_base64.startsWith("data:")
        ? image_base64
        : `data:image/jpeg;base64,${image_base64}`;
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "No image provided. Send image_url or image_base64.",
        },
        { status: 400 }
      );
    }

    const result = await recognizeFood(imageInput);

    // STRICT COMPLIANCE: All responses must indicate IFCT 2017 source
    return NextResponse.json({
      success: result.food_name !== "" && result.food_name !== "Error",
      data: {
        food_name: result.food_name,
        confidence: result.confidence,
        calories: result.calories,
        protein_g: result.protein_g,
        carbs_g: result.carbs_g,
        fat_g: result.fat_g,
        fiber_g: result.fiber_g,
        description: result.description,
        source: "IFCT 2017", // Always IFCT 2017
        ifct_source: result.ifct_source,
      },
      error: result.setup_error || null,
    });
  } catch (error: unknown) {
    console.error("Food recognition error:", error);
    const message =
      error instanceof Error ? error.message : "Recognition failed";

    return NextResponse.json(
      {
        success: false,
        error: message,
        source: "IFCT 2017",
      },
      { status: 500 }
    );
  }
}
