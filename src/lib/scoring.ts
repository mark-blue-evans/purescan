// Enhanced Purity Score Algorithm
// Score out of 100 based on multiple health factors

import { getAdditiveInfo, E_NUMBER_DB, AdditiveInfo } from './additives';

interface IngredientAnalysis {
  seedOils: string[];
  palmOil: boolean;
  additives: string[];
  additiveDetails: { name: string; info: AdditiveInfo | null }[];
  artificialIngredients: string[];
  addedSugars: string[];
  pesticides: string[];
  microplastics: string[];
  heavyMetals: string[];
  heavyMetalsBreakdown: { metal: string; risk: string; description: string }[];
  carcinogens: string[];
  hormones: string[];
  commonAllergens: string[];
  isOrganic: boolean;
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
    pesticidePenalty: number;
    microplasticPenalty: number;
    heavyMetalPenalty: number;
    carcinogenPenalty: number;
    cleanBonus: number;
  };
  risks: {
    seedOils: string[];
    palmOil: boolean;
    additives: string[];
    additiveDetails: { name: string; info: AdditiveInfo | null }[];
    artificial: string[];
    pesticides: string[];
    microplastics: string[];
    heavyMetals: string[];
    heavyMetalsBreakdown: { metal: string; risk: string; description: string }[];
    carcinogens: string[];
  };
  scoreFactors: {
    processing: string;
    ingredients: string;
    healthRisks: string;
    overall: string;
  };
  eNumbers: { name: string; eNumber: string; safety: string; effects: string[] }[];
}

// Known harmful ingredients databases
const SEED_OILS = [
  'canola oil', 'rapeseed oil', 'sunflower oil', 'safflower oil',
  'corn oil', 'soybean oil', 'vegetable oil', 'palm oil',
  'palm kernel oil', 'cottonseed oil', 'grapeseed oil', 'rice bran oil',
  'sesame oil', 'peanut oil', 'margarine', 'shortening'
];

const ARTIFICIAL_INGREDIENTS = [
  'artificial flavor', 'artificial colour', 'artificial sweetener',
  'aspartame', 'saccharin', 'sucralose', 'acesulfame', 'neotame',
  'advantame', 'monosodium glutamate', 'msg', 'bha', 'bht',
  'tbhq', 'propyl gallate', 'sodium nitrite', 'sodium nitrate',
  'red 40', 'yellow 5', 'yellow 6', 'blue 1', 'caramel color',
  'sodium benzoate', 'potassium sorbate', 'sodium metabisulfite'
];

// Carcinogens and potential cancer-causing ingredients
const CARCINOGENS = [
  'sodium nitrite', 'sodium nitrate', 'bha', 'bht', 'tbhq',
  'propyle gallate', 'diacetyl', 'potassium bromate', 'bromated flour',
  'saccharin', 'cyclamate', 'caramel color (ammonia process)',
  'bisphenol a', 'bpa', 'phthalates', 'parabens'
];

// Pesticides commonly found in food
const PESTICIDES = [
  'glyphosate', 'chlorpyrifos', 'malathion', 'carbaryl',
  'atrazine', 'mancozeb', 'chlorothalonil', 'pyrethroids',
  'organophosphates', 'neonicotinoids', 'fipronil'
];

// Heavy metals (contamination risk)
const HEAVY_METALS = [
  'lead', 'arsenic', 'mercury', 'cadmium', 'chromium'
];

// Microplastics (packaging/processing contamination)
const MICROPLASTICS = [
  'polyethylene', 'polypropylene', 'polyester', 'nylon',
  'plastic', 'microplastic'
];

const ADDED_SUGARS = [
  'sugar', 'sucrose', 'glucose', 'fructose', 'corn syrup',
  'high fructose corn syrup', 'agave', 'maple syrup', 'molasses',
  'honey', 'cane juice', 'cane sugar', 'dextrose', 'maltose',
  'lactose', 'galactose', 'invert sugar', 'rice syrup', 'maltodextrin'
];

const COMMON_ALLERGENS = [
  'milk', 'casein', 'whey', 'lactose', 'egg', 'albumin',
  'peanut', 'tree nut', 'almond', 'walnut', 'cashew',
  'wheat', 'gluten', 'soy', 'soybean', 'fish', 'shellfish',
  'sesame', 'mustard', 'celery', 'lupin', 'mollusc'
];

