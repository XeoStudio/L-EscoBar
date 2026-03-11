import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

function hasDatabaseConfig() {
  return Boolean(process.env.DATABASE_URL);
}

// GET - جلب جميع الطاولات مع حالة الاحتلال
export async function GET() {
  if (!hasDatabaseConfig()) {
    return NextResponse.json([]);
  }

  try {
    // جلب جميع الطاولات
    const tables = await db.table.findMany({
      orderBy: { number: 'asc' }
    });

    // جلب الطلبات النشطة (غير مدفوعة وغير ملغاة)
    const activeOrders = await db.order.findMany({
      where: {
        status: {
          notIn: ['PAID', 'CANCELLED']
        }
      },
      select: {
        tableId: true,
        status: true,
        orderCode: true
      }
    });

    // إنشاء خريطة للطاولات المشغولة
    const occupiedTableIds = new Set(activeOrders.map(order => order.tableId));

    // إضافة حالة الاحتلال لكل طاولة
    const tablesWithStatus = tables.map(table => ({
      ...table,
      isOccupied: occupiedTableIds.has(table.id)
    }));

    return NextResponse.json(tablesWithStatus);
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json({ error: 'خطأ في جلب الطاولات' }, { status: 500 });
  }
}

// POST - إضافة طاولة جديدة
export async function POST(request: Request) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json(
      { error: 'قاعدة البيانات غير مهيأة محلياً.' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { number, seats, description } = body;

    if (!number) {
      return NextResponse.json({ error: 'رقم الطاولة مطلوب' }, { status: 400 });
    }

    const num = parseInt(number);
    
    // التحقق من عدم وجود طاولة بنفس الرقم
    const existing = await db.table.findUnique({
      where: { number: num }
    });

    if (existing) {
      return NextResponse.json({ error: 'رقم الطاولة موجود مسبقاً' }, { status: 400 });
    }

    const table = await db.table.create({
      data: {
        number: num,
        seats: seats ? parseInt(seats) : 4,
        description: description || null,
        active: true
      }
    });

    return NextResponse.json(table, { status: 201 });
  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json({ error: 'خطأ في إنشاء الطاولة' }, { status: 500 });
  }
}

// DELETE - حذف طاولة
export async function DELETE(request: Request) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json(
      { error: 'قاعدة البيانات غير مهيأة محلياً.' },
      { status: 503 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'معرف الطاولة مطلوب' }, { status: 400 });
    }

    await db.table.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'تم حذف الطاولة بنجاح' });
  } catch (error) {
    console.error('Error deleting table:', error);
    return NextResponse.json({ error: 'خطأ في حذف الطاولة' }, { status: 500 });
  }
}
