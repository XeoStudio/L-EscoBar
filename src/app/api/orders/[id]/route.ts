import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Valid status transitions - prevents skipping steps
const VALID_TRANSITIONS: Record<string, string[]> = {
  'NEW': ['ACCEPTED', 'CANCELLED'],
  'ACCEPTED': ['PREPARING', 'CANCELLED'],
  'PREPARING': ['READY', 'CANCELLED'],
  'READY': ['SERVED', 'CANCELLED'],
  'SERVED': ['PAID', 'CANCELLED'],
  'PAID': [],
  'CANCELLED': []
};

// GET - جلب طلب واحد
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await db.order.findUnique({
      where: { id },
      include: {
        table: true,
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'خطأ في جلب الطلب' }, { status: 500 });
  }
}

// PUT - تحديث حالة الطلب مع التحقق من التسلسل
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes } = body;

    // جلب الطلب الحالي
    const currentOrder = await db.order.findUnique({
      where: { id },
      select: { status: true }
    });

    if (!currentOrder) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    // التحقق من صحة الانتقال
    const currentStatus = currentOrder.status;
    const validNextStatuses = VALID_TRANSITIONS[currentStatus] || [];

    if (!validNextStatuses.includes(status)) {
      return NextResponse.json({ 
        error: `لا يمكن تغيير الحالة من "${currentStatus}" إلى "${status}". الانتقالات المسموحة: ${validNextStatuses.join(', ') || 'لا يوجد'}`,
        allowedTransitions: validNextStatuses
      }, { status: 400 });
    }

    const order = await db.order.update({
      where: { id },
      data: {
        status,
        notes
      },
      include: {
        table: true,
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'خطأ في تحديث الطلب' }, { status: 500 });
  }
}

// DELETE - حذف طلب
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // حذف عناصر الطلب أولاً
    await db.orderItem.deleteMany({
      where: { orderId: id }
    });
    
    // ثم حذف الطلب
    await db.order.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'تم حذف الطلب بنجاح' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'خطأ في حذف الطلب' }, { status: 500 });
  }
}
