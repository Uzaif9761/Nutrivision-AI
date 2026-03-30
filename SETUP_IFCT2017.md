# 🍎 NutriVision AI — IFCT 2017 Implementation Setup

## ✅ Quick Start Guide

This guide walks through setting up NutriVision AI with strict IFCT 2017 compliance.

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account and project
- Ultralytics YOLO API key
- Service Role Key from Supabase (for seeding)

---

## 📋 Setup Steps

### Step 1: Environment Configuration

Edit `.env.local`:

```bash
# Supabase Connection
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # For seeding

# YOLOv8 API (Food Detection)
YOLO_API_KEY=your_ultralytics_key

# Optional
REPLICATE_API_TOKEN=optional_token
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Get Supabase Service Role Key:**
1. Go to https://app.supabase.com
2. Select your project
3. Settings → API → Copy "service_role" key
4. Add to `.env.local`

---

### Step 2: Database Setup

#### Option A: Direct SQL (Recommended)
1. Open Supabase SQL Editor
2. Copy contents of `supabase/schema.sql`
3. Paste and execute

#### Option B: Supabase CLI
```bash
supabase migration new init_ifct2017
supabase db push
```

**Tables created:**
- `ifct2017_foods` — IFCT 2017 nutrition database
- `ifct2017_query_logs` — Audit trail for all queries
- `food_logs` — User food entries
- `nutrition_data` — Nutrition records
- Profiles, Daily Goals, etc.

---

### Step 3: Seed IFCT 2017 Data

Install dependencies:
```bash
npm install
```

Populate the database:
```bash
npm run seed-ifct2017
```

**Expected output:**
```
🍎 NutriVision AI — IFCT 2017 Seed Script
==================================================

📋 Source: Indian Food Composition Tables (IFCT 2017)
🏛️  Authority: National Institute of Nutrition, Hyderabad

✅ Successfully seeded 17 entries
   Status: 201

📊 Sample IFCT 2017 Entries Seeded:
──────────────────────────────────────────────────

1. Chapati (wheat, made with ghee)
   Group: Breads & Cereals
   Energy: 79 kcal | Protein: 2.6g
   Carbs: 10.9g | Fat: 3.2g | Fiber: 1.8g

... and more entries
```

---

### Step 4: Run Development Server

```bash
npm run dev
```

Server runs at: `http://localhost:3000`

---

## 🧪 Testing the Implementation

### Test 1: Check IFCT 2017 Data

```bash
# Access Supabase console
# Navigate to: ifct2017_foods table
# Should see entries like: Chapati, Biryani, Dal, etc.
```

### Test 2: Test Food Recognition API

```bash
curl -X POST http://localhost:3000/api/recognize \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://example.com/biryani.jpg"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "food_name": "Biryani, chicken",
    "confidence": 0.92,
    "calories": 396,
    "protein_g": 15.2,
    "carbs_g": 42.1,
    "fat_g": 18.5,
    "fiber_g": 1.2,
    "source": "IFCT 2017",
    "ifct_source": true,
    "description": "Biryani, chicken (IFCT 2017 - Confidence: 92%)"
  }
}
```

### Test 3: Test Audit Logging

```bash
# In Supabase console, check ifct2017_query_logs table
# Should see entries for food searches
```

---

## 🔧 Troubleshooting

### Issue: "IFCT 2017 database query error"

**Solution:**
- Verify Supabase connection
- Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Ensure `ifct2017_foods` table exists

### Issue: Seeding fails with "permission denied"

**Solution:**
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Check Supabase project settings for RLS policies
- Disable RLS on `ifct2017_foods` table (or create INSERT policy)

### Issue: Food not found in IFCT 2017

**Expected behavior:**
- System only returns data for foods in IFCT 2017 database
- Non-Indian foods will return "not available in IFCT 2017" error
- This is by design (compliance rule)

---

## 📊 Database Schema

