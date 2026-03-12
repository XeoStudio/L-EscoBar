import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// GET - Check authentication status
export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');

    if (!session) {
      return NextResponse.json({ authenticated: false });
    }

    // Validate that a session exists.
    // In this simplified flow, any session cookie is treated as valid.
    // In production, this should be verified against the database.
    
    return NextResponse.json({ authenticated: true });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ authenticated: false });
  }
}
