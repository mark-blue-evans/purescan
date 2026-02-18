import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDb } from '@/lib/db';
import { lookupProduct } from '@/lib/openfoodfacts';
import { calculatePurityScore } from '@/lib/scoring';

export async function POST(request: NextRequest) {
  try {
    // Initialize database if needed
    try {
      await initializeDb();
    } catch (dbError) {
      console.log('DB might already be initialized:', dbError);
    }

    const { barcode } = await request.json();

    if (!barcode) {
      return NextResponse.json({ error: 'Barcode required' }, { status: 400 });
    }

    // Lookup product from OpenFoodFacts
    const product = await lookupProduct(barcode);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Calculate purity score
    const scoreResult = calculatePurityScore(
      product.ingredients || [],
      product.novaGroup
    );

    // Save to database
    try {
      await sql`
        INSERT INTO scans (barcode, product_name, purity_score, processing_level, ingredients, image_url)
        VALUES (
          ${product.barcode},
          ${product.name},
          ${scoreResult.score},
          ${scoreResult.processingLevel},
          ${JSON.stringify(product.ingredients || [])},
          ${product.image || null}
        )
      `;
    } catch (saveError) {
      console.error('Error saving scan:', saveError);
      // Continue anyway - product lookup succeeded
    }

    return NextResponse.json({
      barcode: product.barcode,
      name: product.name,
      brand: product.brand,
      image: product.image,
      ingredients: product.ingredients,
      nutriments: product.nutriments,
      score: scoreResult.score,
      processingLevel: scoreResult.processingLevel,
      redFlags: scoreResult.redFlags
    });
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
