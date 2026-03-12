import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// POST - Logout
export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
    
    return NextResponse.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
