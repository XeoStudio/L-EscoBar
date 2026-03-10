import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - جلب جميع الفئات
export async function GET() {
  try {
    const categories = await db.category.findMany({
      include: {
        products: {
          where: { available: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'خطأ في جلب الفئات' }, { status: 500 });
  }
}

// POST - إضافة فئة جديدة
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, nameAr, image } = body;

    if (!name || !nameAr) {
      return NextResponse.json({ error: 'اسم الفئة مطلوب' }, { status: 400 });
    }

    const category = await db.category.create({
      data: {
        name,
        nameAr,
        image
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'خطأ في إنشاء الفئة' }, { status: 500 });
  }
}
