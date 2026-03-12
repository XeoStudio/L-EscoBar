import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    // Check if orderCode column exists
    const columns = await db.$queryRaw`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'Order' AND column_name = 'orderCode'
    ` as { column_name: string }[];
    
    if (columns.length === 0) {
      // Run ALTER table to add orderCode column
      await db.$executeRaw`ALTER TABLE "Order" ADD COLUMN "orderCode" TEXT`;
      console.log('Column orderCode added successfully');
    }
    
    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully'
    });
  } catch (error: unknown) {
    console.error('Error running migrations:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to run migrations';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}
