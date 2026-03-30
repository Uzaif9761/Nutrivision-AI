-- ═══════════════════════════════════════════
-- 🍎 NutriVision AI — Supabase Database Schema
-- Run this in the Supabase SQL Editor
-- ═══════════════════════════════════════════

-- ── Profiles ──
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  daily_calorie_target INT DEFAULT 2000,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Food Logs ──
CREATE TABLE IF NOT EXISTS food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  food_name TEXT NOT NULL,
  image_url TEXT,
  confidence FLOAT,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')) DEFAULT 'snack',
  logged_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Nutrition Data ──
CREATE TABLE IF NOT EXISTS nutrition_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_log_id UUID REFERENCES food_logs(id) ON DELETE CASCADE NOT NULL,
  calories INT DEFAULT 0,
  protein_g FLOAT DEFAULT 0,
  carbs_g FLOAT DEFAULT 0,
  fat_g FLOAT DEFAULT 0,
  fiber_g FLOAT DEFAULT 0
);

-- ── Daily Goals ──
CREATE TABLE IF NOT EXISTS daily_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  calories INT DEFAULT 2000,
  protein_g FLOAT DEFAULT 150,
  carbs_g FLOAT DEFAULT 250,
  fat_g FLOAT DEFAULT 65,
  updated_at TIMESTAMPTZ DEFAULT now()
);

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

-- ── IFCT 2017 Query Audit Log ──
CREATE TABLE IF NOT EXISTS ifct2017_query_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  search_term TEXT NOT NULL,
  found BOOLEAN DEFAULT FALSE,
  matched_food_name TEXT,
  match_confidence FLOAT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ifct2017_foods_name ON ifct2017_foods(food_name);
CREATE INDEX IF NOT EXISTS idx_ifct2017_foods_group ON ifct2017_foods(food_group);
CREATE INDEX IF NOT EXISTS idx_ifct2017_query_logs_user ON ifct2017_query_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ifct2017_query_logs_created ON ifct2017_query_logs(created_at);

-- ═══════════════════════════════════════════
-- Row Level Security (RLS)
-- ═══════════════════════════════════════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_goals ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Food Logs: users can CRUD their own logs
CREATE POLICY "Users can view own food logs"
  ON food_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food logs"
  ON food_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own food logs"
  ON food_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Nutrition Data: accessible via food_log ownership
CREATE POLICY "Users can view own nutrition data"
  ON nutrition_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM food_logs
      WHERE food_logs.id = nutrition_data.food_log_id
      AND food_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own nutrition data"
  ON nutrition_data FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM food_logs
      WHERE food_logs.id = nutrition_data.food_log_id
      AND food_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own nutrition data"
  ON nutrition_data FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM food_logs
      WHERE food_logs.id = nutrition_data.food_log_id
      AND food_logs.user_id = auth.uid()
    )
  );

-- Daily Goals: users can CRUD their own goals
CREATE POLICY "Users can view own goals"
  ON daily_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON daily_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON daily_goals FOR UPDATE
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════
-- Indexes for Performance
-- ═══════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_food_logs_user_id ON food_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_food_logs_logged_at ON food_logs(logged_at);
CREATE INDEX IF NOT EXISTS idx_nutrition_data_food_log_id ON nutrition_data(food_log_id);
CREATE INDEX IF NOT EXISTS idx_daily_goals_user_id ON daily_goals(user_id);
