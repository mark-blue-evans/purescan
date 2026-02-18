// OpenFoodFacts API Client - Optimized for speed

export interface ProductData {
  barcode: string;
  name: string;
  brand?: string;
  image?: string;
  ingredients?: string[];
  novaGroup?: number;
  nutriments?: {
    'energy-kcal_100g'?: number;
    'sugars_100g'?: number;
    'fat_100g'?: number;
    'proteins_100g'?: number;
    'fiber_100g'?: number;
    'salt_100g'?: number;
    'sodium_100g'?: number;
  };
  countryOfOrigin?: string;
  manufacturingPlaces?: string;
  origins?: string;
  categories?: string;
  labels?: string;
}

// Country code to flag emoji mapping
export const countryFlags: Record<string, string> = {
  'united-states': '🇺🇸',
  'united-kingdom': '🇬🇧',
  'germany': '🇩🇪',
  'france': '🇫🇷',
  'spain': '🇪🇸',
  'italy': '🇮🇹',
  'ireland': '🇮🇪',
  'australia': '🇦🇺',
  'canada': '🇨🇦',
  'new-zealand': '🇳🇿',
  'japan': '🇯🇵',
  'china': '🇨🇳',
  'india': '🇮🇳',
  'brazil': '🇧🇷',
  'mexico': '🇲🇽',
  'netherlands': '🇳🇱',
  'belgium': '🇧🇪',
  'switzerland': '🇨🇭',
  'austria': '🇦🇹',
  'poland': '🇵🇱',
  'sweden': '🇸🇪',
  'norway': '🇳🇴',
  'denmark': '🇩🇰',
  'finland': '🇫🇮',
  'portugal': '🇵🇹',
  'greece': '🇬🇷',
  'czech-republic': '🇨🇿',
  'hungary': '🇭🇺',
  'romania': '🇷🇴',
  'bulgaria': '🇧🇬',
  'croatia': '🇭🇷',
  'slovenia': '🇸🇮',
  'slovakia': '🇸🇰',
  'estonia': '🇪🇪',
  'latvia': '🇱🇻',
  'lithuania': '🇱🇹',
  'south-africa': '🇿🇦',
  'egypt': '🇪🇬',
  'israel': '🇮🇱',
  'turkey': '🇹🇷',
  'russia': '🇷🇺',
  'ukraine': '🇺🇦',
  'south-korea': '🇰🇷',
  'singapore': '🇸🇬',
  'malaysia': '🇲🇾',
  'thailand': '🇹🇭',
  'indonesia': '🇮🇩',
  'philippines': '🇵🇭',
  'vietnam': '🇻🇳',
  'taiwan': '🇹🇼',
  'hong-kong': '🇭🇰',
  'united-arab-emirates': '🇦🇪',
  'saudi-arabia': '🇸🇦',
  'qatar': '🇶🇦',
  'kuwait': '🇰🇼',
  'bahrain': '🇧🇭',
  'oman': '🇴🇲',
  'jordan': '🇯🇴',
  'lebanon': '🇱🇧',
  'pakistan': '🇵🇰',
  'argentina': '🇦🇷',
  'chile': '🇨🇱',
  'colombia': '🇨🇴',
  'peru': '🇵🇪',
  'venezuela': '🇻🇪',
  'ecuador': '🇪🇨',
  'uruguay': '🇺🇾',
  'paraguay': '🇵🇾',
  'bolivia': '🇧🇴',
  'costa-rica': '🇨🇷',
  'panama': '🇵🇦',
  'guatemala': '🇬🇹',
  'honduras': '🇭🇳',
  'el-salvador': '🇸🇻',
  'nicaragua': '🇳🇮',
  'dominican-republic': '🇩🇴',
  'cuba': '🇨🇺',
  'jamaica': '🇯🇲',
  'trinidad-and-tobago': '🇹🇹',
  'barbados': '🇧🇧',
  'bahamas': '🇧🇸',
  'iceland': '🇮🇸',
  'luxembourg': '🇱🇺',
  'monaco': '🇲🇨',
  'liechtenstein': '🇱🇮',
  'andorra': '🇦🇩',
  'san-marino': '🇸🇲',
  'malta': '🇲🇹',
  'cyprus': '🇨🇾',
  'north-macedonia': '🇲🇰',
  'serbia': '🇷🇸',
  'montenegro': '🇲🇪',
  'bosnia-and-herzegovina': '🇧🇦',
  'albania': '🇦🇱',
  'moldova': '🇲🇩',
  'belarus': '🇧🇾',
  'georgia': '🇬🇪',
  'armenia': '🇦🇲',
  'azerbaijan': '🇦🇿',
  'kazakhstan': '🇰🇿',
  'uzbekistan': '🇺🇿',
  'turkmenistan': '🇹🇲',
  'kyrgyzstan': '🇰🇬',
  'tajikistan': '🇹🇯',
  'afghanistan': '🇦🇫',
  'iran': '🇮🇷',
  'iraq': '🇮🇶',
  'syria': '🇸🇾',
  'libya': '🇱🇾',
  'tunisia': '🇹🇳',
  'algeria': '🇩🇿',
  'morocco': '🇲🇦',
  'sudan': '🇸🇩',
  'ethiopia': '🇪🇹',
  'kenya': '🇰🇪',
  'tanzania': '🇹🇿',
  'uganda': '🇺🇬',
  'nigeria': '🇳🇬',
  'ghana': '🇬🇭',
  'ivory-coast': '🇨🇮',
  'senegal': '🇸🇳',
  'cameroon': '🇨🇲',
  'congo': '🇨🇬',
  'madagascar': '🇲🇬',
  'mali': '🇲🇱',
  'burkina-faso': '🇧🇫',
  'niger': '🇳🇪',
  'zambia': '🇿🇲',
  'zimbabwe': '🇿🇼',
  'botswana': '🇧🇼',
  'namibia': '🇳🇦',
  'mozambique': '🇲🇿',
  'angola': '🇦🇴',
  'Rwanda': '🇷🇼',
  'New Zealand': '🇳🇿',
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
};

