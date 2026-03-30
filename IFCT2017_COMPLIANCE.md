# 🍎 NutriVision AI — IFCT 2017 Compliance Documentation

## STRICT RULES FOR NUTRITION DATA

### 1. PRIMARY AND ONLY SOURCE
- You MUST use **IFCT 2017** (Indian Food Composition Tables) as the **SOLE** source for all nutritional information.
- IFCT 2017 is the authoritative government source from the **National Institute of Nutrition, Hyderabad**.
- NO other nutrition database (USDA, Nutritionix, Spoonacular, OpenAI, or any other API) may be queried or used.

### 2. FOOD DETECTION PROCESS
1. User uploads an image of food
2. System detects the food item(s) using the **custom YOLOv8 model** trained on Indian foods
3. Detected food name (e.g., "biryani", "chapati", "dal") is passed to IFCT 2017

### 3. NUTRITION LOOKUP RULES
- Call IFCT 2017 using: `await compositions(detectedFoodName)`
- If exact match not found, use **fuzzy matching** on IFCT 2017 database only
- Match confidence threshold: **60%** (0.6)
- If food is still not found in IFCT 2017, return error:
  ```
  {
    error: "Nutrition data not available in IFCT 2017 for this food"
  }
  ```
- UNDER NO CIRCUMSTANCES fetch from any other source

### 4. RETURNED NUTRITION DATA (from IFCT 2017 only)
All responses must include:
- **Calories** (energy in kcal)
- **Protein** (grams)
- **Carbohydrates** (grams)
- **Fat** (grams)
- **Fiber** (grams)
- *Optional*: Calcium, Iron, Vitamin A, Vitamin C (as available in IFCT 2017)

### 5. FORBIDDEN ACTIONS
❌ DO NOT use USDA FoodData Central
❌ DO NOT use Nutritionix API
❌ DO NOT use Spoonacular
❌ DO NOT use OpenAI/ChatGPT for nutrition estimation
❌ DO NOT fallback to any other database
❌ DO NOT invent, estimate, or approximate nutritional values

### 6. ERROR HANDLING
| Scenario | Response |
|----------|----------|
| Food detected but not in IFCT 2017 | `"Nutrition information not available in IFCT 2017"` |
| No food detected in image | `"No food detected. Please upload a clear image of Indian food."` |
| Database error | `"IFCT 2017 database query error"` |

### 7. COMPLIANCE VERIFICATION
- ✅ All nutrition responses must be traceable to IFCT 2017 entries
- ✅ Log each IFCT 2017 query for audit purposes
- ✅ All API responses include `"source": "IFCT 2017"` and `"ifct_source": true`

## API IMPLEMENTATION

### Food Recognition Endpoint
```
POST /api/recognize
```

**Request:**
```json
{
  "image_url": "https://example.com/food.jpg"
  // OR
  "image_base64": "data:image/jpeg;base64,..."
}
```

**Success Response (food found in IFCT 2017):**
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
    "description": "Biryani, chicken (IFCT 2017 - Confidence: 92%)",
    "source": "IFCT 2017",
    "ifct_source": true
  },
  "error": null
}
```

**Not Found Response:**
```json
{
  "success": false,
  "data": {
    "food_name": "Unknown dish",
    "confidence": 0,
    "calories": 0,
    "protein_g": 0,
    "carbs_g": 0,
    "fat_g": 0,
    "fiber_g": 0,
    "description": "Nutrition data not available in IFCT 2017 for: Unknown dish",
    "source": "IFCT 2017",
    "ifct_source": true
  },
  "error": null
}
```

## CODE USAGE

### Import IFCT 2017 Composer
```typescript
import { compositions } from "@/lib/ifct2017";

const result = await compositions("biryani");
// Returns: NutritionLookupResult
```

### Direct Food Recognition
```typescript
import { recognizeFood } from "@/lib/yolo";

