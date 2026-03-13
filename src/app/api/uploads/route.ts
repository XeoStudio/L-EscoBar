import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import path from 'path';
import { promises as fs } from 'fs';

export const runtime = 'nodejs';

async function checkAuth() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    return Boolean(session);
  } catch {
    return false;
  }
}

function resolveExtension(fileName: string, mimeType: string) {
  const nameParts = fileName.split('.');
  if (nameParts.length > 1) {
    const ext = nameParts.pop();
    if (ext) return ext.toLowerCase();
  }

  if (mimeType.includes('png')) return 'png';
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'jpg';
  if (mimeType.includes('gif')) return 'gif';
  if (mimeType.includes('webp')) return 'webp';
  if (mimeType.includes('svg')) return 'svg';
  return 'png';
}

export async function POST(request: Request) {
  try {
    if (!(await checkAuth())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';

    let fileBuffer: ArrayBuffer | null = null;
    let fileType = '';
    let fileName = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');

      if (!(file instanceof File)) {
        return NextResponse.json({ error: 'File is required' }, { status: 400 });
      }

      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Only image uploads are allowed' }, { status: 400 });
      }

      fileBuffer = await file.arrayBuffer();
      fileType = file.type;
      fileName = file.name || 'upload';
    } else {
      const body = await request.json();
      const { sourceUrl } = body as { sourceUrl?: string };

      if (!sourceUrl) {
        return NextResponse.json({ error: 'Source URL is required' }, { status: 400 });
      }

      const response = await fetch(sourceUrl);
      if (!response.ok) {
        return NextResponse.json({ error: 'Failed to fetch image' }, { status: 400 });
      }

      const fetchedType = response.headers.get('content-type') || '';
      if (!fetchedType.startsWith('image/')) {
        return NextResponse.json({ error: 'Only image uploads are allowed' }, { status: 400 });
      }

      fileBuffer = await response.arrayBuffer();
      fileType = fetchedType;
      fileName = 'remote-image';
    }

    if (!fileBuffer) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const extension = resolveExtension(fileName, fileType);
    const safeName = `${crypto.randomUUID()}.${extension}`;
    const filePath = path.join(uploadsDir, safeName);

    await fs.writeFile(filePath, Buffer.from(fileBuffer));

    return NextResponse.json({ url: `/uploads/${safeName}` });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
