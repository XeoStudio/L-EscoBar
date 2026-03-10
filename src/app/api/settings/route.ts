import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - جلب الإعدادات
export async function GET() {
  try {
    let settings = await db.settings.findFirst();
    
    if (!settings) {
      settings = await db.settings.create({
        data: {
          cafeName: "L'EscoBar",
          currency: 'د.ت'
        }
      });
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'خطأ في جلب الإعدادات' }, { status: 500 });
  }
}

// PUT - تحديث الإعدادات
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { cafeName, currency } = body;
    
    let settings = await db.settings.findFirst();
    
    if (!settings) {
      settings = await db.settings.create({
        data: {
          cafeName: cafeName || "L'EscoBar",
          currency: currency || 'د.ت'
        }
      });
    } else {
      settings = await db.settings.update({
        where: { id: settings.id },
        data: {
          cafeName: cafeName || settings.cafeName,
          currency: currency || settings.currency
        }
      });
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'خطأ في تحديث الإعدادات' }, { status: 500 });
  }
}
