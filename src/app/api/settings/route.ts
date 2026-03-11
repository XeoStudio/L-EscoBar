import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const DEFAULT_SETTINGS = {
  cafeName: "L'EscoBar",
  currency: 'د.ت',
  primaryColor: '#6F4E37',
  openingHours: '08:00',
  closingHours: '23:00',
  welcomeMessage: 'مرحباً بك في مقهانا',
  acceptOrders: true,
  taxRate: 0,
  enableTableService: true,
  enableDelivery: false,
};

function hasDatabaseConfig() {
  return Boolean(process.env.DATABASE_URL);
}

// GET - جلب الإعدادات
export async function GET() {
  if (!hasDatabaseConfig()) {
    return NextResponse.json(DEFAULT_SETTINGS);
  }

  try {
    let settings = await db.settings.findFirst();
    
    if (!settings) {
      settings = await db.settings.create({
        data: DEFAULT_SETTINGS
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
  if (!hasDatabaseConfig()) {
    return NextResponse.json(
      { error: 'قاعدة البيانات غير مهيأة محلياً. أضف DATABASE_URL لحفظ الإعدادات.' },
      { status: 503 }
    );
  }

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
          ...DEFAULT_SETTINGS,
          cafeName: cafeName || DEFAULT_SETTINGS.cafeName,
          currency: currency || DEFAULT_SETTINGS.currency,
          logo: logo || null,
          primaryColor: primaryColor || DEFAULT_SETTINGS.primaryColor,
          openingHours: openingHours || DEFAULT_SETTINGS.openingHours,
          closingHours: closingHours || DEFAULT_SETTINGS.closingHours,
          phone: phone || null,
          address: address || null,
          welcomeMessage: welcomeMessage || DEFAULT_SETTINGS.welcomeMessage,
          acceptOrders: acceptOrders !== undefined ? acceptOrders : DEFAULT_SETTINGS.acceptOrders,
          taxRate: taxRate !== undefined ? taxRate : DEFAULT_SETTINGS.taxRate,
          enableTableService: enableTableService !== undefined ? enableTableService : DEFAULT_SETTINGS.enableTableService,
          enableDelivery: enableDelivery !== undefined ? enableDelivery : DEFAULT_SETTINGS.enableDelivery
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
