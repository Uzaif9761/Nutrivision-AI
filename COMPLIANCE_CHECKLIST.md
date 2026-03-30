# 🍎 NutriVision AI — IFCT 2017 Compliance Checklist

**Project:** NutriVision AI  
**Version:** 1.0  
**Date:** March 31, 2026  
**Compliance Standard:** IFCT 2017 (Indian Food Composition Tables)

---

## ✅ Pre-Implementation Verification

### Code Review
- [ ] `src/lib/yolo.ts` — No USDA imports or references
- [ ] `src/lib/yolo.ts` — Only uses `compositions()` from IFCT 2017
- [ ] `src/lib/ifct2017.ts` — Implements fuzzy matching algorithm
- [ ] `src/lib/ifct2017.ts` — Includes audit logging via `logIFCTQuery()`
- [ ] `src/app/api/recognize/route.ts` — Returns `ifct_source: true`
- [ ] All API responses include `"source": "IFCT 2017"`
- [ ] No fallback to other databases in error cases
- [ ] No approximate or estimated values returned

### Database Schema
- [ ] `supabase/schema.sql` — Includes `ifct2017_foods` table
- [ ] `supabase/schema.sql` — Includes `ifct2017_query_logs` table
- [ ] Both tables created with proper indexes
- [ ] RLS policies configured for security
- [ ] Service role key accessible for seeding

### Environment Configuration
- [ ] `.env.local` — No USDA_API_KEY present
- [ ] `.env.local` — Contains SUPABASE_SERVICE_ROLE_KEY
- [ ] `.env.local` — Contains YOLO_API_KEY
- [ ] `.env.local` — No references to other nutrition databases
- [ ] All sensitive keys in `.env.local` (not committed)

### Dependencies
- [ ] `package.json` — Updated with seed-ifct2017 script
- [ ] `ts-node` added to devDependencies
- [ ] All required Supabase packages present
- [ ] Axios for API calls

---

## ✅ Implementation Checklist

### Step 1: Database Setup
- [ ] Execute `supabase/schema.sql` in SQL editor
- [ ] Verify tables created:
  - [ ] `ifct2017_foods`
  - [ ] `ifct2017_query_logs`
  - [ ] `food_logs`
  - [ ] `nutrition_data`
- [ ] Enable RLS on all tables
- [ ] Create necessary indexes

### Step 2: Populate IFCT 2017 Data
- [ ] Install npm dependencies: `npm install`
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
- [ ] Run seed script: `npm run seed-ifct2017`
- [ ] Verify data in Supabase:
  ```sql
  SELECT COUNT(*) as total_foods FROM ifct2017_foods;
  -- Should return: 17+ entries
  ```

### Step 3: Code Integration
- [ ] Import `compositions()` in food recognition flow
- [ ] Update `recognizeFood()` to call IFCT 2017 only
- [ ] Verify all nutrition responses have:
  - [ ] `source: "IFCT 2017"`
  - [ ] `ifct_source: true`
  - [ ] Match confidence score
  - [ ] Proper error messages

### Step 4: API Response Validation
- [ ] Test success response:
  ```json
  {
    "success": true,
    "data": {
      "food_name": "Biryani, chicken",
      "source": "IFCT 2017",
      "ifct_source": true,
      // ... nutrition data
    }
  }
  ```
- [ ] Test not-found response:
  ```json
  {
    "success": false,
    "data": {
      "error": "Nutrition data not available in IFCT 2017 for: [food]",
      "source": "IFCT 2017",
      "ifct_source": true
    }
  }
  ```

### Step 5: Audit Logging Validation
- [ ] Test query logging:
  ```sql
  SELECT * FROM ifct2017_query_logs ORDER BY created_at DESC LIMIT 5;
  ```
- [ ] Verify log contains:
  - [ ] `search_term` (detected food name)
  - [ ] `found` (boolean)
  - [ ] `matched_food_name` (if found)
  - [ ] `match_confidence` (0-1)
  - [ ] `created_at` (timestamp)

---

## ✅ Security Verification

### Data Protection
- [ ] User authentication required for personal food logs
- [ ] Users can't access other users' data (RLS enforced)
- [ ] IFCT 2017 data is publicly readable (expected)
- [ ] Audit logs protected from unauthorized modification
- [ ] Nutrition data never sent to unapproved external services

### API Security
- [ ] No USDA APIs called
- [ ] No Nutritionix, Spoonacular, or ChatGPT usage
- [ ] Image processing server-side only
- [ ] Service role key never exposed to frontend
- [ ] All env variables marked as private (✓ .env.local)

### Compliance Enforcement
- [ ] Fuzzy matching confidence threshold: ≥ 0.6 (60%)
- [ ] Non-matched foods return error, not estimate
- [ ] All nutrition values from IFCT 2017 database only
- [ ] Fallback behavior: return error, not estimate

---

