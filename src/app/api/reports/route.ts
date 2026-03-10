import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - جلب التقارير الشاملة
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'today';

    const now = new Date();
    let startDate: Date | null = null;
    
    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = null;
    }

    const dateFilter = startDate ? {
      createdAt: {
        gte: startDate
      }
    } : {};

    // جلب جميع الطلبات غير الملغاة
    const orders = await db.order.findMany({
      where: {
        ...dateFilter,
        status: { notIn: ['CANCELLED'] }
      },
      include: {
        orderItems: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // الطلبات المدفوعة فقط للأرباح
    const paidOrders = orders.filter(o => o.status === 'PAID');
    
    // إجمالي الأرباح
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
    
    // عدد الطلبات
    const totalOrders = orders.length;
    
    // عدد الزبائن الفريدين (عدد الطاولات المختلفة)
    const uniqueTables = new Set(orders.map(o => o.tableNumber)).size;

    // المنتجات الأكثر مبيعاً
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name: item.productName,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.price * item.quantity;
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // إحصائيات حسب الحالة (الحالات الجديدة)
    const allOrdersForStatus = await db.order.findMany({
      where: dateFilter,
      select: { status: true }
    });

    const ordersByStatus = {
      new: allOrdersForStatus.filter(o => o.status === 'NEW').length,
      accepted: allOrdersForStatus.filter(o => o.status === 'ACCEPTED').length,
      preparing: allOrdersForStatus.filter(o => o.status === 'PREPARING').length,
      ready: allOrdersForStatus.filter(o => o.status === 'READY').length,
      served: allOrdersForStatus.filter(o => o.status === 'SERVED').length,
      paid: allOrdersForStatus.filter(o => o.status === 'PAID').length,
      cancelled: allOrdersForStatus.filter(o => o.status === 'CANCELLED').length,
    };

    // متوسط قيمة الطلب
    const averageOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

    // مبيعات كل ساعة (لليوم الحالي فقط)
    const hourlySales: Array<{ hour: number; orders: number; revenue: number }> = [];
    
    // حساب المبيعات بالساعة من الطلبات
    const hourMap = new Map<number, { orders: Set<string>; revenue: number }>();
    
    orders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      if (!hourMap.has(hour)) {
        hourMap.set(hour, { orders: new Set(), revenue: 0 });
      }
      const data = hourMap.get(hour)!;
      data.orders.add(order.id);
      if (order.status === 'PAID') {
        data.revenue += order.total;
      }
    });

    // ملء كل الساعات
    for (let h = 0; h < 24; h++) {
      const data = hourMap.get(h);
      hourlySales.push({
        hour: h,
        orders: data?.orders.size || 0,
        revenue: data?.revenue || 0
      });
    }

    // إحصائيات اليوم
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayOrders = await db.order.count({
      where: {
        createdAt: { gte: todayStart },
        status: { notIn: ['CANCELLED'] }
      }
    });

    const todayRevenue = await db.order.aggregate({
      where: {
        createdAt: { gte: todayStart },
        status: 'PAID'
      },
      _sum: {
        total: true
      }
    });

    // عدد الطلبات الجديدة (غير المعالجة)
    const pendingOrdersCount = await db.order.count({
      where: {
        status: { in: ['NEW', 'ACCEPTED', 'PREPARING', 'READY'] }
      }
    });

    return NextResponse.json({
      period,
      totalRevenue,
      totalOrders,
      uniqueCustomers: uniqueTables,
      averageOrderValue,
      topProducts,
      ordersByStatus,
      hourlySales,
      today: {
        orders: todayOrders,
        revenue: todayRevenue._sum.total || 0
      },
      pendingOrders: pendingOrdersCount
    });
  } catch (error) {
    console.error('Error generating reports:', error);
    return NextResponse.json({ error: 'خطأ في إنشاء التقارير' }, { status: 500 });
  }
}
