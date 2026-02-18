import { NextRequest, NextResponse } from 'next/server';
import { getDb, initializeDb } from '@/lib/db';

export async function GET() {
  try {
    await initializeDb();
    
    const db = getDb();
    if (!db) {
      return NextResponse.json([]);
    }
    
    const scans = await db`
      SELECT * FROM scans 
      ORDER BY scanned_at DESC 
      LIMIT 50
    `;

    return NextResponse.json(scans);
  } catch (error) {
    console.error('History error:', error);
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
      await db`DELETE FROM scans WHERE id = ${parseInt(id)}`;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
