import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

// GET - التحقق من حالة تسجيل الدخول
export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');

    if (!session) {
      return NextResponse.json({ authenticated: false });
    }

    // التحقق من وجود جلسة صالحة
    // في نظام بسيط، نعتبر أي جلسة صالحة
    // في نظام إنتاجي، يجب التحقق من قاعدة البيانات
    
    return NextResponse.json({ authenticated: true });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ authenticated: false });
  }
}
