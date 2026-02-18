// Purity Score Algorithm
// Score out of 100 based on multiple factors

interface IngredientAnalysis {
  seedOils: string[];
  additives: string[];
  artificialIngredients: string[];
  addedSugars: string[];
}

interface ScoreResult {
  score: number;
  processingLevel: 'minimal' | 'low' | 'medium' | 'ultra';
  breakdown: {
    baseScore: number;
    seedOilsPenalty: number;
    additivesPenalty: number;
    artificialPenalty: number;
    sugarPenalty: number;
    cleanBonus: number;
  };
  redFlags: string[];
}

// Known harmful ingredients
const SEED_OILS = [
  'canola oil', 'rapeseed oil', 'sunflower oil', 'safflower oil',
  'corn oil', 'soybean oil', 'vegetable oil', 'palm oil',
  'palm kernel oil', 'cottonseed oil', 'grapeseed oil', 'rice bran oil'
];

const ARTIFICIAL_INGREDIENTS = [
  'artificial flavor', 'artificial colour', 'artificial sweetener',
  'aspartame', 'saccharin', 'sucralose', 'acesulfame', 'neotame',
  'advantame', 'monosodium glutamate', 'msg', 'bha', 'bht',
  'tbhq', 'propyl gallate', 'sodium nitrite', 'sodium nitrate'
];

const ADDITIVES = [
  'emulsifier', 'stabilizer', 'thickener', 'gelling agent',
  'preservative', 'antioxidant', 'colouring', 'flavour enhancer',
  'sweetener', 'acid regulator', 'anti-caking agent', 'bulking agent',
  'carrier', ' glazing agent', 'humectant', 'sequestrant', 'buffer'
];

const ADDED_SUGARS = [
  'sugar', 'sucrose', 'glucose', 'fructose', 'corn syrup',
  'high fructose corn syrup', 'agave', 'maple syrup', 'molasses',
  'honey', 'cane juice', 'cane sugar', 'dextrose', 'maltose',
  'lactose', 'galactose', 'invert sugar', 'rice syrup'
];

export function analyzeIngredients(ingredients: string[]): IngredientAnalysis {
  const lowerIngredients = ingredients.map(i => i.toLowerCase());
  
  const seedOils = SEED_OILS.filter(oil => 
    lowerIngredients.some(i => i.includes(oil))
  );
  
  const additives = ADDITIVES.filter(add => 
    lowerIngredients.some(i => i.includes(add))
  );
  
  const artificialIngredients = ARTIFICIAL_INGREDIENTS.filter(art => 
    lowerIngredients.some(i => i.includes(art))
  );
  
  const addedSugars = ADDED_SUGARS.filter(sugar => 
    lowerIngredients.some(i => i.includes(sugar))
  );

  return { seedOils, additives, artificialIngredients, addedSugars };
}

export function calculatePurityScore(
  ingredients: string[],
  novaCategory?: number
): ScoreResult {
  let score = 100;
  const breakdown = {
    baseScore: 100,
    seedOilsPenalty: 0,
    additivesPenalty: 0,
    artificialPenalty: 0,
    sugarPenalty: 0,
    cleanBonus: 0
  };
  const redFlags: string[] = [];

  const analysis = analyzeIngredients(ingredients);

  // Seed oils penalty (-15 per oil)
  if (analysis.seedOils.length > 0) {
    breakdown.seedOilsPenalty = analysis.seedOils.length * 15;
    score -= breakdown.seedOilsPenalty;
    redFlags.push(...analysis.seedOils.map(o => `Contains ${o}`));
  }

  // Additives penalty (-5 per additive)
  if (analysis.additives.length > 0) {
    breakdown.additivesPenalty = Math.min(analysis.additives.length * 5, 25);
    score -= breakdown.additivesPenalty;
    redFlags.push(`${analysis.additives.length} additives detected`);
  }

  // Artificial ingredients penalty (-10 per artificial)
  if (analysis.artificialIngredients.length > 0) {
    breakdown.artificialPenalty = analysis.artificialIngredients.length * 10;
    score -= breakdown.artificialPenalty;
    redFlags.push(...analysis.artificialIngredients.map(a => `Contains ${a}`));
  }

  // Added sugars penalty (-10 if high)
  if (analysis.addedSugars.length > 0) {
    breakdown.sugarPenalty = 10;
    score -= breakdown.sugarPenalty;
    redFlags.push('Added sugars detected');
  }

  // Clean label bonus (+10 if 5 ingredients or less)
  if (ingredients.length <= 5) {
    breakdown.cleanBonus = 10;
    score += breakdown.cleanBonus;
  }

  // NOVA category adjustment
  let processingLevel: 'minimal' | 'low' | 'medium' | 'ultra' = 'minimal';
  if (novaCategory) {
    if (novaCategory === 1) {
      // Unprocessed - keep score
      processingLevel = 'minimal';
    } else if (novaCategory === 2) {
      score -= 10;
      processingLevel = 'low';
    } else if (novaCategory === 3) {
      score -= 25;
      processingLevel = 'medium';
    } else if (novaCategory === 4) {
      score -= 40;
      processingLevel = 'ultra';
    }
  }

  // Clamp score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    processingLevel,
    breakdown,
    redFlags
  };
}

export function getScoreColor(score: number): string {
  if (score >= 70) return '#10B981'; // emerald-500
  if (score >= 40) return '#F59E0B'; // amber-500
  return '#EF4444'; // red-500
}

export function getScoreLabel(score: number): string {
  if (score >= 70) return 'Good';
  if (score >= 40) return 'Moderate';
  return 'Poor';
}
