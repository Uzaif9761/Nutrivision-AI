import { NextRequest, NextResponse } from "next/server";
import { recognizeFood } from "@/lib/replicate";

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
        { error: "No image provided. Send image_url or image_base64." },
        { status: 400 }
      );
    }

    const result = await recognizeFood(imageInput);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    console.error("Food recognition error:", error);
    const message = error instanceof Error ? error.message : "Recognition failed";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