export function analyzeIngredients(ingredients: string[]): IngredientAnalysis {
  const lowerIngredients = ingredients.map(i => i.toLowerCase());
  const fullText = lowerIngredients.join(' ');
  
  const seedOils = SEED_OILS.filter(oil => 
    lowerIngredients.some(i => i.includes(oil))
  );
  
  // Separate palm oil detection
  const hasPalmOil = lowerIngredients.some(i => 
    i.includes('palm oil') || i.includes('palm kernel') || i.includes('palmolein')
  );
  
  // Detect additives with E-number info
  const additiveDetails: { name: string; info: AdditiveInfo | null }[] = [];
  lowerIngredients.forEach(ing => {
    const info = getAdditiveInfo(ing);
    if (info) {
      additiveDetails.push({ name: ing, info });
    }
  });
  
  const additives = lowerIngredients.filter(i => 
    i.includes('emulsifier') || i.includes('stabilizer') || 
    i.includes('thickener') || i.includes('preservative') ||
    i.includes('antioxidant') || i.includes('colouring') ||
    i.includes('flavour') || i.includes('sweetener') ||
    i.includes('acid') || i.includes('regulator')
  );
  
  const artificialIngredients = ARTIFICIAL_INGREDIENTS.filter(art => 
    lowerIngredients.some(i => i.includes(art))
  );
  
  const addedSugars = ADDED_SUGARS.filter(sugar => 
    lowerIngredients.some(i => i.includes(sugar))
  );

  const pesticides = PESTICIDES.filter(pest => 
    lowerIngredients.some(i => i.includes(pest))
  );

  const heavyMetals = HEAVY_METALS.filter(metal => 
    lowerIngredients.some(i => i.includes(metal))
  );

  // Heavy metals breakdown
  const heavyMetalsBreakdown: { metal: string; risk: string; description: string }[] = [];
  if (fullText.includes('cadmium') || fullText.includes('lead') || fullText.includes('mercury') || fullText.includes('arsenic')) {
    heavyMetalsBreakdown.push(
      { metal: 'Cadmium', risk: 'medium', description: 'Can accumulate in body, especially from rice and leafy greens' },
      { metal: 'Lead', risk: 'low', description: 'Common contaminant, regulated in most countries' },
      { metal: 'Mercury', risk: 'low', description: 'Main concern is seafood contamination' },
      { metal: 'Arsenic', risk: 'medium', description: 'Present in rice and grains, organic rice has lower levels' }
    );
  }

  const microplastics = MICROPLASTICS.filter(plastic => 
    lowerIngredients.some(i => i.includes(plastic))
  );

  const carcinogens = CARCINOGENS.filter(carc => 
    lowerIngredients.some(i => i.includes(carc))
  );

  const commonAllergens = COMMON_ALLERGENS.filter(allergen => 
    lowerIngredients.some(i => i.includes(allergen))
  );

  // Detect organic
  const isOrganic = fullText.includes('organic') || fullText.includes('bio') || fullText.includes('eco');

  return { 
    seedOils, 
    palmOil: hasPalmOil,
    additives, 
    additiveDetails,
    artificialIngredients, 
    addedSugars,
    pesticides,
    microplastics,
    heavyMetals,
    heavyMetalsBreakdown,
    carcinogens,
    hormones: [],
    commonAllergens,
    isOrganic
  };
}

