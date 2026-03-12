import { NextResponse } from 'next/server';
import { db, hasDatabaseConfig } from '@/lib/db';

// GET - Fetch all tables with occupancy status
export async function GET() {
  if (!hasDatabaseConfig()) {
    return NextResponse.json([]);
  }

  try {
    // Fetch all tables
    const tables = await db.table.findMany({
      orderBy: { number: 'asc' }
    });

    // Fetch active orders (not paid and not cancelled)
    const activeOrders = await db.order.findMany({
      where: {
        status: {
          notIn: ['PAID', 'CANCELLED']
        }
      },
      select: {
        tableId: true,
        status: true,
        orderCode: true
      }
    });

    // Build a set of occupied table ids
    const occupiedTableIds = new Set(activeOrders.map(order => order.tableId));

    // Attach occupancy status to each table
    const tablesWithStatus = tables.map(table => ({
      ...table,
      isOccupied: occupiedTableIds.has(table.id)
    }));

    return NextResponse.json(tablesWithStatus);
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 });
  }
}

// POST - Create a new table
export async function POST(request: Request) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json(
      { error: 'Database is not configured locally.' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { number, seats, description } = body;

    if (!number) {
      return NextResponse.json({ error: 'Table number is required' }, { status: 400 });
    }

    const num = parseInt(number);
    
    // Ensure table number is unique
    const existing = await db.table.findUnique({
      where: { number: num }
    });

    if (existing) {
      return NextResponse.json({ error: 'Table number already exists' }, { status: 400 });
    }

    const table = await db.table.create({
      data: {
        number: num,
        seats: seats ? parseInt(seats) : 4,
        description: description || null,
        active: true
      }
    });

    return NextResponse.json(table, { status: 201 });
  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json({ error: 'Failed to create table' }, { status: 500 });
  }
}

// DELETE - Delete a table
export async function DELETE(request: Request) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json(
      { error: 'Database is not configured locally.' },
      { status: 503 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Table id is required' }, { status: 400 });
    }

    await db.table.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Table deleted successfully' });
  } catch (error) {
    console.error('Error deleting table:', error);
    return NextResponse.json({ error: 'Failed to delete table' }, { status: 500 });
  }
}
