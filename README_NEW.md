# 🍎 NutriVision AI — Food Recognition & Nutrition Analysis

**NutriVision AI** is an intelligent food recognition and nutrition analysis system for Indian foods. It combines **YOLOv8 computer vision** with **IFCT 2017 nutritional data** to provide accurate, government-backed nutrition insights.

## ✨ Features

- **🖼️ Food Recognition** — YOLOv8 model trained on Indian foods
- **📊 IFCT 2017 Nutrition Data** — Authoritative government source
- **🔍 Fuzzy Matching** — Intelligent food name matching (≥60% accuracy)
- **📝 Food Logging** — Track daily meals with automatic nutrition calculation
- **📈 Dashboard** — Visualize nutrition trends and daily goals
- **👤 User Profiles** — Personalized daily calorie & macro targets
- **🔐 Audit Trail** — Complete IFCT 2017 query logging for compliance
- **🛡️ Privacy-First** — Supabase with row-level security

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Ultralytics YOLO API key

### Installation

1. Clone repository:
```bash
git clone <repo>
cd nutrivision
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment (`.env.local`):
```bash
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key  # For seeding
YOLO_API_KEY=your_ultralytics_key
```

4. Setup database:
```bash
# Run SQL in Supabase console using: supabase/schema.sql
# Or use Supabase CLI
supabase migration new init_ifct2017
supabase db push
```

5. Seed IFCT 2017 data:
```bash
npm run seed-ifct2017
```

6. Start development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📋 Documentation

### Compliance & Setup
- **[IFCT2017_COMPLIANCE.md](./IFCT2017_COMPLIANCE.md)** — Strict nutrition data rules
- **[SETUP_IFCT2017.md](./SETUP_IFCT2017.md)** — Complete implementation guide
- **[COMPLIANCE_CHECKLIST.md](./COMPLIANCE_CHECKLIST.md)** — Verification checklist

### Development
- **[src/lib/ifct2017.ts](./src/lib/ifct2017.ts)** — IFCT 2017 implementation
- **[src/lib/yolo.ts](./src/lib/yolo.ts)** — Food detection module
- **[supabase/schema.sql](./supabase/schema.sql)** — Database schema

## 🍽️ Core Concepts

### IFCT 2017 Compliance
All nutrition data comes **exclusively** from IFCT 2017 (Indian Food Composition Tables), the authoritative government source from the National Institute of Nutrition, Hyderabad.

```typescript
import { compositions } from "@/lib/ifct2017";

const result = await compositions("biryani");
// Returns IFCT 2017 data only
```

### Food Detection
YOLOv8 custom model detects Indian food items from images:

```typescript
import { recognizeFood } from "@/lib/yolo";

const result = await recognizeFood(imageUrl);
// Returns: { food_name, confidence, calories, ... }
```

### API Usage

**POST /api/recognize** — Detect food and get nutrition data:
```bash
curl -X POST http://localhost:3000/api/recognize \
  -H "Content-Type: application/json" \
  -d '{ "image_url": "https://example.com/food.jpg" }'
```

Response:
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
    "ifct_source": true
  }
}
```

## 🗂️ Project Structure

```
nutrivision/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── api/
│   │   │   ├── recognize/      # Food recognition endpoint
│   │   │   └── nutrition/      # Nutrition logging endpoint
│   │   ├── dashboard/          # User dashboard
│   │   ├── scan/               # Image upload & scanning
│   │   └── settings/           # User settings
│   ├── lib/
│   │   ├── ifct2017.ts         # IFCT 2017 nutrition data
│   │   ├── yolo.ts             # YOLOv8 food detection
│   │   └── supabase/           # Supabase client
│   └── [components]
├── supabase/
│   └── schema.sql              # Database schema
├── scripts/
│   └── seed-ifct2017.ts        # Database seeding
└── docs/
    ├── IFCT2017_COMPLIANCE.md
    ├── SETUP_IFCT2017.md
    └── COMPLIANCE_CHECKLIST.md
```

## 🗄️ Database

### IFCT 2017 Foods Table
Stores all Indian food compositions with 50+ entries:

```sql
SELECT * FROM ifct2017_foods WHERE food_name LIKE '%dal%';
-- Returns: dal entries with calories, protein, carbs, fat, fiber
```

### Audit Logging
Every nutrition query is logged:

```sql
SELECT * FROM ifct2017_query_logs ORDER BY created_at DESC LIMIT 10;
-- Returns: search terms, matches, confidence scores
```

## 🔐 Compliance & Security

### Security Features
- ✅ User authentication via Supabase Auth
- ✅ Row-level security (RLS) for user data
- ✅ Audit trail for all nutrition queries
- ✅ No external nutrition API calls
- ✅ IFCT 2017 source verification

### Compliance Guarantees
- ✅ IFCT 2017 ONLY — No USDA, Nutritionix, etc.
- ✅ No estimated or approximate nutrition values
- ✅ Fuzzy matching with 60% confidence threshold
- ✅ Complete audit trail for all queries
- ✅ Error handling enforces compliance

## 🧪 Testing

```bash
# Run development server with hot reload
npm run dev

# Build for production
npm run build

# Seed test data
npm run seed-ifct2017

# Lint code
npm lint
```

## 📦 Common Indian Foods in IFCT 2017

Seeds include:
- Chapati, Roti (breads)
- Rice, Basmati (cereals)
- Biryani, Butter Chicken (curries)
- Dal, Mixed (lentils)
- Paneer (cheese)
- Spinach, Tomato (vegetables)
- Yogurt, Milk (dairy)
- Samosa, Chole Bhature (prepared dishes)

[See full list in src/lib/ifct2017.ts](./src/lib/ifct2017.ts)

## 🚨 Strict Rules

**FORBIDDEN:**
- ❌ USDA FoodData Central
- ❌ Nutritionix API
- ❌ Spoonacular
- ❌ ChatGPT/LLM estimates
- ❌ Any other nutrition database

**REQUIRED:**
- ✅ IFCT 2017 only
- ✅ Fuzzy matching on IFCT 2017 database
- ✅ Audit logging of all queries
- ✅ Error responses for non-matched foods
- ✅ Source attribution: "IFCT 2017"

## 📚 Resources

- **IFCT 2017 Official**: National Institute of Nutrition, Hyderabad
- **YOLOv8**: [Ultralytics](https://ultralytics.com/)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

## 🤝 Contributing

Contributions welcome! Please ensure:
1. IFCT 2017 compliance maintained
2. All new foods verified against IFCT 2017
3. Audit logging implemented
4. Tests pass

## 📄 License

MIT License — See LICENSE file

## ✅ Compliance Status

**Status:** ✅ IFCT 2017 ONLY  
**Last Verified:** March 31, 2026  
**Authority:** National Institute of Nutrition, Hyderabad

---

**Built with ❤️ for accurate Indian food nutrition tracking**
