#!/usr/bin/env node

/**
 * 🍎 NutriVision AI — IFCT 2017 Database Seed Script
 *
 * This script seeds the Supabase database with IFCT 2017 food composition data.
 * STRICT COMPLIANCE: Only IFCT 2017 data is imported.
 *
 * Usage:
 *   npx ts-node scripts/seed-ifct2017.ts
 *   or
 *   npm run seed-ifct2017
 */

import { createClient } from "@supabase/supabase-js";
import { IFCT2017_SEED_DATA } from "../src/lib/ifct2017";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Missing Supabase credentials");
  console.error("   Required:");
  console.error("   - NEXT_PUBLIC_SUPABASE_URL");
  console.error("   - SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  console.log("\n🍎 NutriVision AI — IFCT 2017 Seed Script");
  console.log("═".repeat(50));
  console.log(
    "\n📋 Source: Indian Food Composition Tables (IFCT 2017)"
  );
  console.log("🏛️  Authority: National Institute of Nutrition, Hyderabad\n");

  try {
    // Check if table exists and has data
    console.log("🔍 Checking existing IFCT 2017 data...");
    const { count, error: countError } = await supabase
      .from("ifct2017_foods")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error(
        "❌ Error checking table:",
        countError.message
      );
      process.exit(1);
    }

    if (count && count > 0) {
      console.log(`   ℹ️  Table already contains ${count} entries`);
      console.log(
        "   To re-seed, delete existing data first or skip this step.\n"
      );
    }

    // Insert IFCT 2017 seed data
    console.log(`📥 Seeding ${IFCT2017_SEED_DATA.length} IFCT 2017 entries...`);

    const { data, error, status } = await supabase
      .from("ifct2017_foods")
      .insert(IFCT2017_SEED_DATA)
      .select();

    if (error) {
      console.error("❌ Seeding failed:", error.message);
      console.error("   Details:", error.details);
      process.exit(1);
    }

    console.log(`✅ Successfully seeded ${data?.length || 0} entries`);
    console.log(`   Status: ${status}\n`);

    // Display sample entries
    console.log("📊 Sample IFCT 2017 Entries Seeded:");
    console.log("─".repeat(50));

    const samples = data?.slice(0, 5) || [];
    samples.forEach((entry: any, idx: number) => {
      console.log(`\n${idx + 1}. ${entry.food_name}`);
      console.log(`   Group: ${entry.food_group}`);
      console.log(
        `   Energy: ${entry.energy_kcal} kcal | Protein: ${entry.protein_g}g`
      );
      console.log(
        `   Carbs: ${entry.carbohydrates_g}g | Fat: ${entry.fat_g}g | Fiber: ${entry.fiber_g}g`
      );
    });

    if (data && data.length > 5) {
      console.log(`\n... and ${data.length - 5} more entries`);
    }

    console.log("\n" + "═".repeat(50));
    console.log("✅ IFCT 2017 Database Seeding Complete!");
    console.log("━".repeat(50));
    console.log("\n📝 Next Steps:");
    console.log("   1. Verify data in Supabase console");
    console.log("   2. Test food recognition API");
    console.log("   3. Check audit logs in ifct2017_query_logs table");
    console.log("\n🔐 Compliance Status: IFCT 2017 ONLY");
    console.log("   No USDA or other sources are used.\n");
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    process.exit(1);
  }
}

main();
