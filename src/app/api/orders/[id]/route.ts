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

// GET - Fetch a single order
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
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

// PUT - Update order status with transition validation
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes } = body;

    // Fetch current order status
    const currentOrder = await db.order.findUnique({
      where: { id },
      select: { status: true }
    });

    if (!currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Validate transition
    const currentStatus = currentOrder.status;
    const validNextStatuses = VALID_TRANSITIONS[currentStatus] || [];

    if (!validNextStatuses.includes(status)) {
      return NextResponse.json({ 
        error: `Cannot change status from "${currentStatus}" to "${status}". Allowed transitions: ${validNextStatuses.join(', ') || 'none'}`,
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
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

// DELETE - Delete an order
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Then delete the order (order items cascade via relation)
    await db.order.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
