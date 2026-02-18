# PureScan - Processed Food Scanner

## Project Overview
- **Name:** PureScan
- **Type:** Next.js PWA (Progressive Web App)
- **Core Functionality:** Scan food products by barcode or search to reveal processing level, harmful ingredients, and give a "purity score" out of 100
- **Target Users:** Health-conscious individuals who want to avoid ultra-processed foods

## Tech Stack
- **Frontend:** Next.js 14 (App Router) + Tailwind CSS
- **PWA:** next-pwa for service worker
- **Database:** Neon (PostgreSQL) for user history and preferences
- **API:** OpenFoodFacts (free) for product data
- **Scanner:** html5-qrcode for barcode scanning

## Key Features

### 1. Product Scanner (Core)
- Camera-based barcode scanning
- Manual barcode entry fallback
- Search by product name
- Instant lookup from OpenFoodFacts API

### 2. Purity Score Algorithm
Score out of 100 based on:
- **Processing Level** (NOVA classification)
- **Seed Oils** (-15 points per detected)
- **Added Sugars** (-10 points if high)
- **Additives/Preservatives** (-5 per additive)
- **Artificial Ingredients** (-10 per artificial)
- **Clean Label Bonus** (+10 if 5 ingredients or less)

### 3. Product Detail View
- Purity Score (0-100) with color coding
- Processing level badge (Minimally → Ultra-processed)
- Ingredient red flags (seed oils, additives)
- Nutrition summary
- "Should I eat this?" quick verdict

### 4. History & Tracking
- Scan history stored in Neon
- Filter by date, score range
- Delete individual scans
- Clear all history

### 5. Grocery List
- Add scanned products to list
- Overall "purity score" for cart
- Remove items

## UI/UX Design

### Color Palette
- **Background:** #0A0A0B (near black)
- **Card:** #18181B (zinc-900)
- **Primary:** #10B981 (emerald-500) - good scores
- **Warning:** #F59E0B (amber-500) - medium scores
- **Danger:** #EF4444 (red-500) - poor scores
- **Text Primary:** #FAFAFA
- **Text Secondary:** #A1A1AA

### Typography
- **Headings:** Inter Bold
- **Body:** Inter Regular
- **Score Display:** Large, bold, color-coded

### Layout
- Bottom tab navigation (Scanner, History, List)
- Pull-to-refresh on lists
- Smooth animations between screens

### PWA Requirements
- manifest.json with icons
- Service worker for offline
- "Add to Home Screen" prompt
- Full-screen on iOS

## Database Schema (Neon)

```sql
-- Scans table
CREATE TABLE scans (
  id SERIAL PRIMARY KEY,
  barcode VARCHAR(50),
  product_name TEXT,
  purity_score INTEGER,
  processing_level TEXT,
  ingredients JSONB,
  image_url TEXT,
  scanned_at TIMESTAMP DEFAULT NOW()
);

-- Grocery list table
CREATE TABLE grocery_items (
  id SERIAL PRIMARY KEY,
  barcode VARCHAR(50),
  product_name TEXT,
  purity_score INTEGER,
  added_at TIMESTAMP DEFAULT NOW()
);
```

## API Routes

- `POST /api/scan` - Lookup product from OpenFoodFacts
- `GET /api/history` - Get user's scan history
- `DELETE /api/history/[id]` - Delete a scan
- `POST /api/grocery` - Add item to grocery list
- `GET /api/grocery` - Get grocery list
- `DELETE /api/grocery/[id]` - Remove grocery item

## Pages

1. `/` - Scanner (default)
2. `/history` - Scan history
3. `/grocery` - Grocery list
4. `/product/[barcode]` - Product detail

## Deployment
- **Platform:** Vercel
- **Region:** EU (Frankfurt)
- **Environment Variables:**
  - `NEON_DATABASE_URL` - Neon connection string

## Success Criteria
- [ ] Barcode scanner works on iOS PWA
- [ ] Products load from OpenFoodFacts API
- [ ] Purity score calculates correctly
- [ ] History saves to Neon database
- [ ] Grocery list works
- [ ] PWA installable on iOS
- [ ] All pages responsive
- [ ] No console errors
