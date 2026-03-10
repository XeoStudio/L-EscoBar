import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

// دالة تشفير (SHA256)
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// POST - تسجيل الدخول
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' }, { status: 400 });
    }

    const hashedPassword = await sha256(password);

    // البحث عن المسؤول فقط - لا ننشئ حساب جديد!
    const admin = await db.admin.findUnique({
      where: { email }
    });

    // إذا لم يوجد الحساب أو كلمة المرور خاطئة
    if (!admin) {
      return NextResponse.json({ error: 'الحساب غير موجود' }, { status: 401 });
    }

    if (admin.password !== hashedPassword) {
      return NextResponse.json({ error: 'كلمة المرور غير صحيحة' }, { status: 401 });
    }

    // إنشاء جلسة
    const sessionToken = crypto.randomUUID();
    const cookieStore = await cookies();
    cookieStore.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

    return NextResponse.json({
      message: 'تم تسجيل الدخول بنجاح',
      admin: { id: admin.id, email: admin.email, name: admin.name }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'خطأ في تسجيل الدخول' }, { status: 500 });
  }
}
