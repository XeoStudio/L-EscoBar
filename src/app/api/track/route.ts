import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Track order by code
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const detailsFlag = searchParams.get('details');
    const includeDetails = detailsFlag === '1' || detailsFlag === 'true';

    if (!code) {
      return NextResponse.json({ error: 'Please enter a tracking code' }, { status: 400 });
    }

    // Normalize code to uppercase
    const orderCode = code.toUpperCase().trim();

    const order = await db.order.findUnique({
      where: { orderCode },
      ...(includeDetails
        ? {
            include: {
              table: true,
              orderItems: {
                include: {
                  product: true,
                },
              },
            },
          }
        : {
            select: {
              id: true,
              orderCode: true,
              tableId: true,
              tableNumber: true,
              status: true,
              total: true,
              notes: true,
              createdAt: true,
              updatedAt: true,
            },
          }),
    });

    if (!order) {
      return NextResponse.json({ error: 'No order found for this tracking code' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error tracking order:', error);
    return NextResponse.json({ error: 'Failed to track order' }, { status: 500 });
  }
}
