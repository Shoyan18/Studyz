import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import prisma from './db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'studyz-default-secret-key-stage1-2026'
);

const TOKEN_COOKIE_NAME = 'studyz_token';

export interface UserSessionPayload {
  userId: string;
  email: string;
}

export async function createSessionToken(payload: UserSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<UserSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<UserSessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function getAuthenticatedUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      profile: true,
    },
  });

  return user;
}

export function isUserAdmin(user: { role?: string; email?: string } | null | undefined): boolean {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  if (user.email === 'shoyan@studyz.app' || user.email === 'admin@studyz.app') return true;
  return false;
}

export async function getAuthenticatedAdmin() {
  const user = await getAuthenticatedUser();
  if (!user) return null;
  if (!isUserAdmin(user)) return null;
  return user;
}

export async function setSessionCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
}

export async function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.set(TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}
