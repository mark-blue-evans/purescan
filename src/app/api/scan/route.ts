import { NextRequest, NextResponse } from 'next/server';
import { getDb, initializeDb } from '@/lib/db';
import { lookupProduct } from '@/lib/openfoodfacts';
import { calculatePurityScore } from '@/lib/scoring';

let dbInitialized = false;

export async function POST(request: NextRequest) {
  try {
    if (!dbInitialized) {
      try { await initializeDb(); dbInitialized = true; } catch {}
    }

    const { barcode } = await request.json();
    if (!barcode) return NextResponse.json({ error: 'Barcode required' }, { status: 400 });

    const product = await lookupProduct(barcode);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const scoreResult = calculatePurityScore(
      product.ingredients || [],
      product.novaGroup,
      product.additives,
      product.allergens
    );

    // Save to database (fire and forget)
    try {
      const db = getDb();
      if (db) {
        db`INSERT INTO scans (barcode, product_name, purity_score, processing_level, ingredients, image_url) VALUES (${product.barcode}, ${product.name}, ${scoreResult.score}, ${scoreResult.processingLevel}, ${JSON.stringify(product.ingredients || [])}, ${product.image || null})`.catch(() => {});
      }
    } catch {}

    return NextResponse.json({
      barcode: product.barcode,
      name: product.name,
      brand: product.brand,
      image: product.image,
      ingredients: product.ingredients,
      nutriments: product.nutriments,
      score: scoreResult.score,
      processingLevel: scoreResult.processingLevel,
      risks: scoreResult.risks,
      scoreFactors: scoreResult.scoreFactors,
      origin: {
        country: product.countryOfOrigin,
        manufacturing: product.manufacturingPlaces,
        origins: product.origins,
        categories: product.categories,
        labels: product.labels
      }
    });
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
