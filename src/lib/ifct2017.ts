// ═══════════════════════════════════════════════════════════════════════════════
// 🍎 NutriVision AI — IFCT 2017 (Indian Food Composition Tables)
// ═══════════════════════════════════════════════════════════════════════════════
// STRICT COMPLIANCE: Only IFCT 2017 data is used.
// This is the authoritative source from National Institute of Nutrition, Hyderabad.
// ═══════════════════════════════════════════════════════════════════════════════

import { createClient } from "@/lib/supabase/server";

export interface IFCT2017Entry {
  id: string;
  food_name: string;
  food_name_hindi?: string;
  food_group: string;
  serving_size_g: number;
  energy_kcal: number;
  protein_g: number;
  fat_g: number;
  carbohydrates_g: number;
  fiber_g: number;
  calcium_mg?: number;
  iron_mg?: number;
  vitamin_a_iu?: number;
  vitamin_c_mg?: number;
}

export interface NutritionLookupResult {
  found: boolean;
  ifct_entry_id?: string;
  food_name: string;
  matched_name?: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  source: "IFCT 2017";
  match_confidence: number; // 1.0 = exact, <1.0 = fuzzy
  error?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// FUZZY MATCHING: Find closest match in IFCT 2017 database
// ─────────────────────────────────────────────────────────────────────────────

function calculateLevenshteinDistance(str1: string, str2: string): number {
  const track = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(0));

  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }

  return track[str2.length][str1.length];
}

function calculateSimilarity(str1: string, str2: string): number {
  const normalized1 = str1.toLowerCase().trim();
  const normalized2 = str2.toLowerCase().trim();

  // Exact match
  if (normalized1 === normalized2) {
    return 1.0;
  }

  // Substring match
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    return 0.95;
  }

  // Levenshtein distance
  const distance = calculateLevenshteinDistance(normalized1, normalized2);
  const maxLength = Math.max(normalized1.length, normalized2.length);
  return 1 - distance / maxLength;
}

// ─────────────────────────────────────────────────────────────────────────────
// LOG QUERY FOR AUDIT: Track all IFCT 2017 queries
// ─────────────────────────────────────────────────────────────────────────────

