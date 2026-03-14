import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch occupied tables only (very fast)
export async function GET() {
  try {
    // Single query to get active orders
    const activeOrders = await db.order.findMany({
      where: {
        status: {
          notIn: ['PAID', 'CANCELLED']
        }
      },
      select: {
        tableId: true,
        tableNumber: true,
        status: true,
        orderCode: true,
        createdAt: true,
      }
    });

    // Return occupied table entries
    const occupiedTables = activeOrders.map(order => ({
      tableId: order.tableId,
      tableNumber: order.tableNumber,
      orderCode: order.orderCode,
      status: order.status,
      createdAt: order.createdAt,
    }));

    return NextResponse.json({
      occupied: occupiedTables,
      occupiedIds: occupiedTables.map(t => t.tableId),
      count: occupiedTables.length,
      timestamp: Date.now(),
    }, {
      headers: {
        // Very short cache lifetime
        'Cache-Control': 'private, max-age=2, stale-while-revalidate=1',
      }
    });
  } catch (error) {
    console.error('Error fetching occupied tables:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch table status',
      occupied: [],
      occupiedIds: [],
      count: 0,
    }, { status: 500 });
  }
}
