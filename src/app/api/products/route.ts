import { NextResponse } from 'next/server';
import { db, hasDatabaseConfig } from '@/lib/db';

// GET - Fetch all products
export async function GET(request: Request) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json([]);
  }

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
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST - Create a new product
export async function POST(request: Request) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json(
      { error: 'Database is not configured locally.' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { name, nameAr, nameFr, description, descriptionAr, descriptionFr, price, image, categoryId, available } = body;

    if (!name || !nameAr || !price || !categoryId) {
      return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 });
    }

    const product = await db.product.create({
      data: {
        name,
        nameAr,
        nameFr,
        description,
        descriptionAr,
        descriptionFr,
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
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