### ifct2017_foods
```sql
id (TEXT) — Unique identifier
food_name (TEXT) — Primary food name (English)
food_name_hindi (TEXT) — Hindi name
food_group (TEXT) — Category (Breads, Vegetables, etc.)
serving_size_g (INT) — Standard serving (default 100g)
energy_kcal (INT) — Calories
protein_g (FLOAT) — Protein
fat_g (FLOAT) — Fat
carbohydrates_g (FLOAT) — Carbs
fiber_g (FLOAT) — Dietary fiber
calcium_mg (FLOAT) — Calcium
iron_mg (FLOAT) — Iron
vitamin_a_iu (INT) — Vitamin A
vitamin_c_mg (FLOAT) — Vitamin C
created_at (TIMESTAMPTZ) — Record creation time
```

### ifct2017_query_logs
```sql
id (UUID) — Unique log entry
user_id (UUID) — User who made query (nullable)
search_term (TEXT) — Food name searched
found (BOOLEAN) — Was it found?
matched_food_name (TEXT) — Name of matched entry
match_confidence (FLOAT) — Confidence score 0-1
created_at (TIMESTAMPTZ) — Query timestamp
```

---

## 🔐 Security & Compliance

### Row Level Security (RLS)
- ✅ All user tables have RLS enabled
- ✅ Users can only access their own data
- ✅ IFCT 2017 table is public-read
- ✅ Audit logs are system-protected

### IFCT 2017 Compliance
- ✅ ONLY IFCT 2017 data is used
- ✅ No USDA or other databases queried
- ✅ All queries logged for audit
- ✅ Error responses indicate IFCT 2017 source

### API Security
- ✅ Authentication required for user logs
- ✅ Images processed server-side
- ✅ No nutrition data stored on client
- ✅ Service role key never exposed to client

---

## 📚 Extending IFCT 2017 Data

To add more Indian foods:

1. Open `src/lib/ifct2017.ts`
2. Update `IFCT2017_SEED_DATA` array
3. Add entries with proper IFCT 2017 values:

```typescript
{
  id: "ifct_unique_id",
  food_name: "Food Name",
  food_name_hindi: "हिंदी नाम",
  food_group: "Category",
  serving_size_g: 100,
  energy_kcal: 150,
  protein_g: 10.5,
  fat_g: 5.2,
  carbohydrates_g: 20.1,
  fiber_g: 2.0,
  // Optional nutrients
  calcium_mg: 100,
  iron_mg: 2.5,
}
```

4. Reseed the database:
```bash
npm run seed-ifct2017
```

---

## 🎯 API Endpoints

### POST /api/recognize
Detect food and get IFCT 2017 nutrition data

**Request:**
```json
{
  "image_url": "https://example.com/food.jpg"
  // OR
  "image_base64": "data:image/jpeg;base64,..."
}
```

**Response:** See section "Testing the Implementation" → Test 2

### GET /api/nutrition
Fetch user's food logs with nutrition data

**Query params:**
- `date` — Filter by date (YYYY-MM-DD)
- `limit` — Number of entries (default 50)

### POST /api/nutrition
Log a food entry with nutrition data

---

## 📝 Documentation

- `IFCT2017_COMPLIANCE.md` — Detailed compliance rules
- `src/lib/ifct2017.ts` — IFCT 2017 implementation
- `supabase/schema.sql` — Database schema
- `scripts/seed-ifct2017.ts` — Seeding script

---

## ✨ Next Steps

1. ✅ Configure environment variables
2. ✅ Run database migrations
3. ✅ Seed IFCT 2017 data
4. ✅ Start development server
5. ✅ Test food recognition API
6. ✅ Verify audit logging
7. ✅ Deploy to production

---

## 🆘 Support

For issues or questions:
- Check `IFCT2017_COMPLIANCE.md`
- Review Supabase logs
- Check `ifct2017_query_logs` table
- Verify YOLO API connection

---

**Last Updated:** 2024
**Compliance Level:** IFCT 2017 ONLY ✅
