-- ═══════════════════════════════════════════
-- 🍎 NutriVision AI — Supabase Database Schema
-- Run this in the Supabase SQL Editor
-- ═══════════════════════════════════════════
-- NO AUTH REQUIRED — Anonymous public app
-- ═══════════════════════════════════════════

-- ── Meals (Anonymous-friendly) ──
-- This table stores meal logs WITHOUT requiring user authentication
CREATE TABLE IF NOT EXISTS meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_name TEXT NOT NULL,
  image_url TEXT,
  confidence FLOAT,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')) DEFAULT 'snack',
  quantity_g FLOAT DEFAULT 100,
  calories INT DEFAULT 0,
  protein_g FLOAT DEFAULT 0,
  carbs_g FLOAT DEFAULT 0,
  fat_g FLOAT DEFAULT 0,
  fiber_g FLOAT DEFAULT 0,
  ifct_entry_id TEXT,
  logged_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for meals table
CREATE INDEX IF NOT EXISTS idx_meals_created_at ON meals(created_at);
CREATE INDEX IF NOT EXISTS idx_meals_logged_at ON meals(logged_at);
CREATE INDEX IF NOT EXISTS idx_meals_ifct_entry_id ON meals(ifct_entry_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- IFCT 2017 — Indian Food Composition Tables Database
-- STRICT COMPLIANCE: This is the ONLY source for nutrition data
-- ─────────────────────────────────────────────────────────────────────────────

-- ── IFCT 2017 Foods ──
CREATE TABLE IF NOT EXISTS ifct2017_foods (
  id TEXT PRIMARY KEY,
  food_name TEXT NOT NULL UNIQUE,
  food_name_hindi TEXT,
  food_group TEXT NOT NULL,
  serving_size_g INT DEFAULT 100,
  energy_kcal INT NOT NULL,
  protein_g FLOAT NOT NULL,
  fat_g FLOAT NOT NULL,
  carbohydrates_g FLOAT NOT NULL,
  fiber_g FLOAT DEFAULT 0,
  calcium_mg FLOAT,
  iron_mg FLOAT,
  vitamin_a_iu INT,
  vitamin_c_mg FLOAT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ──IFCT 2017 Query Audit Log ──
-- Updated to NOT require user_id (allows anonymous queries)
CREATE TABLE IF NOT EXISTS ifct2017_query_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,  -- nullable for anonymous queries
  search_term TEXT NOT NULL,
  found BOOLEAN DEFAULT FALSE,
  matched_food_name TEXT,
  match_confidence FLOAT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ifct2017_foods_name ON ifct2017_foods(food_name);
CREATE INDEX IF NOT EXISTS idx_ifct2017_foods_group ON ifct2017_foods(food_group);
CREATE INDEX IF NOT EXISTS idx_ifct2017_query_logs_created ON ifct2017_query_logs(created_at);

-- ═══════════════════════════════════════════
-- Row Level Security (RLS) — PUBLIC ACCESS
-- ═══════════════════════════════════════════

-- MEALS: Public insert and select (no auth required)
ALTER TABLE meals DISABLE ROW LEVEL SECURITY;

-- IFCT 2017 Foods: Read-only public access
ALTER TABLE ifct2017_foods DISABLE ROW LEVEL SECURITY;

-- IFCT 2017 Query Logs: Public insert (no auth required)
ALTER TABLE ifct2017_query_logs DISABLE ROW LEVEL SECURITY;
