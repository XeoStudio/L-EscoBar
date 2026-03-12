import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function checkAuth() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    return Boolean(session);
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    if (!(await checkAuth())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await db.admin.findFirst({
      select: { id: true, email: true, name: true }
    });

    if (!admin) {
      return NextResponse.json({ error: 'Admin account not found' }, { status: 404 });
    }

    return NextResponse.json({ admin });
  } catch (error) {
    console.error('Get admin account error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin account' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await checkAuth())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const admin = await db.admin.findFirst({
      select: { id: true }
    });

    if (!admin) {
      return NextResponse.json({ error: 'Admin account not found' }, { status: 404 });
    }

    const updateData: { email: string; password?: string } = { email };

    if (password) {
      updateData.password = await sha256(password);
    }

    const updated = await db.admin.update({
      where: { id: admin.id },
      data: updateData,
      select: { id: true, email: true, name: true }
    });

    return NextResponse.json({ admin: updated });
  } catch (error) {
    console.error('Update admin account error:', error);
    return NextResponse.json({ error: 'Failed to update admin account' }, { status: 500 });
  }
}
