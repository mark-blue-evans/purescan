// Comprehensive E-Number Database with safety ratings and descriptions

export interface AdditiveInfo {
  name: string;
  eNumber: string;
  category: string;
  safety: 'green' | 'orange' | 'red';
  effects: string[];
  description: string;
}

export const E_NUMBER_DB: Record<string, AdditiveInfo> = {
  // Preservatives
  'e200': { name: 'Sorbic Acid', eNumber: 'E200', category: 'Preservative', safety: 'green', effects: ['Generally safe'], description: 'Natural preservative found in berries' },
  'e202': { name: 'Potassium Sorbate', eNumber: 'E202', category: 'Preservative', safety: 'green', effects: ['Generally safe'], description: 'Salt of sorbic acid' },
  'e210': { name: 'Benzoic Acid', eNumber: 'E210', category: 'Preservative', safety: 'orange', effects: ['Can cause hyperactivity', 'Asthma symptoms in sensitive people'], description: 'Common preservative, derived from benzoin resin' },
  'e211': { name: 'Sodium Benzoate', eNumber: 'E211', category: 'Preservative', safety: 'orange', effects: ['Linked to hyperactivity', 'Can form benzene with vitamin C'], description: 'Very common preservative' },
  'e220': { name: 'Sulphur Dioxide', eNumber: 'E220', category: 'Preservative', safety: 'orange', effects: ['Asthma trigger', 'Can cause allergic reactions'], description: 'Used in dried fruits and wines' },
  'e250': { name: 'Sodium Nitrite', eNumber: 'E250', category: 'Preservative', safety: 'red', effects: ['Potential carcinogen', 'Forms nitrosamines', 'Linked to cancer'], description: 'Used in processed meats - avoid' },
  'e251': { name: 'Sodium Nitrate', eNumber: 'E251', category: 'Preservative', safety: 'red', effects: ['Converts to nitrites', 'Potential carcinogen', 'Linked to cancer'], description: 'Used in cured meats' },
  'e270': { name: 'Lactic Acid', eNumber: 'E270', category: 'Preservative', safety: 'green', effects: ['Natural', 'Safe in normal amounts'], description: 'Natural acid found in fermented foods' },
  'e280': { name: 'Propionic Acid', eNumber: 'E280', category: 'Preservative', safety: 'green', effects: ['Natural', 'Safe'], description: 'Natural preservative in some foods' },
  'e282': { name: 'Calcium Propionate', eNumber: 'E282', category: 'Preservative', safety: 'green', effects: ['Generally safe', 'Linked to migraines in some'], description: 'Bread preservative' },

  // Antioxidants
  'e300': { name: 'Ascorbic Acid (Vitamin C)', eNumber: 'E300', category: 'Antioxidant', safety: 'green', effects: ['Safe', 'Actually beneficial'], description: 'Vitamin C - good for you!' },
  'e301': { name: 'Sodium Ascorbate', eNumber: 'E301', category: 'Antioxidant', safety: 'green', effects: ['Safe', 'Vitamin C'], description: 'Salt of vitamin C' },
  'e306': { name: 'Tocopherols', eNumber: 'E306', category: 'Antioxidant', safety: 'green', effects: ['Vitamin E', 'Antioxidant'], description: 'Natural vitamin E' },
  'e320': { name: 'BHA', eNumber: 'E320', category: 'Antioxidant', safety: 'orange', effects: ['May cause hyperactivity', 'Mixed research on safety'], description: 'Butylated hydroxyanisole' },
  'e321': { name: 'BHT', eNumber: 'E321', category: 'Antioxidant', safety: 'orange', effects: ['Controversial', 'May affect hormones'], description: 'Butylated hydroxytoluene' },
  'e330': { name: 'Citric Acid', eNumber: 'E330', category: 'Acid', safety: 'green', effects: ['Natural', 'Safe'], description: 'Found naturally in citrus fruits' },
  'e331': { name: 'Sodium Citrate', eNumber: 'E331', category: 'Acid', safety: 'green', effects: ['Safe', 'Salt of citric acid'], description: 'Flavor enhancer' },
  'e338': { name: 'Phosphoric Acid', eNumber: 'E338', category: 'Acid', safety: 'orange', effects: ['May affect calcium absorption', 'Can erode teeth'], description: 'Used in cola drinks' },
  'e339': { name: 'Sodium Phosphate', eNumber: 'E339', category: 'Emulsifier', safety: 'orange', effects: ['May affect kidney function', 'High phosphorus'], description: 'Used in processed cheese' },

  // Emulsifiers
  'e400': { name: 'Alginic Acid', eNumber: 'E400', category: 'Thickener', safety: 'green', effects: ['Natural', 'Fiber'], description: 'Derived from seaweed' },
  'e401': { name: 'Sodium Alginate', eNumber: 'E401', category: 'Thickener', safety: 'green', effects: ['Safe', 'Used in molecular gastronomy'], description: 'Seaweed extract' },
  'e407': { name: 'Carrageenan', eNumber: 'E407', category: 'Thickener', safety: 'green', effects: ['Generally safe', 'Some gut sensitivity'], description: 'Seaweed extract' },
  'e410': { name: 'Carob Bean Gum', eNumber: 'E410', category: 'Thickener', safety: 'green', effects: ['Natural', 'Safe'], description: 'Natural fiber' },
  'e412': { name: 'Guar Gum', eNumber: 'E412', category: 'Thickener', safety: 'green', effects: ['Natural fiber', 'Safe in food amounts'], description: 'Derived from guar beans' },
  'e414': { name: 'Gum Arabic', eNumber: 'E414', category: 'Thickener', safety: 'green', effects: ['Natural', 'Safe'], description: 'Acacia tree sap' },
  'e420': { name: 'Sorbitol', eNumber: 'E420', category: 'Sweetener', safety: 'green', effects: ['Sugar alcohol', 'May cause digestive issues in large amounts'], description: 'Natural sweetener' },
  'e421': { name: 'Mannitol', eNumber: 'E421', category: 'Sweetener', safety: 'green', effects: ['Sugar alcohol', 'Laxative in large amounts'], description: 'Sugar alcohol' },
  'e440': { name: 'Pectin', eNumber: 'E440', category: 'Thickener', safety: 'green', effects: ['Natural fiber', 'Safe'], description: 'Fruit pectin - natural' },
  'e471': { name: 'Mono- and Diglycerides', eNumber: 'E471', category: 'Emulsifier', safety: 'green', effects: ['Natural fat molecule', 'Safe'], description: 'Derived from fats' },
  'e472': { name: 'Esters of Mono/Diglycerides', eNumber: 'E472', category: 'Emulsifier', safety: 'green', effects: ['Generally safe'], description: 'Modified fats' },
  'e500': { name: 'Sodium Carbonates', eNumber: 'E500', category: 'Raising Agent', safety: 'green', effects: ['Baking soda', 'Safe'], description: 'Baking ingredients' },

  // Sweeteners
  'e950': { name: 'Acesulfame K', eNumber: 'E950', category: 'Sweetener', safety: 'orange', effects: ['Controversial', 'Some concerns about safety'], description: 'Artificial sweetener' },
  'e951': { name: 'Aspartame', eNumber: 'E951', category: 'Sweetener', safety: 'orange', effects: ['Controversial', 'Headaches in some', 'Not for phenylketonurics'], description: 'One of the most common artificial sweeteners' },
  'e952': { name: 'Cyclamate', eNumber: 'E952', category: 'Sweetener', safety: 'orange', effects: ['Banned in US', 'Controversial'], description: 'Artificial sweetener' },
  'e954': { name: 'Saccharin', eNumber: 'E954', category: 'Sweetener', safety: 'orange', effects: ['Oldest artificial sweetener', 'Controversial'], description: 'First artificial sweetener' },
  'e955': { name: 'Sucralose', eNumber: 'E955', category: 'Sweetener', safety: 'orange', effects: ['Some concerns about gut bacteria', 'Generally considered safe'], description: 'Splenda' },
  'e960': { name: 'Steviol Glycosides', eNumber: 'E960', category: 'Sweetener', safety: 'green', effects: ['From stevia plant', 'Natural alternative'], description: 'Stevia - natural sweetener' },
  'e965': { name: 'Maltitol', eNumber: 'E965', category: 'Sweetener', safety: 'green', effects: ['Sugar alcohol', 'Laxative effect'], description: 'Sugar-free sweetener' },

  // Colors
  'e100': { name: 'Curcumin', eNumber: 'E100', category: 'Color', safety: 'green', effects: ['Turmeric', 'Anti-inflammatory'], description: 'Natural yellow color from turmeric' },
  'e101': { name: 'Riboflavin (Vitamin B2)', eNumber: 'E101', category: 'Color', safety: 'green', effects: ['Vitamin B2', 'Safe'], description: 'Natural yellow color' },
  'e120': { name: 'Carmine', eNumber: 'E120', category: 'Color', safety: 'green', effects: ['Natural from cochineal', 'Vegetarians avoid'], description: 'Natural red from insects' },
  'e150': { name: 'Caramel', eNumber: 'E150', category: 'Color', safety: 'green', effects: ['Safe', 'Brown color'], description: 'Burnt sugar - natural' },
  'e150a': { name: 'Plain Caramel', eNumber: 'E150a', category: 'Color', safety: 'green', effects: ['Safe'], description: 'Plain caramel color' },
  'e150c': { name: 'Ammonia Caramel', eNumber: 'E150c', category: 'Color', safety: 'red', effects: ['4-MEI carcinogen', 'Avoid'], description: 'Caramel color using ammonia - potentially harmful' },
  'e160': { name: 'Carotenoids', eNumber: 'E160', category: 'Color', safety: 'green', effects: ['Natural orange color', 'Vitamin A precursor'], description: 'From carrots - safe' },
  'e163': { name: 'Anthocyanins', eNumber: 'E163', category: 'Color', safety: 'green', effects: ['Natural purple color', 'Antioxidants'], description: 'From berries - beneficial' },
  'e170': { name: 'Calcium Carbonate', eNumber: 'E170', category: 'Color', safety: 'green', effects: ['Chalk', 'Calcium supplement'], description: 'Natural calcium' },
  'e171': { name: 'Titanium Dioxide', eNumber: 'E171', category: 'Color', safety: 'red', effects: ['Nanoparticles may be harmful', 'Banned in EU'], description: 'White color - avoid' },
  'e172': { name: 'Iron Oxides', eNumber: 'E172', category: 'Color', safety: 'green', effects: ['Natural mineral', 'Safe'], description: 'Natural mineral colors' },

  // Flavor enhancers
  'e620': { name: 'Glutamic Acid', eNumber: 'E620', category: 'Flavor Enhancer', safety: 'orange', effects: ['MSG', 'Chinese restaurant syndrome', 'Headaches'], description: 'MSG - flavor enhancer' },
  'e621': { name: 'Monosodium Glutamate (MSG)', eNumber: 'E621', category: 'Flavor Enhancer', safety: 'orange', effects: ['May cause headaches', 'Chinese restaurant syndrome'], description: 'Most common MSG form' },
  'e627': { name: 'Disodium Guanylate', eNumber: 'E627', category: 'Flavor Enhancer', safety: 'green', effects: ['Nucleotides', 'Safe'], description: 'Flavor enhancer' },
  'e631': { name: 'Disodium Inosinate', eNumber: 'E631', category: 'Flavor Enhancer', safety: 'green', effects: ['Nucleotides', 'Safe'], description: 'Flavor enhancer' },
  'e635': { name: 'Disodium Ribonucleotides', eNumber: 'E635', category: 'Flavor Enhancer', safety: 'green', effects: ['Flavor enhancer', 'Safe'], description: 'Flavor enhancer' },

  // Other common additives
  'e901': { name: 'Beeswax', eNumber: 'E901', category: 'Glazing Agent', safety: 'green', effects: ['Natural', 'Vegans avoid'], description: 'Natural beeswax' },
  'e903': { name: 'Carnauba Wax', eNumber: 'E903', category: 'Glazing Agent', safety: 'green', effects: ['Natural plant wax', 'Safe'], description: 'Natural plant wax' },
  'e904': { name: 'Shellac', eNumber: 'E904', category: 'Glazing Agent', safety: 'green', effects: ['Natural resin', 'Vegans avoid'], description: 'Confectionery glaze' },
};