## ✅ Testing & Validation

### Unit Tests
- [ ] IFCT 2017 lookup function:
  ```typescript
  const result = await compositions("biryani");
  expect(result.found).toBe(true);
  expect(result.source).toBe("IFCT 2017");
  ```
- [ ] Fuzzy matching algorithm
- [ ] Error handling for missing foods

### Integration Tests
- [ ] POST /api/recognize with valid food image
- [ ] POST /api/recognize for non-IFCT food
- [ ] Verify audit logs recorded
- [ ] Complete food logging workflow

### Manual Testing
- [ ] Upload Indian food image → Get IFCT 2017 data
- [ ] Attempt upload non-Indian food → Get proper error
- [ ] Check Supabase audit logs
- [ ] Verify no external API calls in network tab

---

## ✅ Documentation Verification

### Code Documentation
- [ ] `src/lib/ifct2017.ts` — Well-commented implementation
- [ ] `src/lib/yolo.ts` — Updated with IFCT 2017 references
- [ ] Function signatures explain IFCT 2017 compliance
- [ ] Error messages reference IFCT 2017

### Project Documentation
- [ ] `IFCT2017_COMPLIANCE.md` — Complete compliance rules
- [ ] `SETUP_IFCT2017.md` — Implementation guide
- [ ] `README.md` — Updated with IFCT 2017 info
- [ ] API documentation reflects IFCT 2017 source

### Audit Trail
- [ ] Query logs continuously recorded
- [ ] Audit logs retention policy defined (if any)
- [ ] Access logs available for compliance review

---

## ✅ Production Deployment

### Pre-Production
- [ ] All USDA references removed from codebase
- [ ] Staging database populated with IFCT 2017 data
- [ ] Performance testing with IFCT 2017 queries
- [ ] Load testing for database lookups
- [ ] Backup strategy for IFCT 2017 data

### Production Setup
- [ ] Production Supabase database configured
- [ ] IFCT 2017 data seeded in production
- [ ] All environment variables set correctly
- [ ] Database backups scheduled
- [ ] Monitoring alerts configured

### Post-Deployment
- [ ] Verify production API responses include IFCT 2017
- [ ] Monitor audit logs for query patterns
- [ ] Check error rates for non-matched foods
- [ ] Performance metrics collected
- [ ] User support informed of IFCT 2017 limitation

---

## ✅ Compliance Sign-Off

### Authority
- [ ] Compliance officer reviewed implementation
- [ ] IFCT 2017 authenticity verified
- [ ] No unauthorized alterations to nutrition data
- [ ] Data source traceability confirmed

### Legal & Governance
- [ ] Terms of Service updated (IFCT 2017 source disclosed)
- [ ] Privacy policy compliant
- [ ] Data retention policy documented
- [ ] Audit trail retention policy defined

### Audit Ready
- [ ] All code changes in version control
- [ ] Commit messages reference IFCT 2017 compliance
- [ ] Branching strategy for compliance changes
- [ ] Change log maintained

---

## Frequently Checked Items

### Daily Checks
- [ ] IFCT 2017 database accessible
- [ ] No error spikes in nutrition lookups
- [ ] Audit logs being recorded
- [ ] All API responses have `ifct_source: true`

### Weekly Checks
- [ ] Performance metrics within SLA
- [ ] Audit logs reviewed for anomalies
- [ ] Database backup integrity verified
- [ ] No external API calls detected

### Monthly Checks
- [ ] IFCT 2017 data completeness
- [ ] Fuzzy matching confidence distribution
- [ ] User-reported foods not in database
- [ ] Compliance documentation updated

---

## Non-Compliance Violations

🚨 **VIOLATION INDICATORS:**
- USDA API called ❌
- Nutritionix data returned ❌
- Estimated values in response ❌
- Non-IFCT 2017 source in API ❌
- Missing audit logs ❌
- Approximate nutrition data ❌
- Food data from external API ❌

---

## Rollback Procedure

If compliance is violated:

1. **Immediate Actions:**
   - [ ] Stop production API
   - [ ] Revert to last known-good commit
   - [ ] Restore database from backup
   - [ ] Notify compliance team

2. **Investigation:**
   - [ ] Review commit history
   - [ ] Check audit logs for violations
   - [ ] Identify root cause
   - [ ] Document findings

3. **Resolution:**
   - [ ] Fix compliance issue
   - [ ] Re-test implementation
   - [ ] Update documentation
   - [ ] Redeploy with verification

---

## Version History

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 1.0 | 2024-03-31 | ✅ Final | IFCT 2017 ONLY compliance |

---

**Compliance Status:** ✅ READY FOR DEPLOYMENT  
**Last Verified:** 2024-03-31  
**Next Review:** 2024-06-30  

---

**Sign-Off:**
- Project Lead: _______________
- Compliance Officer: _______________
- Technical Lead: _______________
