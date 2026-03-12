import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Check authentication directly
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all data
    const [
      settings,
      categories,
      products,
      tables,
      orders,
      admins
    ] = await Promise.all([
      prisma.settings.findFirst(),
      prisma.category.findMany(),
      prisma.product.findMany(),
      prisma.table.findMany(),
      prisma.order.findMany({
        include: {
          orderItems: true
        }
      }),
      prisma.admin.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true
          // Exclude password for security
        }
      })
    ]);

    const backup = {
      metadata: {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        app: "L'EscoBar Cafe Management"
      },
      data: {
        settings,
        categories,
        products,
        tables,
        orders,
        admins
      }
    };

    // Return as downloadable JSON file
    return new NextResponse(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="lescobar-backup-${new Date().toISOString().split('T')[0]}.json"`
      }
    });
  } catch (error) {
    console.error('Backup error:', error);
    return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 });
  }
}
