import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

// SHA-256 hash helper
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// POST - Login
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const hashedPassword = await sha256(password);

    // Admin-only login. Do not create accounts here.
    const admin = await db.admin.findUnique({
      where: { email }
    });

    // Validate account and password
    if (!admin) {
      return NextResponse.json({ error: 'Account not found' }, { status: 401 });
    }

    if (admin.password !== hashedPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Create session cookie
    const sessionToken = crypto.randomUUID();
    const cookieStore = await cookies();
    cookieStore.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

    return NextResponse.json({
      message: 'Login successful',
      admin: { id: admin.id, email: admin.email, name: admin.name }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
