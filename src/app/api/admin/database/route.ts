import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// Check admin authentication directly
async function checkAuth() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    return !!session;
  } catch {
    return false;
  }
}

// GET - Get database stats
export async function GET(request: NextRequest) {
  try {
    if (!(await checkAuth())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      ordersCount,
      productsCount,
      categoriesCount,
      tablesCount,
      adminsCount,
      oldestOrder
    ] = await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.category.count(),
      prisma.table.count(),
      prisma.admin.count(),
      prisma.order.findFirst({
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true }
      })
    ]);

    return NextResponse.json({
      stats: {
        orders: ordersCount,
        products: productsCount,
        categories: categoriesCount,
        tables: tablesCount,
        admins: adminsCount,
        oldestOrder: oldestOrder?.createdAt || null
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}

// DELETE - Delete specific data or reset
export async function DELETE(request: NextRequest) {
  try {
    if (!(await checkAuth())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, options } = body;

    switch (action) {
      case 'delete-orders':
        return await deleteOrders(options);
      
      case 'delete-products':
        return await deleteProducts();
      
      case 'delete-categories':
        return await deleteCategories();
      
      case 'delete-tables':
        return await deleteTables();
      
      case 'reset-full':
        return await fullReset();
      
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Database action error:', error);
    return NextResponse.json({ error: 'Failed to execute action' }, { status: 500 });
  }
}

// Delete orders with options
async function deleteOrders(options?: { keepDays?: number; status?: string }) {
  try {
    let whereClause: any = {};
    
    if (options?.keepDays) {
      // Delete orders older than X days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - options.keepDays);
      whereClause.createdAt = { lt: cutoffDate };
    }
    
    if (options?.status) {
      // Delete orders with specific status
      whereClause.status = options.status;
    }

    // First delete order items (due to foreign key constraints)
    const orders = await prisma.order.findMany({
      where: whereClause,
      select: { id: true }
    });

    const orderIds = orders.map(o => o.id);

    if (orderIds.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No orders to delete',
        deletedCount: 0 
      });
    }

    // Delete order items first
    await prisma.orderItem.deleteMany({
      where: { orderId: { in: orderIds } }
    });

    // Then delete orders
    const result = await prisma.order.deleteMany({
      where: { id: { in: orderIds } }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Successfully deleted ${result.count} orders`,
      deletedCount: result.count 
    });
  } catch (error) {
    console.error('Delete orders error:', error);
    return NextResponse.json({ error: 'Failed to delete orders' }, { status: 500 });
  }
}

// Delete all products
async function deleteProducts() {
  try {
    // First delete order items that reference products
    await prisma.orderItem.deleteMany({});
    
    const result = await prisma.product.deleteMany({});
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully deleted ${result.count} products`,
      deletedCount: result.count 
    });
  } catch (error) {
    console.error('Delete products error:', error);
    return NextResponse.json({ error: 'Failed to delete products' }, { status: 500 });
  }
}

// Delete all categories
async function deleteCategories() {
  try {
    // First delete products in categories
    await prisma.orderItem.deleteMany({});
    await prisma.product.deleteMany({});
    
    const result = await prisma.category.deleteMany({});
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully deleted ${result.count} categories`,
      deletedCount: result.count 
    });
  } catch (error) {
    console.error('Delete categories error:', error);
    return NextResponse.json({ error: 'Failed to delete categories' }, { status: 500 });
  }
}

// Delete all tables
async function deleteTables() {
  try {
    // First delete orders for tables
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    
    const result = await prisma.table.deleteMany({});
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully deleted ${result.count} tables`,
      deletedCount: result.count 
    });
  } catch (error) {
    console.error('Delete tables error:', error);
    return NextResponse.json({ error: 'Failed to delete tables' }, { status: 500 });
  }
}

// Full database reset (except admin account)
async function fullReset() {
  try {
    // Delete in correct order due to foreign key constraints
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.table.deleteMany({});
    
    // Reset settings to default
    await prisma.settings.deleteMany({});
    await prisma.settings.create({
      data: {
        cafeName: "L'EscoBar",
        currency: 'TND'
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Database reset completed successfully. All data was removed except the admin account.' 
    });
  } catch (error) {
    console.error('Full reset error:', error);
    return NextResponse.json({ error: 'Failed to reset database' }, { status: 500 });
  }
}
