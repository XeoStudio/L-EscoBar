import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// SHA-256 hash helper (same as login route)
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// POST - Fully reset and seed the database
export async function POST() {
  try {
    // Remove existing data
    await db.orderItem.deleteMany({});
    await db.order.deleteMany({});
    await db.product.deleteMany({});
    await db.category.deleteMany({});
    await db.table.deleteMany({});
    await db.admin.deleteMany({});
    await db.settings.deleteMany({});

    // Create default settings
    await db.settings.create({
      data: {
        id: 'settings-1',
        cafeName: "L'EscoBar",
        currency: 'TND'
      }
    });

    // Create admin account (password: admin123, hashed)
    const hashedPassword = await sha256('admin123');
    const admin = await db.admin.create({
      data: {
        email: 'admin@cafe.com',
        password: hashedPassword,
        name: 'Cafe Owner'
      }
    });

    // Create tables
    for (let i = 1; i <= 10; i++) {
      await db.table.create({
        data: { number: i, seats: i % 3 === 0 ? 2 : (i % 2 === 0 ? 6 : 4) }
      });
    }

    // Create categories
    const cats = [
      { id: 'cat-coffee', name: 'Coffee', nameAr: 'Coffee' },
      { id: 'cat-tea', name: 'Tea', nameAr: 'Tea' },
      { id: 'cat-drinks', name: 'Cold Drinks', nameAr: 'Cold Drinks' },
      { id: 'cat-desserts', name: 'Desserts', nameAr: 'Desserts' },
      { id: 'cat-snacks', name: 'Snacks', nameAr: 'Snacks' }
    ];
    
    for (const cat of cats) {
      await db.category.create({ data: cat });
    }

    // Create products
    const prods = [
      // Coffee
      { name: 'Café Lavazza', nameAr: 'Café Lavazza', price: 6.500, categoryId: 'cat-coffee' },
      { name: 'Café Nespresso', nameAr: 'Café Nespresso', price: 6.500, categoryId: 'cat-coffee' },
      { name: 'Café Saquella', nameAr: 'Café Saquella', price: 6.500, categoryId: 'cat-coffee' },
      { name: 'Café Express Américain', nameAr: 'Café Express Américain', price: 3.800, categoryId: 'cat-coffee' },
      { name: 'Café Express', nameAr: 'Café Express', price: 3.400, categoryId: 'cat-coffee' },
      { name: 'Café Cappucin', nameAr: 'Café Cappucin', price: 3.600, categoryId: 'cat-coffee' },
      { name: 'Café Crème', nameAr: 'Café Crème', price: 3.800, categoryId: 'cat-coffee' },
      { name: 'Café Escobar', nameAr: 'Café Escobar', price: 6.500, categoryId: 'cat-coffee' },
      { name: 'Café Cappuccino', nameAr: 'Café Cappuccino', price: 6.500, categoryId: 'cat-coffee' },
      { name: 'Café Macchiato', nameAr: 'Café Macchiato', price: 3.400, categoryId: 'cat-coffee' },
      { name: 'Café Turc', nameAr: 'Café Turc', price: 5.500, categoryId: 'cat-coffee' },
      { name: 'Café Biscup', nameAr: 'Café Biscup', price: 3.500, categoryId: 'cat-coffee' },
      { name: 'Pévalu', nameAr: 'Pévalu', price: 1.000, categoryId: 'cat-coffee' },
      { name: 'Expresse importé', nameAr: 'Expresse importé', price: 2.500, categoryId: 'cat-coffee' },
      { name: 'Cappucin importé', nameAr: 'Cappucin importé', price: 2.800, categoryId: 'cat-coffee' },
      { name: 'Café crème importé', nameAr: 'Café crème importé', price: 3.000, categoryId: 'cat-coffee' },
      { name: 'Pévalu 2', nameAr: 'Pévalu 2', price: 0.500, categoryId: 'cat-coffee' },
      { name: 'American importé', nameAr: 'American importé', price: 3.000, categoryId: 'cat-coffee' },
      
      // Tea
      { name: 'Black Tea', nameAr: 'Black Tea', price: 2.000, categoryId: 'cat-tea' },
      { name: 'Green Tea', nameAr: 'Green Tea', price: 2.500, categoryId: 'cat-tea' },
      { name: 'Mint Tea', nameAr: 'Mint Tea', price: 3.000, categoryId: 'cat-tea' },
      { name: 'Chai Latte', nameAr: 'Chai Latte', price: 5.000, categoryId: 'cat-tea' },
      
      // Cold drinks
      { name: 'Iced Latte', nameAr: 'Iced Latte', price: 5.000, categoryId: 'cat-drinks' },
      { name: 'Iced Americano', nameAr: 'Iced Americano', price: 4.000, categoryId: 'cat-drinks' },
      { name: 'Fresh Orange Juice', nameAr: 'Fresh Orange Juice', price: 4.500, categoryId: 'cat-drinks' },
      { name: 'Mango Smoothie', nameAr: 'Mango Smoothie', price: 6.000, categoryId: 'cat-drinks' },
      
      // Desserts
      { name: 'Cheesecake', nameAr: 'Cheesecake', price: 7.000, categoryId: 'cat-desserts' },
      { name: 'Chocolate Cake', nameAr: 'Chocolate Cake', price: 7.500, categoryId: 'cat-desserts' },
      { name: 'Tiramisu', nameAr: 'Tiramisu', price: 8.000, categoryId: 'cat-desserts' },
      { name: 'Brownie', nameAr: 'Brownie', price: 5.000, categoryId: 'cat-desserts' },
      
      // Snacks
      { name: 'Croissant', nameAr: 'Croissant', price: 3.500, categoryId: 'cat-snacks' },
      { name: 'Club Sandwich', nameAr: 'Club Sandwich', price: 8.500, categoryId: 'cat-snacks' },
      { name: 'French Fries', nameAr: 'French Fries', price: 4.500, categoryId: 'cat-snacks' },
    ];
    
    for (const prod of prods) {
      await db.product.create({
        data: { ...prod, available: true }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Database reset and seeding completed successfully',
      admin: { 
        email: admin.email, 
        password: 'admin123',
        hashedPassword: hashedPassword 
      }
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed data: ' + String(error) }, { status: 500 });
  }
}
