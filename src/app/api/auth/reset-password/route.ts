import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = body;

    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid or missing reset token.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // Compute SHA-256 hash of the incoming token
    const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');

    // Retrieve token record from database
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { error: 'This password reset link is invalid or has already been used.' },
        { status: 400 }
      );
    }

    // Check expiration
    if (new Date() > resetRecord.expiresAt) {
      // Clean up expired token
      await prisma.passwordResetToken.delete({
        where: { id: resetRecord.id },
      }).catch(() => null);

      return NextResponse.json(
        { error: 'This password reset link has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Hash new password using bcrypt (10 rounds standard in Studyz)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Atomically update user password and remove all reset tokens for this user
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.deleteMany({
        where: { userId: resetRecord.userId },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Your password has been reset successfully. You may now sign in with your new password.',
    });
  } catch (err: unknown) {
    const e = err as Error;
    console.error('Reset password error:', e.message);
    return NextResponse.json(
      { error: 'Failed to reset password. Please try again.' },
      { status: 500 }
    );
  }
}
