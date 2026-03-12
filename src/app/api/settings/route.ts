import { NextResponse } from 'next/server';
import { db, hasDatabaseConfig } from '@/lib/db';

const DEFAULT_SETTINGS = {
  cafeName: "L'EscoBar",
  currency: 'د.ت',
  primaryColor: '#6F4E37',
  accentColor: '#D4A574',
  backgroundColor: '#FDF8F3',
  surfaceColor: '#FFFFFF',
  textPrimaryColor: '#3D2314',
  openingHours: '08:00',
  closingHours: '23:00',
  welcomeMessage: 'مرحباً بك في مقهانا',
  acceptOrders: true,
  enableTableService: true,
  enableDelivery: false,
};

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
      accentColor,
      backgroundColor,
      surfaceColor,
      textPrimaryColor,
      openingHours,
      closingHours,
      phone,
      address,
      welcomeMessage,
      acceptOrders,
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
          accentColor: accentColor || DEFAULT_SETTINGS.accentColor,
          backgroundColor: backgroundColor || DEFAULT_SETTINGS.backgroundColor,
          surfaceColor: surfaceColor || DEFAULT_SETTINGS.surfaceColor,
          textPrimaryColor: textPrimaryColor || DEFAULT_SETTINGS.textPrimaryColor,
          openingHours: openingHours || DEFAULT_SETTINGS.openingHours,
          closingHours: closingHours || DEFAULT_SETTINGS.closingHours,
          phone: phone || null,
          address: address || null,
          welcomeMessage: welcomeMessage || DEFAULT_SETTINGS.welcomeMessage,
          acceptOrders: acceptOrders !== undefined ? acceptOrders : DEFAULT_SETTINGS.acceptOrders,
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
          ...(accentColor !== undefined && { accentColor }),
          ...(backgroundColor !== undefined && { backgroundColor }),
          ...(surfaceColor !== undefined && { surfaceColor }),
          ...(textPrimaryColor !== undefined && { textPrimaryColor }),
          ...(openingHours !== undefined && { openingHours }),
          ...(closingHours !== undefined && { closingHours }),
          ...(phone !== undefined && { phone }),
          ...(address !== undefined && { address }),
          ...(welcomeMessage !== undefined && { welcomeMessage }),
          ...(acceptOrders !== undefined && { acceptOrders }),
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