export function calculatePurityScore(
  ingredients: string[],
  novaCategory?: number,
  additivesFromAPI?: string[],
  allergensFromAPI?: string[]
): ScoreResult {
  let score = 100;
  const breakdown = {
    baseScore: 100,
    seedOilsPenalty: 0,
    additivesPenalty: 0,
    artificialPenalty: 0,
    sugarPenalty: 0,
    pesticidePenalty: 0,
    microplasticPenalty: 0,
    heavyMetalPenalty: 0,
    carcinogenPenalty: 0,
    cleanBonus: 0
  };

  const risks = {
    seedOils: [] as string[],
    palmOil: false,
    additives: [] as string[],
    additiveDetails: [] as { name: string; info: AdditiveInfo | null }[],
    artificial: [] as string[],
    pesticides: [] as string[],
    microplastics: [] as string[],
    heavyMetals: [] as string[],
    heavyMetalsBreakdown: [] as { metal: string; risk: string; description: string }[],
    carcinogens: [] as string[]
  };

  // Use ingredients from API if provided, otherwise analyze from text
  const ingredientList = ingredients && ingredients.length > 0 ? ingredients : [];
  const analysis = analyzeIngredients(ingredientList);

  // Add additive details from our E-number database
  risks.additiveDetails = analysis.additiveDetails;
  risks.heavyMetalsBreakdown = analysis.heavyMetalsBreakdown;

  // Add API-detected additives
  if (additivesFromAPI && additivesFromAPI.length > 0) {
    risks.additives = additivesFromAPI.map(a => `Additive: ${a}`);
    breakdown.additivesPenalty = Math.min(additivesFromAPI.length * 5, 40);
    score -= breakdown.additivesPenalty;
  }

  // Add API-detected allergens
  if (allergensFromAPI && allergensFromAPI.length > 0) {
    risks.additives.push(...allergensFromAPI.map(a => `Allergen: ${a}`));
    breakdown.additivesPenalty += allergensFromAPI.length * 3;
    score -= allergensFromAPI.length * 3;
  }

  // Seed oils penalty (-15 per oil)
  if (analysis.seedOils.length > 0) {
    breakdown.seedOilsPenalty = analysis.seedOils.length * 15;
    score -= breakdown.seedOilsPenalty;
    risks.seedOils = analysis.seedOils.map(o => `Contains ${o}`);
  }

  // Palm oil penalty (-10 if detected)
  if (analysis.palmOil) {
    breakdown.seedOilsPenalty += 10;
    score -= 10;
    risks.palmOil = true;
  }

  // Additives from text analysis
  if (analysis.additives.length > 0 && !additivesFromAPI) {
    breakdown.additivesPenalty = Math.min(analysis.additives.length * 5, 30);
    score -= breakdown.additivesPenalty;
    risks.additives = [...risks.additives, ...analysis.additives.map(a => `Additive: ${a}`)];
  }

  // Artificial ingredients penalty (-10 per artificial)
  if (analysis.artificialIngredients.length > 0) {
    breakdown.artificialPenalty = analysis.artificialIngredients.length * 10;
    score -= breakdown.artificialPenalty;
    risks.artificial = analysis.artificialIngredients.map(a => `Contains ${a}`);
  }

  // Added sugars penalty (-10 if high)
  if (analysis.addedSugars.length > 0) {
    breakdown.sugarPenalty = 10;
    score -= breakdown.sugarPenalty;
    risks.artificial.push('Added sugars detected');
  }

  // Pesticide risk (-20 if detected)
  if (analysis.pesticides.length > 0) {
    breakdown.pesticidePenalty = analysis.pesticides.length * 20;
    score -= breakdown.pesticidePenalty;
    risks.pesticides = analysis.pesticides.map(p => `Potential pesticide: ${p}`);
  }

  // Microplastic risk (-15 if detected)
  if (analysis.microplastics.length > 0) {
    breakdown.microplasticPenalty = analysis.microplastics.length * 15;
    score -= breakdown.microplasticPenalty;
    risks.microplastics = analysis.microplastics.map(m => `Microplastic risk: ${m}`);
  }

  // Heavy metal risk (-25 if detected)
  if (analysis.heavyMetals.length > 0) {
    breakdown.heavyMetalPenalty = analysis.heavyMetals.length * 25;
    score -= breakdown.heavyMetalPenalty;
    risks.heavyMetals = analysis.heavyMetals.map(m => `Heavy metal risk: ${m}`);
  }

  // Carcinogen risk (-25 per carcinogen)
  if (analysis.carcinogens.length > 0) {
    breakdown.carcinogenPenalty = analysis.carcinogens.length * 25;
    score -= breakdown.carcinogenPenalty;
    risks.carcinogens = analysis.carcinogens.map(c => `Potential carcinogen: ${c}`);
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

  // Generate score factors
  const scoreFactors = {
    processing: getProcessingDescription(processingLevel, novaCategory),
    ingredients: getIngredientDescription(ingredients.length, analysis),
    healthRisks: getHealthRiskDescription(risks),
    overall: getOverallDescription(score)
  };

  // Build E-numbers list with safety info
  const eNumbers = analysis.additiveDetails
    .filter(d => d.info)
    .map(d => ({
      name: d.info!.name,
      eNumber: d.info!.eNumber,
      safety: d.info!.safety,
      effects: d.info!.effects
    }));

  // Organic bonus
  if (analysis.isOrganic) {
    score += 5;
    score = Math.min(100, score);
  }

  return {
    score,
    processingLevel,
    breakdown,
    risks,
    scoreFactors,
    eNumbers
  };
}

function getProcessingDescription(level: string, _novaCategory?: number): string {
  if (level === 'minimal') return 'Minimally processed - whole food';
  if (level === 'low') return 'Lightly processed - some processing';
  if (level === 'medium') return 'Ultra-processed - many additives';
  return 'Highly processed - avoid if possible';
}

function getIngredientDescription(count: number, _analysis: IngredientAnalysis): string {
  if (count <= 5) return 'Short ingredient list - clean label';
  if (count <= 10) return 'Moderate ingredient count';
  if (count > 20) return 'Long ingredient list - highly processed';
  return 'Extended ingredient list';
}

function getHealthRiskDescription(risks: { carcinogens: string[], heavyMetals: string[], pesticides: string[], microplastics: string[] }): string {
  const riskCount = risks.carcinogens.length + risks.heavyMetals.length + 
                    risks.pesticides.length + risks.microplastics.length;
  if (riskCount === 0) return 'No major health risks detected';
  if (riskCount <= 2) return 'Some concerns - review details';
  return 'Multiple health risks detected';
}

function getOverallDescription(score: number): string {
  if (score >= 80) return 'Excellent choice - clean & healthy';
  if (score >= 60) return 'Good option - mostly clean';
  if (score >= 40) return 'Moderate - use occasionally';
  if (score >= 20) return 'Poor choice - many concerns';
  return 'Avoid if possible - significant health risks';
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

export function getProcessingLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    minimal: 'Minimally Processed',
    low: 'Low Processed', 
    medium: 'Medium Processed',
    ultra: 'Ultra Processed'
  };
  return labels[level] || level;
}
