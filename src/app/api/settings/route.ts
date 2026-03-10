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
          currency: 'د.ت',
          primaryColor: '#6F4E37',
          openingHours: '08:00',
          closingHours: '23:00',
          welcomeMessage: 'مرحباً بك في مقهانا',
          acceptOrders: true,
          taxRate: 0,
          enableTableService: true,
          enableDelivery: false
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
    const { 
      cafeName, 
      currency, 
      logo,
      primaryColor,
      openingHours,
      closingHours,
      phone,
      address,
      welcomeMessage,
      acceptOrders,
      taxRate,
      enableTableService,
      enableDelivery
    } = body;
    
    let settings = await db.settings.findFirst();
    
    if (!settings) {
      settings = await db.settings.create({
        data: {
          cafeName: cafeName || "L'EscoBar",
          currency: currency || 'د.ت',
          logo: logo || null,
          primaryColor: primaryColor || '#6F4E37',
          openingHours: openingHours || '08:00',
          closingHours: closingHours || '23:00',
          phone: phone || null,
          address: address || null,
          welcomeMessage: welcomeMessage || 'مرحباً بك في مقهانا',
          acceptOrders: acceptOrders !== undefined ? acceptOrders : true,
          taxRate: taxRate !== undefined ? taxRate : 0,
          enableTableService: enableTableService !== undefined ? enableTableService : true,
          enableDelivery: enableDelivery !== undefined ? enableDelivery : false
        }
      });
    } else {
      settings = await db.settings.update({
        where: { id: settings.id },
        data: {
          ...(cafeName !== undefined && { cafeName }),
          ...(currency !== undefined && { currency }),
          ...(logo !== undefined && { logo }),
          ...(primaryColor !== undefined && { primaryColor }),
          ...(openingHours !== undefined && { openingHours }),
          ...(closingHours !== undefined && { closingHours }),
          ...(phone !== undefined && { phone }),
          ...(address !== undefined && { address }),
          ...(welcomeMessage !== undefined && { welcomeMessage }),
          ...(acceptOrders !== undefined && { acceptOrders }),
          ...(taxRate !== undefined && { taxRate }),
          ...(enableTableService !== undefined && { enableTableService }),
          ...(enableDelivery !== undefined && { enableDelivery })
        }
      });
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'خطأ في تحديث الإعدادات' }, { status: 500 });
  }
}
