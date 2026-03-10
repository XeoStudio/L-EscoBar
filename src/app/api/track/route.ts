import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - تتبع الطلب بالكود
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'يرجى إدخال كود التتبع' }, { status: 400 });
    }

    // Normalize code to uppercase
    const orderCode = code.toUpperCase().trim();

    const order = await db.order.findUnique({
      where: { orderCode },
      include: {
        table: true,
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'لم يتم العثور على طلب بهذا الكود' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error tracking order:', error);
    return NextResponse.json({ error: 'خطأ في تتبع الطلب' }, { status: 500 });
  }
}
