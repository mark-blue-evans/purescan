// OpenFoodFacts API Client

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
  // Origin info
  countryOfOrigin?: string;
  manufacturingPlaces?: string;
  origins?: string;
  categories?: string;
  labels?: string;
  traces?: string;
}

const FETCH_TIMEOUT = 5000; // 5 second timeout

async function fetchWithTimeout(url: string, timeout: number = FETCH_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function lookupProduct(barcode: string): Promise<ProductData | null> {
  try {
    const response = await fetchWithTimeout(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
      5000
    );
    
    if (!response.ok) {
      console.error('OpenFoodFacts API error:', response.status);
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
    
    // Get origin/country info
    const countryOfOrigin = product.countries_tags?.[0]?.replace('en:', '') || 
                          product.country_of_origin_tags?.[0]?.replace('en:', '') ||
                          product.origin || '';
    
    const manufacturingPlaces = product.manufacturing_places || 
                              product.manufacturing_places_tags?.[0] || '';
    
    const origins = product.origins || product.origins_tags?.[0]?.replace('en:', '') || '';
    
    // Get categories to identify product type
    const categories = product.categories_tags?.map((c: string) => c.replace('en:', '')).join(', ') || 
                      product.categories || '';
    
    const labels = product.labels_tags?.map((l: string) => l.replace('en:', '')).join(', ') ||
                  product.labels || '';
    
    return {
      barcode: product.code || barcode,
      name: product.product_name || product.product_name_en || 'Unknown Product',
      brand: product.brands,
      image: product.image_url || product.image_front_url,
      ingredients,
      novaGroup: product.nova_group ? parseInt(product.nova_group) : undefined,
      nutriments: product.nutriments,
      countryOfOrigin,
      manufacturingPlaces,
      origins,
      categories,
      labels
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function searchProducts(query: string): Promise<ProductData[]> {
  try {
    const response = await fetchWithTimeout(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=10`,
      5000
    );
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    
    if (!data.products) {
      return [];
    }
    
    return data.products
      .filter((p: {product_name?: string, product_name_en?: string}) => p.product_name || p.product_name_en)
      .map((product: {code?: string, product_name?: string, product_name_en?: string, brands?: string, image_small_url?: string, image_front_small_url?: string}) => ({
        barcode: product.code,
        name: product.product_name || product.product_name_en || 'Unknown',
        brand: product.brands,
        image: product.image_small_url || product.image_front_small_url
      }));
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}
