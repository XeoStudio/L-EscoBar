import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - جلب طاولة واحدة
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const table = await db.table.findUnique({
      where: { id },
      include: { orders: true }
    });
    
    if (!table) {
      return NextResponse.json({ error: 'الطاولة غير موجودة' }, { status: 404 });
    }
    
    return NextResponse.json(table);
  } catch (error) {
    console.error('Error fetching table:', error);
    return NextResponse.json({ error: 'خطأ في جلب الطاولة' }, { status: 500 });
  }
}

// PUT - تعديل طاولة
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { number, seats, description, active } = body;

    const table = await db.table.update({
      where: { id },
      data: {
        number: number !== undefined ? parseInt(number) : undefined,
        seats: seats !== undefined ? parseInt(seats) : undefined,
        description,
        active
      }
    });

    return NextResponse.json(table);
  } catch (error) {
    console.error('Error updating table:', error);
    return NextResponse.json({ error: 'خطأ في تحديث الطاولة' }, { status: 500 });
  }
}

// DELETE - حذف طاولة
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await db.table.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'تم حذف الطاولة بنجاح' });
  } catch (error) {
    console.error('Error deleting table:', error);
    return NextResponse.json({ error: 'خطأ في حذف الطاولة' }, { status: 500 });
  }
}
