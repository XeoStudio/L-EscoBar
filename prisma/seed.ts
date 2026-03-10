import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function main() {
  // حذف جميع البيانات القديمة (بالترتيب الصحيح للعلاقات)
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.table.deleteMany({});
  await prisma.admin.deleteMany({});
  await prisma.settings.deleteMany({});

  // إنشاء الإعدادات
  await prisma.settings.create({
    data: {
      id: 'settings-1',
      cafeName: "L'EscoBar",
      currency: 'د.ت'
    }
  });
  console.log('✅ Settings created');

  // إنشاء حساب المسؤول
  const hashedPassword = await sha256('admin123');
  await prisma.admin.create({
    data: {
      email: 'admin@cafe.com',
      password: hashedPassword,
      name: 'صاحب المقهى'
    }
  });
  console.log('✅ Admin created (admin@cafe.com / admin123)');

  // إنشاء الطاولات
  for (let i = 1; i <= 10; i++) {
    await prisma.table.create({
      data: { number: i, seats: i % 3 === 0 ? 2 : (i % 2 === 0 ? 6 : 4) }
    });
  }
  console.log('✅ 10 Tables created');

  // إنشاء الفئات مع الصور
  const cats = [
    { id: 'cat-coffee', name: 'Coffee', nameAr: 'أنواع القهوة', image: '/download/category-coffee.png' },
    { id: 'cat-tea', name: 'Tea', nameAr: 'الشاي', image: '/download/category-tea.png' },
    { id: 'cat-drinks', name: 'Cold Drinks', nameAr: 'المشروبات الباردة', image: '/download/category-drinks.png' },
    { id: 'cat-desserts', name: 'Desserts', nameAr: 'الحلويات', image: '/download/category-desserts.png' },
    { id: 'cat-snacks', name: 'Snacks', nameAr: 'السناكس', image: '/download/category-snacks.png' }
  ];
  
  for (const cat of cats) {
    await prisma.category.create({ data: cat });
  }
  console.log('✅ 5 Categories created');

  // إنشاء المنتجات مع صور الفئات
  const prods = [
    // أنواع القهوة
    { name: 'Café Lavazza', nameAr: 'Café Lavazza', price: 6.5, categoryId: 'cat-coffee', image: '/download/category-coffee.png' },
    { name: 'Café Nespresso', nameAr: 'Café Nespresso', price: 6.5, categoryId: 'cat-coffee', image: '/download/category-coffee.png' },
    { name: 'Café Saquella', nameAr: 'Café Saquella', price: 6.5, categoryId: 'cat-coffee', image: '/download/category-coffee.png' },
    { name: 'Café Express Américain', nameAr: 'Café Express Américain', price: 3.8, categoryId: 'cat-coffee', image: '/download/category-coffee.png' },
    { name: 'Café Express', nameAr: 'Café Express', price: 3.4, categoryId: 'cat-coffee', image: '/download/category-coffee.png' },
    { name: 'Café Cappucin', nameAr: 'Café Cappucin', price: 3.6, categoryId: 'cat-coffee', image: '/download/category-coffee.png' },
    { name: 'Café Crème', nameAr: 'Café Crème', price: 3.8, categoryId: 'cat-coffee', image: '/download/category-coffee.png' },
    { name: 'Café Escobar', nameAr: 'Café Escobar', price: 6.5, categoryId: 'cat-coffee', image: '/download/category-coffee.png' },
    { name: 'Café Cappuccino', nameAr: 'Café Cappuccino', price: 6.5, categoryId: 'cat-coffee', image: '/download/category-coffee.png' },
    { name: 'Café Macchiato', nameAr: 'Café Macchiato', price: 3.4, categoryId: 'cat-coffee', image: '/download/category-coffee.png' },
    { name: 'Café Turc', nameAr: 'Café Turc', price: 5.5, categoryId: 'cat-coffee', image: '/download/category-coffee.png' },
    { name: 'Café Biscup', nameAr: 'Café Biscup', price: 3.5, categoryId: 'cat-coffee', image: '/download/category-coffee.png' },
    { name: 'Pévalu', nameAr: 'Pévalu', price: 1.0, categoryId: 'cat-coffee', image: '/download/category-coffee.png' },
    { name: 'Expresse importé', nameAr: 'Expresse importé', price: 2.5, categoryId: 'cat-coffee', image: '/download/category-coffee.png' },
    { name: 'Cappucin importé', nameAr: 'Cappucin importé', price: 2.8, categoryId: 'cat-coffee', image: '/download/category-coffee.png' },
    { name: 'Café crème importé', nameAr: 'Café crème importé', price: 3.0, categoryId: 'cat-coffee', image: '/download/category-coffee.png' },
    { name: 'Pévalu 2', nameAr: 'Pévalu (نسخة ثانية)', price: 0.5, categoryId: 'cat-coffee', image: '/download/category-coffee.png' },
    { name: 'American importé', nameAr: 'American importé', price: 3.0, categoryId: 'cat-coffee', image: '/download/category-coffee.png' },
    // الشاي
    { name: 'Black Tea', nameAr: 'شاي أسود', price: 2.0, categoryId: 'cat-tea', image: '/download/category-tea.png' },
    { name: 'Green Tea', nameAr: 'شاي أخضر', price: 2.5, categoryId: 'cat-tea', image: '/download/category-tea.png' },
    { name: 'Mint Tea', nameAr: 'شاي بالنعناع', price: 3.0, categoryId: 'cat-tea', image: '/download/category-tea.png' },
    { name: 'Chai Latte', nameAr: 'شاي لاتيه', price: 5.0, categoryId: 'cat-tea', image: '/download/category-tea.png' },
    // المشروبات الباردة
    { name: 'Iced Latte', nameAr: 'لاتيه مثلج', price: 5.0, categoryId: 'cat-drinks', image: '/download/category-drinks.png' },
    { name: 'Iced Americano', nameAr: 'أمريكانو مثلج', price: 4.0, categoryId: 'cat-drinks', image: '/download/category-drinks.png' },
    { name: 'Fresh Orange Juice', nameAr: 'عصير برتقال طازج', price: 4.5, categoryId: 'cat-drinks', image: '/download/category-drinks.png' },
    { name: 'Mango Smoothie', nameAr: 'سموذي مانجو', price: 6.0, categoryId: 'cat-drinks', image: '/download/category-drinks.png' },
    // الحلويات
    { name: 'Cheesecake', nameAr: 'تشيز كيك', price: 7.0, categoryId: 'cat-desserts', image: '/download/category-desserts.png' },
    { name: 'Chocolate Cake', nameAr: 'كيك شوكولاتة', price: 7.5, categoryId: 'cat-desserts', image: '/download/category-desserts.png' },
    { name: 'Tiramisu', nameAr: 'تيراميسو', price: 8.0, categoryId: 'cat-desserts', image: '/download/category-desserts.png' },
    { name: 'Brownie', nameAr: 'براوني', price: 5.0, categoryId: 'cat-desserts', image: '/download/category-desserts.png' },
    // السناكس
    { name: 'Croissant', nameAr: 'كرواسون', price: 3.5, categoryId: 'cat-snacks', image: '/download/category-snacks.png' },
    { name: 'Club Sandwich', nameAr: 'ساندويتش كلوب', price: 8.5, categoryId: 'cat-snacks', image: '/download/category-snacks.png' },
    { name: 'French Fries', nameAr: 'بطاطس مقلية', price: 4.5, categoryId: 'cat-snacks', image: '/download/category-snacks.png' },
  ];
  
  for (const prod of prods) {
    await prisma.product.create({
      data: { ...prod, available: true }
    });
  }
  console.log('✅ 33 Products created');

  console.log('\n🎉 Seed completed successfully!');
  console.log('📧 Admin login: admin@cafe.com');
  console.log('🔑 Password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
