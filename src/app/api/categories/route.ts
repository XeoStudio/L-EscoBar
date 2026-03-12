import { NextResponse } from 'next/server';
import { db, hasDatabaseConfig } from '@/lib/db';

// GET - Fetch all categories
export async function GET() {
  if (!hasDatabaseConfig()) {
    return NextResponse.json([]);
  }

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
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST - Create a new category
export async function POST(request: Request) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json(
      { error: 'Database is not configured locally.' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { name, nameAr, image } = body;

    if (!name || !nameAr) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
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
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
