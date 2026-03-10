import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - جلب فئة واحدة
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = await db.category.findUnique({
      where: { id },
      include: {
        products: true
      }
    });

    if (!category) {
      return NextResponse.json({ error: 'الفئة غير موجودة' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ error: 'خطأ في جلب الفئة' }, { status: 500 });
  }
}

// PUT - تعديل فئة
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, nameAr, image } = body;

    const category = await db.category.update({
      where: { id },
      data: {
        name,
        nameAr,
        image
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'خطأ في تحديث الفئة' }, { status: 500 });
  }
}

// DELETE - حذف فئة
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await db.category.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'تم حذف الفئة بنجاح' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'خطأ في حذف الفئة' }, { status: 500 });
  }
}