export function getCountryFlag(countryName: string): string {
  if (!countryName) return '🌍';
  
  const normalized = countryName.toLowerCase().trim();
  
  // Direct match
  if (countryFlags[normalized]) {
    return countryFlags[normalized];
  }
  
  // Try partial match
  for (const [key, flag] of Object.entries(countryFlags)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return flag;
    }
  }
  
  return '🌍';
}

async function fetchWithTimeout(url: string, timeout: number = 4000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { 
      signal: controller.signal,
      cache: 'no-store'
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function lookupProduct(barcode: string): Promise<ProductData | null> {
  try {
    // Use the faster API endpoint
    const response = await fetchWithTimeout(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=code,product_name,product_name_en,brands,image_url,image_front_url,ingredients_text,ingredients,nova_group,nutrients,nutriments,countries_tags,country_of_origin_tags,manufacturing_places,manufacturing_places_tags,origins,origins_tags,categories,categories_tags,labels,labels_tags`,
      4000
    );
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (data.status !== 1 || !data.product) {
      return null;
    }
    
    const product = data.product;
    
    // Parse ingredients
    let ingredients: string[] = [];
    if (product.ingredients_text) {
      ingredients = product.ingredients_text
        .split(/[,;]/)
        .map((i: string) => i.trim())
        .filter((i: string) => i.length > 0);
    } else if (product.ingredients) {
      ingredients = product.ingredients.map((i: {text?: string, name?: string}) => i.text || i.name || '').filter(Boolean);
    }
    
    // Get country info
    const countryTag = product.countries_tags?.[0]?.replace('en:', '') || 
                      product.country_of_origin_tags?.[0]?.replace('en:', '') || '';
    
    // Get categories
    const categories = product.categories_tags?.map((c: string) => c.replace('en:', '')).join(', ') || 
                      product.categories || '';
    
    const labels = product.labels_tags?.map((l: string) => l.replace('en:', '')).join(', ') || '';
    
    return {
      barcode: product.code || barcode,
      name: product.product_name || product.product_name_en || 'Unknown Product',
      brand: product.brands,
      image: product.image_url || product.image_front_url,
      ingredients,
      novaGroup: product.nova_group ? parseInt(product.nova_group) : undefined,
      nutriments: product.nutriments,
      countryOfOrigin: countryTag,
      manufacturingPlaces: product.manufacturing_places || '',
      origins: product.origins || '',
      categories,
      labels
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}