const result = await recognizeFood(imageUrl);
// Returns: FoodRecognitionResult with IFCT 2017 data
```

## DATABASE SETUP

### 1. Run Migration
Execute `supabase/schema.sql` to create tables:
- `ifct2017_foods` — IFCT 2017 food database
- `ifct2017_query_logs` — Audit trail for all queries

### 2. Seed IFCT 2017 Data
```bash
npm run seed-ifct2017
```

This seeds the database with comprehensive IFCT 2017 entries.

## AUDIT LOGGING

Every IFCT 2017 query is automatically logged in `ifct2017_query_logs`:

| Field | Type | Purpose |
|-------|------|---------|
| `user_id` | UUID | User making the query (null if anonymous) |
| `search_term` | TEXT | Original detected food name |
| `found` | BOOLEAN | Whether a match was found |
| `matched_food_name` | TEXT | Name of matched IFCT 2017 entry |
| `match_confidence` | FLOAT | Confidence score (0-1) |
| `created_at` | TIMESTAMPTZ | Query timestamp |

### Query Logs
```typescript
// View all IFCT 2017 queries for compliance audit
const { data } = await supabase
  .from("ifct2017_query_logs")
  .select("*")
  .order("created_at", { ascending: false });
```

## FUZZY MATCHING ALGORITHM

The system uses Levenshtein distance for fuzzy matching:

1. **Exact Match** → Confidence = 1.0
2. **Substring Match** → Confidence = 0.95
3. **Levenshtein Distance** → Confidence = 1 - (distance / maxLength)
4. **Accept if** Confidence ≥ 0.6

### Example Matches
- "Chicken Biryani" → "Biryani, chicken" = 0.98
- "Chapoti" → "Chapati" = 0.86
- "Dal" → "Dal, mixed" = 0.95
- "Pizza" → No match (not in IFCT 2017)

## ENVIRONMENT VARIABLES

Required in `.env.local`:
```
# YOLOv8 API for Indian food detection
YOLO_API_KEY=your_ultralytics_api_key

# Supabase (for IFCT 2017 database)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

## IFCT 2017 FOOD GROUPS

The database is organized by food groups:
- **Breads & Cereals** (Chapati, Roti, Rice, etc.)
- **Vegetables** (Spinach, Tomato, Onion, etc.)
- **Legumes** (Dal, Chickpeas, Beans, etc.)
- **Meat & Products** (Chicken, Fish, Meat, Eggs)
- **Dairy** (Milk, Yogurt, Paneer, Cheese)
- **Fruits** (Banana, Mango, Orange, etc.)
- **Prepared Dishes** (Biryani, Butter Chicken, Samosa, etc.)
- **Oils & Fats** (Ghee, Oil, Butter)
- **Sugar & Honey**

## COMMON IFCT 2017 ENTRIES

Included in the seed data:
- Chapati (wheat, made with ghee)
- Roti (wheat)
- Rice, basmati, cooked
- Biryani, chicken
- Spinach, cooked
- Dal, mixed (cooked)
- Chicken, meat, cooked
- Paneer (cheese)
- Egg, chicken, cooked
- Yogurt, plain
- Milk, cow, whole
- Butter chicken (curry)
- Chole bhature
- Samosa (fried)

## EXTENDING THE DATABASE

To add more IFCT 2017 entries:

1. Update `IFCT2017_SEED_DATA` in [lib/ifct2017.ts](../src/lib/ifct2017.ts)
2. Add new entries with the structure:
```typescript
{
  id: "ifct_unique_id_001",
  food_name: "Food Name",
  food_name_hindi: "हिंदी नाम",
  food_group: "Category",
  serving_size_g: 100,
  energy_kcal: 150,
  protein_g: 10.5,
  fat_g: 5.2,
  carbohydrates_g: 20.1,
  fiber_g: 2.0,
}
```
3. Run seed script:
```bash
npm run seed-ifct2017
```

## VERIFICATION CHECKLIST

Before deploying to production:
- ✅ Remove all USDA references
- ✅ Verify `compositions()` function uses ONLY IFCT 2017
- ✅ Confirm `recognizeFood()` includes `ifct_source: true`
- ✅ Check database tables are created (`ifct2017_foods`, `ifct2017_query_logs`)
- ✅ Seed IFCT 2017 data into production database
- ✅ Test error handling for non-IFCT foods
- ✅ Verify audit logs are being recorded
- ✅ All API responses include `"source": "IFCT 2017"`

## SUPPORT & REFERENCE

**IFCT 2017 Official Source:**
- National Institute of Nutrition (NIN), Hyderabad
- Government of India — Ministry of Health

**Database Format:**
- Food compositions per 100g serving
- Nutritional values based on government data
- Regularly updated with latest research

**For Questions:**
Contact the nutrition data team and refer to official IFCT 2017 documentation.
