import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  // Determine base application origin
  const host = req.headers.get('host') || 'localhost:3000';
  const proto = req.headers.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
  const origin = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;

  if (!clientId) {
    console.warn(
      '[GoogleOAuth] GOOGLE_CLIENT_ID is not configured in environment variables. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable Google Sign-In.'
    );
    return NextResponse.redirect(`${origin}/login?error=google_not_configured`);
  }

  const redirectUri = `${origin}/api/auth/google/callback`;

  // Generate cryptographically secure CSRF state token
  const state = crypto.randomBytes(32).toString('hex');

  // Set CSRF state cookie (10 minutes expiry, httpOnly, sameSite=lax)
  const cookieStore = cookies();
  cookieStore.set('google_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  });

  // Build official Google OAuth 2.0 authorization URL
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('state', state);
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('prompt', 'select_account'); // Official account picker

  return NextResponse.redirect(googleAuthUrl.toString());
}
