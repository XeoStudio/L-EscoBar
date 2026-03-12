import { NextResponse } from 'next/server';
import { db, hasDatabaseConfig } from '@/lib/db';
import { Prisma } from '@prisma/client';

// GET - Fetch tables with occupancy status (optimized)
export async function GET() {
  if (!hasDatabaseConfig()) {
    return NextResponse.json([], {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  }

  try {
    // Single optimized raw query for maximum speed
    const result = await db.$queryRaw<Array<{
      id: string;
      number: number;
      seats: number;
      description: string | null;
      active: boolean;
      order_id: string | null;
      order_status: string | null;
      order_code: string | null;
    }>>`
      SELECT 
        t.id, 
        t.number, 
        t.seats, 
        t.description, 
        t.active,
        o.id as order_id,
        o.status as order_status,
        o."orderCode" as order_code
      FROM tables t
      LEFT JOIN orders o ON t.id = o."tableId" 
        AND o.status NOT IN ('PAID', 'CANCELLED')
      ORDER BY t.number ASC
    `;

    // Transform result rows
    const tablesWithStatus = result.map(row => ({
      id: row.id,
      number: row.number,
      seats: row.seats,
      description: row.description,
      active: row.active,
      isOccupied: row.order_id !== null,
      currentOrder: row.order_id ? {
        tableId: row.id,
        status: row.order_status,
        orderCode: row.order_code,
      } : null
    }));

    return NextResponse.json(tablesWithStatus, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error) {
    console.error('Error fetching table status:', error);
    return NextResponse.json({ error: 'Failed to fetch table status' }, { status: 500 });
  }
}
