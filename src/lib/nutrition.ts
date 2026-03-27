"use client";

// ═══════════════════════════════════════════
// 🍎 NutriVision AI — Nutrition Utilities
// ═══════════════════════════════════════════

export interface NutritionEntry {
  id: string;
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  image_url?: string;
  confidence?: number;
  logged_at: string;
}

export interface DailyGoals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export const DEFAULT_GOALS: DailyGoals = {
  calories: 2000,
  protein_g: 150,
  carbs_g: 250,
  fat_g: 65,
};

export function calculateDailyTotals(entries: NutritionEntry[]) {
  return entries.reduce(
    (totals, entry) => ({
      calories: totals.calories + entry.calories,
      protein_g: totals.protein_g + entry.protein_g,
      carbs_g: totals.carbs_g + entry.carbs_g,
      fat_g: totals.fat_g + entry.fat_g,
      fiber_g: totals.fiber_g + entry.fiber_g,
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 }
  );
}

export function calculateProgress(current: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(100, Math.round((current / goal) * 100));
}

export function getMealTypeIcon(mealType: string): string {
  switch (mealType) {
    case "breakfast": return "☀️";
    case "lunch": return "🌤️";
    case "dinner": return "🌙";
    case "snack": return "🍿";
    default: return "🍽️";
  }
}

export function formatCalories(calories: number): string {
  return calories >= 1000
    ? `${(calories / 1000).toFixed(1)}k`
    : `${calories}`;
}

// Generate mock data for demo purposes (when Supabase isn't connected)
export function generateMockEntries(): NutritionEntry[] {
  const today = new Date().toISOString();
  return [
    {
      id: "1",
      food_name: "Avocado Toast with Eggs",
      calories: 420,
      protein_g: 18,
      carbs_g: 35,
      fat_g: 24,
      fiber_g: 8,
      meal_type: "breakfast",
      confidence: 0.94,
      logged_at: today,
    },
    {
      id: "2",
      food_name: "Grilled Chicken Salad",
      calories: 380,
      protein_g: 42,
      carbs_g: 15,
      fat_g: 16,
      fiber_g: 6,
      meal_type: "lunch",
      confidence: 0.91,
      logged_at: today,
    },
    {
      id: "3",
      food_name: "Greek Yogurt & Berries",
      calories: 180,
      protein_g: 15,
      carbs_g: 22,
      fat_g: 4,
      fiber_g: 3,
      meal_type: "snack",
      confidence: 0.97,
      logged_at: today,
    },
    {
      id: "4",
      food_name: "Salmon with Quinoa",
      calories: 520,
      protein_g: 38,
      carbs_g: 45,
      fat_g: 18,
      fiber_g: 5,
      meal_type: "dinner",
      confidence: 0.88,
      logged_at: today,
    },
  ];
}

export function generateWeeklyData() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((day) => ({
    day,
    calories: Math.floor(Math.random() * 600) + 1600,
    protein: Math.floor(Math.random() * 50) + 100,
    carbs: Math.floor(Math.random() * 80) + 180,
    fat: Math.floor(Math.random() * 30) + 40,
    goal: 2000,
  }));
}
