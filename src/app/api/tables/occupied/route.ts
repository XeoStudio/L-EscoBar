import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - جلب الطاولات المشغولة فقط (سريع جداً)
export async function GET() {
  try {
    // استعلام واحد فقط للحصول على الطلبات النشطة
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

    // إرجاع الطاولات المشغولة
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
        // Cache لمدة قصيرة جداً
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error) {
    console.error('Error fetching occupied tables:', error);
    return NextResponse.json({ 
      error: 'خطأ في جلب حالة الطاولات',
      occupied: [],
      occupiedIds: [],
      count: 0,
    }, { status: 500 });
  }
}
