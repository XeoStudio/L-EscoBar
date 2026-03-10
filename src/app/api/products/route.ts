import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - جلب جميع المنتجات
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const available = searchParams.get('available');

    const where: Record<string, unknown> = {};
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    if (available !== null) {
      where.available = available === 'true';
    }

    const products = await db.product.findMany({
      where,
      include: {
        category: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'خطأ في جلب المنتجات' }, { status: 500 });
  }
}

// POST - إضافة منتج جديد
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, nameAr, description, descriptionAr, price, image, categoryId, available } = body;

    if (!name || !nameAr || !price || !categoryId) {
      return NextResponse.json({ error: 'البيانات الأساسية مطلوبة' }, { status: 400 });
    }

    const product = await db.product.create({
      data: {
        name,
        nameAr,
        description,
        descriptionAr,
        price: parseFloat(price),
        image,
        categoryId,
        available: available ?? true
      },
      include: {
        category: true
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'خطأ في إنشاء المنتج' }, { status: 500 });
  }
}
