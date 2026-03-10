import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Generate a unique order code (6 characters, alphanumeric)
function generateOrderCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// POST - Run migration to add orderCode to existing orders
export async function POST() {
  try {
    // Get all orders without orderCode
    const orders = await db.$queryRaw<Array<{id: string}>>`
      SELECT id FROM orders WHERE "orderCode" IS NULL
    `;

    let updated = 0;
    
    for (const order of orders) {
      let orderCode = generateOrderCode();
      
      // Check if code exists
      const existing = await db.$queryRaw<Array<{id: string}>>`
        SELECT id FROM orders WHERE "orderCode" = ${orderCode}
      `;
      
      while (existing.length > 0) {
        orderCode = generateOrderCode();
        const checkAgain = await db.$queryRaw<Array<{id: string}>>`
          SELECT id FROM orders WHERE "orderCode" = ${orderCode}
        `;
        if (checkAgain.length === 0) break;
      }
      
      await db.$executeRaw`
        UPDATE orders SET "orderCode" = ${orderCode} WHERE id = ${order.id}
      `;
      updated++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `تم تحديث ${updated} طلب بكود التتبع`,
      updated 
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'فشل في الترحيل' }, { status: 500 });
  }
}