// Common additive name to E-number mapping
export const ADDITIVE_NAME_TO_ENUMBER: Record<string, string> = {
  'monosodium glutamate': 'e621',
  'msg': 'e621',
  'sodium benzoate': 'e211',
  'benzoic acid': 'e210',
  'sorbic acid': 'e200',
  'potassium sorbate': 'e202',
  'sulphur dioxide': 'e220',
  'sulfur dioxide': 'e220',
  'sodium nitrite': 'e250',
  'sodium nitrate': 'e251',
  'bha': 'e320',
  'bht': 'e321',
  'tbhq': 'e319',
  'acesulfame': 'e950',
  'acesulfame k': 'e950',
  'aspartame': 'e951',
  'saccharin': 'e954',
  'sucralose': 'e955',
  'stevia': 'e960',
  'caramel color': 'e150',
  'caramel': 'e150',
  'titanium dioxide': 'e171',
  'citric acid': 'e330',
  'sodium citrate': 'e331',
  'phosphoric acid': 'e338',
  'guar gum': 'e412',
  'carrageenan': 'e407',
  'xanthan gum': 'e415',
  'pectin': 'e440',
  'carboxymethyl cellulose': 'e466',
  'cellulose': 'e460',
  'sodium metabisulfite': 'e223',
  'potassium metabisulfite': 'e224',
  'sorbate': 'e200',
  'benzoate': 'e210',
  'nitrite': 'e250',
  'nitrate': 'e251',
  'propionate': 'e280',
  'calcium propionate': 'e282',
  'sodium propionate': 'e281',
  'tocopherol': 'e306',
  'ascorbic acid': 'e300',
  'vitamin c': 'e300',
  'beta carotene': 'e160',
  'annatto': 'e160b',
  'paprika extract': 'e160c',
  'carminic acid': 'e120',
  'cochineal': 'e120',
  'riboflavin': 'e101',
  'curcumin': 'e100',
  'glutamic acid': 'e620',
  'disodium guanylate': 'e627',
  'disodium inosinate': 'e631',
  'inosine': 'e631',
  'guanylate': 'e627',
  'acesulfame potassium': 'e950',
  'cyclamate': 'e952',
  'sorbitol': 'e420',
  'maltitol': 'e965',
  'mannitol': 'e421',
  'xylitol': 'e967',
  'iron oxide': 'e172',
  'calcium carbonate': 'e170',
  'anthocyanin': 'e163',
  'beetroot red': 'e162',
  'spirulina': 'e170',
};

export function getAdditiveInfo(additiveName: string): AdditiveInfo | null {
  const lowerName = additiveName.toLowerCase();
  
  // First check direct E-number lookup
  const cleanNumber = lowerName.replace(/[^0-9]/g, '');
  if (cleanNumber && E_NUMBER_DB['e' + cleanNumber]) {
    return E_NUMBER_DB['e' + cleanNumber];
  }
  
  // Check name to E-number mapping
  const eNumber = ADDITIVE_NAME_TO_ENUMBER[lowerName];
  if (eNumber && E_NUMBER_DB[eNumber]) {
    return E_NUMBER_DB[eNumber];
  }
  
  // Partial match
  for (const [key, info] of Object.entries(E_NUMBER_DB)) {
    if (lowerName.includes(info.name.toLowerCase()) || info.name.toLowerCase().includes(lowerName)) {
      return info;
    }
  }
  
  return null;
}

export function getAdditiveSafetyColor(safety: 'green' | 'orange' | 'red'): string {
  if (safety === 'green') return '#10B981';
  if (safety === 'orange') return '#F59E0B';
  return '#EF4444';
}