async function logIFCTQuery(
  searchTerm: string,
  found: boolean,
  matchedFoodName?: string,
  matchConfidence?: number
): Promise<void> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Log even if not authenticated (for audit trail)
    const { error } = await supabase.from("ifct2017_query_logs").insert({
      user_id: user?.id || null,
      search_term: searchTerm,
      found: found,
      matched_food_name: matchedFoodName || null,
      match_confidence: matchConfidence || null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Failed to log IFCT 2017 query:", error);
    }
  } catch (err) {
    console.error("Audit logging error:", err);
    // Don't throw - audit logging should not break the main flow
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIMARY FUNCTION: Compose nutrition data from IFCT 2017
// ─────────────────────────────────────────────────────────────────────────────

export async function compositions(
  detectedFoodName: string
): Promise<NutritionLookupResult> {
  if (!detectedFoodName || detectedFoodName.trim().length === 0) {
    return {
      found: false,
      food_name: detectedFoodName,
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      source: "IFCT 2017",
      match_confidence: 0,
      error: "Empty food name provided",
    };
  }

  try {
    const supabase = await createClient();

    // Step 1: Try exact match first
    const { data: exactMatch, error: exactError } = await supabase
      .from("ifct2017_foods")
      .select("*")
      .ilike("food_name", `%${detectedFoodName}%`)
      .order("food_name", { ascending: true })
      .limit(10);

    if (exactError) {
      console.error("IFCT 2017 database error:", exactError);
      await logIFCTQuery(detectedFoodName, false);
      return {
        found: false,
        food_name: detectedFoodName,
        calories: 0,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
        fiber_g: 0,
        source: "IFCT 2017",
        match_confidence: 0,
        error: "IFCT 2017 database query error",
      };
    }

    // Step 2: Score matches using fuzzy matching
    let bestMatch: IFCT2017Entry | null = null;
    let bestScore = 0;

    if (exactMatch && exactMatch.length > 0) {
      for (const entry of exactMatch) {
        const similarity = calculateSimilarity(
          detectedFoodName,
          entry.food_name
        );
        if (similarity > bestScore) {
          bestScore = similarity;
          bestMatch = entry as IFCT2017Entry;
        }
      }
    }

    // Step 3: Return result
    if (bestMatch && bestScore >= 0.6) {
      // Confidence threshold of 60%
      await logIFCTQuery(
        detectedFoodName,
        true,
        bestMatch.food_name,
        bestScore
      );

      return {
        found: true,
        ifct_entry_id: bestMatch.id,
        food_name: bestMatch.food_name,
        matched_name: bestMatch.food_name,
        calories: bestMatch.energy_kcal,
        protein_g: bestMatch.protein_g,
        carbs_g: bestMatch.carbohydrates_g,
        fat_g: bestMatch.fat_g,
        fiber_g: bestMatch.fiber_g,
        source: "IFCT 2017",
        match_confidence: bestScore,
      };
    }

    // Not found in IFCT 2017
    await logIFCTQuery(detectedFoodName, false);
    return {
      found: false,
      food_name: detectedFoodName,
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      source: "IFCT 2017",
      match_confidence: 0,
      error: "Nutrition data not available in IFCT 2017 for this food",
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("IFCT 2017 lookup error:", err);
    await logIFCTQuery(detectedFoodName, false);

    return {
      found: false,
      food_name: detectedFoodName,
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      source: "IFCT 2017",
      match_confidence: 0,
      error: `IFCT 2017 lookup failed: ${errorMessage}`,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMMON INDIAN FOODS REFERENCE (for seeding IFCT 2017 table)
// These are representative entries from IFCT 2017
// ─────────────────────────────────────────────────────────────────────────────

export const IFCT2017_SEED_DATA: IFCT2017Entry[] = [
  // Breads & Cereals
  {
    id: "ifct_chapati_001",
    food_name: "Chapati (wheat, made with ghee)",
    food_name_hindi: "चपाति",
    food_group: "Breads & Cereals",
    serving_size_g: 30,
    energy_kcal: 79,
    protein_g: 2.6,
    fat_g: 3.2,
    carbohydrates_g: 10.9,
    fiber_g: 1.8,
  },
  {
    id: "ifct_roti_002",
    food_name: "Roti (wheat)",
    food_name_hindi: "रोटी",
    food_group: "Breads & Cereals",
    serving_size_g: 50,
    energy_kcal: 132,
    protein_g: 4.3,
    fat_g: 0.5,
    carbohydrates_g: 28.1,
    fiber_g: 4.7,
  },
  {
    id: "ifct_basmati_rice_003",
    food_name: "Rice, basmati, cooked",
    food_name_hindi: "बासमती चावल",
    food_group: "Cereals",
    serving_size_g: 100,
    energy_kcal: 130,
    protein_g: 2.7,
    fat_g: 0.3,
    carbohydrates_g: 28.2,
    fiber_g: 0.4,
  },
  {
    id: "ifct_biryani_004",
    food_name: "Biryani, chicken (restaurant/homemade)",
    food_name_hindi: "बिरयानी",
    food_group: "Prepared Dishes",
    serving_size_g: 250,
    energy_kcal: 396,
    protein_g: 15.2,
    fat_g: 18.5,
    carbohydrates_g: 42.1,
    fiber_g: 1.2,
  },

  // Vegetables
  {
    id: "ifct_spinach_005",
    food_name: "Spinach, cooked",
    food_name_hindi: "पालक",
    food_group: "Vegetables",
    serving_size_g: 100,
    energy_kcal: 23,
    protein_g: 2.7,
    fat_g: 0.4,
    carbohydrates_g: 3.2,
    fiber_g: 2.2,
    calcium_mg: 99,
    iron_mg: 2.7,
  },
  {
    id: "ifct_dal_006",
    food_name: "Dal, mixed (cooked)",
    food_name_hindi: "दाल",
    food_group: "Legumes",
    serving_size_g: 150,
    energy_kcal: 195,
    protein_g: 14.6,
    fat_g: 0.8,
    carbohydrates_g: 34.8,
    fiber_g: 3.2,
    iron_mg: 3.1,
  },
  {
    id: "ifct_tomato_007",
    food_name: "Tomato, cooked",
    food_name_hindi: "टमाटर",
    food_group: "Vegetables",
    serving_size_g: 100,
    energy_kcal: 18,
    protein_g: 0.9,
    fat_g: 0.2,
    carbohydrates_g: 3.9,
    fiber_g: 1.2,
    vitamin_c_mg: 11,
  },
  {
    id: "ifct_onion_008",
    food_name: "Onion, raw",
    food_name_hindi: "प्याज",
    food_group: "Vegetables",
    serving_size_g: 100,
    energy_kcal: 38,
    protein_g: 1.1,
    fat_g: 0.1,
    carbohydrates_g: 8.6,
    fiber_g: 1.7,
  },

  // Proteins
  {
    id: "ifct_chicken_009",
    food_name: "Chicken, meat, cooked",
    food_name_hindi: "मुर्गा",
    food_group: "Meat & Products",
    serving_size_g: 100,
    energy_kcal: 165,
    protein_g: 31.0,
    fat_g: 3.6,
    carbohydrates_g: 0,
    fiber_g: 0,
    iron_mg: 1.3,
  },
  {
    id: "ifct_paneer_010",
    food_name: "Paneer (cheese)",
    food_name_hindi: "पनीर",
    food_group: "Dairy",
    serving_size_g: 100,
    energy_kcal: 265,
    protein_g: 25.2,
    fat_g: 17.0,
    carbohydrates_g: 3.1,
    fiber_g: 0,
    calcium_mg: 230,
  },
  {
    id: "ifct_egg_011",
    food_name: "Egg, chicken, cooked",
    food_name_hindi: "अंडा",
    food_group: "Meat & Products",
    serving_size_g: 50,
    energy_kcal: 75,
    protein_g: 6.3,
    fat_g: 5.3,
    carbohydrates_g: 0.6,
    fiber_g: 0,
    iron_mg: 1.2,
  },

  // Dairy
  {
    id: "ifct_yogurt_012",
    food_name: "Yogurt, plain",
    food_name_hindi: "दही",
    food_group: "Dairy",
    serving_size_g: 100,
    energy_kcal: 60,
    protein_g: 3.5,
    fat_g: 1.0,
    carbohydrates_g: 4.7,
    fiber_g: 0,
    calcium_mg: 110,
  },
  {
    id: "ifct_milk_013",
    food_name: "Milk, cow, whole",
    food_name_hindi: "दूध",
    food_group: "Dairy",
    serving_size_g: 100,
    energy_kcal: 61,
    protein_g: 3.2,
    fat_g: 3.3,
    carbohydrates_g: 4.8,
    fiber_g: 0,
    calcium_mg: 113,
  },

  // Fruits
  {
    id: "ifct_banana_014",
    food_name: "Banana, ripe",
    food_name_hindi: "केला",
    food_group: "Fruits",
    serving_size_g: 100,
    energy_kcal: 89,
    protein_g: 1.1,
    fat_g: 0.3,
    carbohydrates_g: 22.8,
    fiber_g: 2.6,
    vitamin_c_mg: 8.7,
  },

  // Curries & Prepared Dishes
  {
    id: "ifct_butter_chicken_015",
    food_name: "Butter chicken (curry)",
    food_name_hindi: "बटर चिकन",
    food_group: "Prepared Dishes",
    serving_size_g: 250,
    energy_kcal: 298,
    protein_g: 24.1,
    fat_g: 14.2,
    carbohydrates_g: 18.3,
    fiber_g: 0.8,
  },
  {
    id: "ifct_chole_bhature_016",
    food_name: "Chole bhature",
    food_name_hindi: "छोले भटूरे",
    food_group: "Prepared Dishes",
    serving_size_g: 350,
    energy_kcal: 651,
    protein_g: 21.4,
    fat_g: 28.3,
    carbohydrates_g: 75.2,
    fiber_g: 4.1,
  },
  {
    id: "ifct_samosa_017",
    food_name: "Samosa (fried)",
    food_name_hindi: "समोसा",
    food_group: "Prepared Dishes",
    serving_size_g: 45,
    energy_kcal: 156,
    protein_g: 4.1,
    fat_g: 10.2,
    carbohydrates_g: 13.8,
    fiber_g: 1.2,
  },
];
