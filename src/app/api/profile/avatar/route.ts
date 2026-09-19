import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import prisma from '@/lib/db';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = req.headers.get('content-type') || '';

    let newAvatarUrl = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: 'Invalid file type. Please upload a JPG, PNG, WEBP, or GIF image.' },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: 'Image size exceeds the 5MB limit. Please choose a smaller image.' },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Determine extension
      let ext = 'webp';
      if (file.type === 'image/jpeg') ext = 'jpg';
      else if (file.type === 'image/png') ext = 'png';
      else if (file.type === 'image/gif') ext = 'gif';

      const fileName = `custom-${user.id}-${Date.now()}.${ext}`;

      try {
        const uploadDir = path.join(process.cwd(), 'public', 'avatars');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, buffer);
        newAvatarUrl = `/avatars/${fileName}`;
      } catch (fsErr) {
        console.warn('Filesystem write fallback to base64 data URL:', fsErr);
        newAvatarUrl = `data:${file.type};base64,${buffer.toString('base64')}`;
      }
    } else {
      // JSON body (e.g. data URL or preset path)
      const body = await req.json();
      if (!body.avatarUrl) {
        return NextResponse.json({ error: 'avatarUrl is required' }, { status: 400 });
      }
      newAvatarUrl = body.avatarUrl;
    }

    // Save to user database record
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: newAvatarUrl },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      avatarUrl: updatedUser.avatarUrl,
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { error: 'Failed to update avatar. Please try again.' },
      { status: 500 }
    );
  }
}
