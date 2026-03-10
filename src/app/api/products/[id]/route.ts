import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - جلب منتج واحد
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'خطأ في جلب المنتج' }, { status: 500 });
  }
}

// PUT - تعديل منتج
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, nameAr, description, descriptionAr, price, image, categoryId, available } = body;

    const product = await db.product.update({
      where: { id },
      data: {
        name,
        nameAr,
        description,
        descriptionAr,
        price: price ? parseFloat(price) : undefined,
        image,
        categoryId,
        available
      },
      include: {
        category: true
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'خطأ في تحديث المنتج' }, { status: 500 });
  }
}

// DELETE - حذف منتج
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await db.product.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'تم حذف المنتج بنجاح' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'خطأ في حذف المنتج' }, { status: 500 });
  }
}
