import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🍽️ MEALS API — Anonymous meal logging (NO AUTH REQUIRED)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * GET /api/meals
 * Fetch all meals logged today or within a date range
 * Query params:
 *   - date: ISO string for specific date (e.g., "2026-03-31")
 *   - limit: max number of meals to return (default: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

    let query = supabase
      .from("meals")
      .select("*")
      .order("logged_at", { ascending: false })
      .limit(limit);

    // Filter by date if provided
    if (date) {
      const startOfDay = `${date}T00:00:00.000Z`;
      const endOfDay = `${date}T23:59:59.999Z`;
      query = query.gte("logged_at", startOfDay).lte("logged_at", endOfDay);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Meals fetch error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch meals";
    console.error("Meals API error:", error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/meals
 * Log a new meal (IFCT 2017 data)
 * Required fields:
 *   - food_name: string (name of the food)
 *   - meal_type: "breakfast" | "lunch" | "dinner" | "snack"
 *   - calories: number
 *   - protein_g: number
 *   - carbs_g: number
 *   - fat_g: number
 *   - fiber_g: number
 * Optional fields:
 *   - image_url: string (image URL)
 *   - confidence: number (detection confidence)
 *   - quantity_g: number (served quantity in grams)
 *   - ifct_entry_id: string (IFCT 2017 entry ID)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      food_name,
      meal_type = "snack",
      calories = 0,
      protein_g = 0,
      carbs_g = 0,
      fat_g = 0,
      fiber_g = 0,
      image_url = null,
      confidence = 0,
      quantity_g = 100,
      ifct_entry_id = null,
    } = body;

    // Validation
    if (!food_name || !meal_type) {
      return NextResponse.json(
        { success: false, error: "food_name and meal_type are required" },
        { status: 400 }
      );
    }

    if (!["breakfast", "lunch", "dinner", "snack"].includes(meal_type)) {
      return NextResponse.json(
        { success: false, error: "Invalid meal_type" },
        { status: 400 }
      );
    }

    // Insert meal record (NO AUTH REQUIRED)
    const supabase = createClient();
    const { data, error } = await supabase
      .from("meals")
      .insert({
        food_name,
        meal_type,
        calories,
        protein_g,
        carbs_g,
        fat_g,
        fiber_g,
        image_url,
        confidence,
        quantity_g,
        ifct_entry_id,
        logged_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      console.error("Meal insert error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data?.[0] || null,
      message: "Meal logged successfully",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to log meal";
    console.error("Meals POST error:", error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/meals
 * Delete a meal by ID
 * Query params:
 *   - id: UUID of the meal to delete
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "id query parameter is required" },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { error } = await supabase.from("meals").delete().eq("id", id);

    if (error) {
      console.error("Meal delete error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Meal deleted successfully",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete meal";
    console.error("Meals DELETE error:", error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
