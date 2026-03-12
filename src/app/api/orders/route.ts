import { NextResponse } from 'next/server';
import { db, hasDatabaseConfig } from '@/lib/db';
import { Prisma } from '@prisma/client';

// Generate a unique order code (6 characters, alphanumeric)
function generateOrderCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// GET - Fetch all orders
export async function GET(request: Request) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json([]);
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const tableId = searchParams.get('tableId');

    const where: Record<string, unknown> = {};
    
    if (status) {
      where.status = status;
    }
    
    if (tableId) {
      where.tableId = tableId;
    }

    const orders = await db.order.findMany({
      where,
      include: {
        table: true,
        orderItems: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST - Create a new order with race-condition protection
export async function POST(request: Request) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json(
      { error: 'Database is not configured locally.' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { tableId, tableNumber, items, notes } = body;

    console.log('Creating order:', { tableId, tableNumber, itemsCount: items?.length });

    if (!tableId || !tableNumber || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required order data' }, { status: 400 });
    }

    // Calculate total first
    let total = 0;
    const orderItemsData: Array<{
      productId: string;
      productName: string;
      price: number;
      quantity: number;
      notes: string | null;
    }> = [];

    for (const item of items) {
      const product = await db.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 400 });
      }

      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      orderItemsData.push({
        productId: item.productId,
        productName: product.name,
        price: product.price,
        quantity: item.quantity,
        notes: item.notes || null
      });
    }

    // Generate unique order code
    let orderCode = generateOrderCode();
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      const existingCode = await db.order.findFirst({
        where: { orderCode }
      });
      
      if (!existingCode) break;
      
      orderCode = generateOrderCode();
      attempts++;
    }

    // Use transaction to guard against race conditions
    const order = await db.$transaction(async (tx) => {
      // 1. Verify there is no active order on this table
      const existingOrder = await tx.order.findFirst({
        where: {
          tableId,
          status: {
            notIn: ['PAID', 'CANCELLED']
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (existingOrder) {
        throw new Prisma.PrismaClientKnownRequestError(
          'Table is occupied',
          { 
            code: 'P2002', 
            clientVersion: '5.0.0',
            meta: { 
              target: ['tableId'],
              existingOrderCode: existingOrder.orderCode 
            }
          }
        );
      }

      // 2. Create order inside the transaction
      const newOrder = await tx.order.create({
        data: {
          orderCode,
          tableId,
          tableNumber: typeof tableNumber === 'string' ? parseInt(tableNumber) : tableNumber,
          notes: notes || null,
          total,
          orderItems: {
            create: orderItemsData
          }
        },
        include: {
          table: true,
          orderItems: true
        }
      });

      return newOrder;
    }, {
      maxWait: 5000,
      timeout: 10000,
    });

    console.log('Order created successfully:', order.id, 'Code:', orderCode);

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    
    // Occupied table conflict
    if (error?.code === 'P2002' || error?.message === 'Table is occupied') {
      return NextResponse.json({ 
        error: 'Table is occupied',
        details: 'This table already has an active order. Please choose another table or wait.',
        existingOrderCode: error?.meta?.existingOrderCode
      }, { status: 409 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to create order',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}
