// OpenFoodFacts API Client - Balanced for speed and data

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
  additives?: string[];
  allergens?: string[];
}

export const countryFlags: Record<string, string> = {
  'united-states': '🇺🇸', 'united-kingdom': '🇬🇧', 'germany': '🇩🇪',
  'france': '🇫🇷', 'spain': '🇪🇸', 'italy': '🇮🇹', 'ireland': '🇮🇪',
  'australia': '🇦🇺', 'canada': '🇨🇦', 'new-zealand': '🇳🇿', 'japan': '🇯🇵',
};

export function getCountryFlag(countryName: string): string {
  if (!countryName) return '🌍';
  return countryFlags[countryName.toLowerCase().trim()] || '🌍';
}

async function fetchWithTimeout(url: string, timeout: number = 4000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function lookupProduct(barcode: string): Promise<ProductData | null> {
  try {
    // Request essential fields + additives/allergens
    const fields = 'code,product_name,product_name_en,brands,image_url,image_front_url,ingredients_text,ingredients,nova_group,nutriments,countries_tags,categories,additives_tags,additives,allergens_tags';
    
    const response = await fetchWithTimeout(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=${fields}`,
      4000
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.status !== 1 || !data.product) return null;
    
    const p = data.product;
    
    // Parse ingredients
    let ingredients: string[] = [];
    if (p.ingredients_text) {
      ingredients = p.ingredients_text
        .split(/[,;]/)
        .map((i: string) => i.trim())
        .filter((i: string) => i.length > 0);
    } else if (p.ingredients) {
      ingredients = p.ingredients.map((i: {text?: string, name?: string}) => i.text || i.name || '').filter(Boolean);
    }
    
    // Get additives
    let additives: string[] = [];
    if (p.additives_tags) {
      additives = p.additives_tags.map((a: string) => a.replace(/^[a-z]{2}:/, '').replace(/-/g, ' '));
    }
    
    // Get allergens
    let allergens: string[] = [];
    if (p.allergens_tags) {
      allergens = p.allergens_tags.map((a: string) => a.replace(/^[a-z]{2}:/, '').replace(/-/g, ' '));
    }
    
    const countryTag = p.countries_tags?.[0]?.replace('en:', '') || '';
    
    return {
      barcode: p.code || barcode,
      name: p.product_name || p.product_name_en || 'Unknown Product',
      brand: p.brands,
      image: p.image_url || p.image_front_url,
      ingredients,
      novaGroup: p.nova_group ? parseInt(p.nova_group) : undefined,
      nutriments: p.nutriments,
      countryOfOrigin: countryTag,
      manufacturingPlaces: '',
      origins: '',
      categories: p.categories_tags?.map((c: string) => c.replace('en:', '')).join(', ') || p.categories || '',
      labels: '',
      additives,
      allergens
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}
