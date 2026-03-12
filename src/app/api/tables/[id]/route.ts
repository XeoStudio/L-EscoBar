import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch a single table
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const table = await db.table.findUnique({
      where: { id },
      include: { orders: true }
    });
    
    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }
    
    return NextResponse.json(table);
  } catch (error) {
    console.error('Error fetching table:', error);
    return NextResponse.json({ error: 'Failed to fetch table' }, { status: 500 });
  }
}

// PUT - Update a table
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { number, seats, description, active } = body;

    const table = await db.table.update({
      where: { id },
      data: {
        number: number !== undefined ? parseInt(number) : undefined,
        seats: seats !== undefined ? parseInt(seats) : undefined,
        description,
        active
      }
    });

    return NextResponse.json(table);
  } catch (error) {
    console.error('Error updating table:', error);
    return NextResponse.json({ error: 'Failed to update table' }, { status: 500 });
  }
}

// DELETE - Delete a table
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await db.table.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Table deleted successfully' });
  } catch (error) {
    console.error('Error deleting table:', error);
    return NextResponse.json({ error: 'Failed to delete table' }, { status: 500 });
  }
}
