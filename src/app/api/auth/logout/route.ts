import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// POST - تسجيل الخروج
export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
    
    return NextResponse.json({ message: 'تم تسجيل الخروج بنجاح' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'خطأ في تسجيل الخروج' }, { status: 500 });
  }
}
