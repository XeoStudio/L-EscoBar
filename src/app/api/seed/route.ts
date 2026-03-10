import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// دالة تشفير SHA-256 (نفس المستخدمة في login)
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// POST - إعادة ضبط قاعدة البيانات بالكامل
export async function POST() {
  try {
    // حذف جميع البيانات القديمة
    await db.orderItem.deleteMany({});
    await db.order.deleteMany({});
    await db.product.deleteMany({});
    await db.category.deleteMany({});
    await db.table.deleteMany({});
    await db.admin.deleteMany({});
    await db.settings.deleteMany({});

    // إنشاء الإعدادات الافتراضية
    await db.settings.create({
      data: {
        id: 'settings-1',
        cafeName: "L'EscoBar",
        currency: 'د.ت'
      }
    });

    // إنشاء حساب المسؤول - كلمة المرور: admin123 (مشفرة)
    const hashedPassword = await sha256('admin123');
    const admin = await db.admin.create({
      data: {
        email: 'admin@cafe.com',
        password: hashedPassword,
        name: 'صاحب المقهى'
      }
    });

    // إنشاء الطاولات
    for (let i = 1; i <= 10; i++) {
      await db.table.create({
        data: { number: i, seats: i % 3 === 0 ? 2 : (i % 2 === 0 ? 6 : 4) }
      });
    }

    // إنشاء الفئات
    const cats = [
      { id: 'cat-coffee', name: 'Coffee', nameAr: 'أنواع القهوة' },
      { id: 'cat-tea', name: 'Tea', nameAr: 'الشاي' },
      { id: 'cat-drinks', name: 'Cold Drinks', nameAr: 'المشروبات الباردة' },
      { id: 'cat-desserts', name: 'Desserts', nameAr: 'الحلويات' },
      { id: 'cat-snacks', name: 'Snacks', nameAr: 'السناكس' }
    ];
    
    for (const cat of cats) {
      await db.category.create({ data: cat });
    }

    // إنشاء المنتجات - أنواع القهوة المطلوبة بالضبط
    const prods = [
      // أنواع القهوة (كما طلب المستخدم)
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
      { name: 'Pévalu 2', nameAr: 'Pévalu (نسخة ثانية)', price: 0.500, categoryId: 'cat-coffee' },
      { name: 'American importé', nameAr: 'American importé', price: 3.000, categoryId: 'cat-coffee' },
      
      // الشاي
      { name: 'Black Tea', nameAr: 'شاي أسود', price: 2.000, categoryId: 'cat-tea' },
      { name: 'Green Tea', nameAr: 'شاي أخضر', price: 2.500, categoryId: 'cat-tea' },
      { name: 'Mint Tea', nameAr: 'شاي بالنعناع', price: 3.000, categoryId: 'cat-tea' },
      { name: 'Chai Latte', nameAr: 'شاي لاتيه', price: 5.000, categoryId: 'cat-tea' },
      
      // المشروبات الباردة
      { name: 'Iced Latte', nameAr: 'لاتيه مثلج', price: 5.000, categoryId: 'cat-drinks' },
      { name: 'Iced Americano', nameAr: 'أمريكانو مثلج', price: 4.000, categoryId: 'cat-drinks' },
      { name: 'Fresh Orange Juice', nameAr: 'عصير برتقال طازج', price: 4.500, categoryId: 'cat-drinks' },
      { name: 'Mango Smoothie', nameAr: 'سموذي مانجو', price: 6.000, categoryId: 'cat-drinks' },
      
      // الحلويات
      { name: 'Cheesecake', nameAr: 'تشيز كيك', price: 7.000, categoryId: 'cat-desserts' },
      { name: 'Chocolate Cake', nameAr: 'كيك شوكولاتة', price: 7.500, categoryId: 'cat-desserts' },
      { name: 'Tiramisu', nameAr: 'تيراميسو', price: 8.000, categoryId: 'cat-desserts' },
      { name: 'Brownie', nameAr: 'براوني', price: 5.000, categoryId: 'cat-desserts' },
      
      // السناكس
      { name: 'Croissant', nameAr: 'كرواسون', price: 3.500, categoryId: 'cat-snacks' },
      { name: 'Club Sandwich', nameAr: 'ساندويتش كلوب', price: 8.500, categoryId: 'cat-snacks' },
      { name: 'French Fries', nameAr: 'بطاطس مقلية', price: 4.500, categoryId: 'cat-snacks' },
    ];
    
    for (const prod of prods) {
      await db.product.create({
        data: { ...prod, available: true }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'تم إعادة ضبط قاعدة البيانات بنجاح',
      admin: { 
        email: admin.email, 
        password: 'admin123',
        hashedPassword: hashedPassword 
      }
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'خطأ في إنشاء البيانات: ' + String(error) }, { status: 500 });
  }
}
