import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET — Fetch user's food logs
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const limit = parseInt(searchParams.get("limit") || "50");

    let query = supabase
      .from("food_logs")
      .select(`
        *,
        nutrition_data (*)
      `)
      .eq("user_id", user.id)
      .order("logged_at", { ascending: false })
      .limit(limit);

    if (date) {
      const startOfDay = `${date}T00:00:00.000Z`;
      const endOfDay = `${date}T23:59:59.999Z`;
      query = query.gte("logged_at", startOfDay).lte("logged_at", endOfDay);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch logs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST — Create a new food log
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      food_name,
      image_url,
      confidence,
      meal_type,
      calories,
      protein_g,
      carbs_g,
      fat_g,
      fiber_g,
    } = body;

    // Insert food log
    const { data: foodLog, error: logError } = await supabase
      .from("food_logs")
      .insert({
        user_id: user.id,
        food_name,
        image_url: image_url || null,
        confidence: confidence || null,
        meal_type: meal_type || "snack",
      })
      .select()
      .single();

    if (logError) throw logError;

    // Insert nutrition data
    const { error: nutritionError } = await supabase
      .from("nutrition_data")
      .insert({
        food_log_id: foodLog.id,
        calories: calories || 0,
        protein_g: protein_g || 0,
        carbs_g: carbs_g || 0,
        fat_g: fat_g || 0,
        fiber_g: fiber_g || 0,
      });

    if (nutritionError) throw nutritionError;

    return NextResponse.json({
      success: true,
      data: foodLog,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create log";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE — Remove a food log
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing log ID" }, { status: 400 });
    }

    // Delete nutrition data first (cascade)
    await supabase.from("nutrition_data").delete().eq("food_log_id", id);

    // Delete food log
    const { error } = await supabase
      .from("food_logs")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete log";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
