import { NextRequest, NextResponse } from 'next/server';
import { getDb, initializeDb } from '@/lib/db';

export async function GET() {
  try {
    await initializeDb();
    
    const db = getDb();
    if (!db) {
      return NextResponse.json([]);
    }
    
    const items = await db`
      SELECT id, barcode, product_name, purity_score, added_at 
      FROM grocery_items 
      ORDER BY added_at DESC
    `;

    return NextResponse.json(items || []);
  } catch (error) {
    console.error('Grocery list error:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeDb();

    const { barcode, productName, purityScore } = await request.json();

    if (!barcode || !productName) {
      return NextResponse.json({ error: 'Barcode and name required' }, { status: 400 });
    }

    const db = getDb();
    if (db) {
      await db`
        INSERT INTO grocery_items (barcode, product_name, purity_score)
        VALUES (${barcode}, ${productName}, ${purityScore || 0})
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Add to grocery error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const db = getDb();
    if (db) {
      await db`DELETE FROM grocery_items WHERE id = ${parseInt(id)}`;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete grocery error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
