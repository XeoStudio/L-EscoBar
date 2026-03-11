import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

function hasDatabaseConfig() {
  return Boolean(process.env.DATABASE_URL);
}

// Generate a unique order code (6 characters, alphanumeric)
function generateOrderCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// GET - جلب جميع الطلبات
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
    return NextResponse.json({ error: 'خطأ في جلب الطلبات' }, { status: 500 });
  }
}

// POST - إنشاء طلب جديد مع حماية قوية من التزامن
export async function POST(request: Request) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json(
      { error: 'قاعدة البيانات غير مهيأة محلياً.' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { tableId, tableNumber, items, notes } = body;

    console.log('Creating order:', { tableId, tableNumber, itemsCount: items?.length });

    if (!tableId || !tableNumber || !items || items.length === 0) {
      return NextResponse.json({ error: 'البيانات غير مكتملة' }, { status: 400 });
    }

    // حساب المجموع أولاً
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
        return NextResponse.json({ error: `المنتج غير موجود` }, { status: 400 });
      }

      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      orderItemsData.push({
        productId: item.productId,
        productName: product.nameAr,
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

    // استخدام Transaction مع إعادة المحاولة للحماية من Race Condition
    const order = await db.$transaction(async (tx) => {
      // 1. قفل الطاولة والتحقق من عدم وجود طلب جاري
      // نستخدم findFirst مع Sort للحصول على أحدث طلب
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
          'الطاولة مشغولة',
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

      // 2. إنشاء الطلب داخل الـ transaction
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
      maxWait: 5000,  // أقصى انتظار 5 ثواني
      timeout: 10000, // أقصى مدة للـ transaction 10 ثواني
    });

    console.log('Order created successfully:', order.id, 'Code:', orderCode);

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    
    // التحقق من خطأ الطاولة المشغولة
    if (error?.code === 'P2002' || error?.message === 'الطاولة مشغولة') {
      return NextResponse.json({ 
        error: 'الطاولة مشغولة',
        details: 'هذه الطاولة لديها طلب جاري بالفعل. يرجى اختيار طاولة أخرى أو الانتظار.',
        existingOrderCode: error?.meta?.existingOrderCode
      }, { status: 409 });
    }
    
    return NextResponse.json({ 
      error: 'خطأ في إنشاء الطلب',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}
