import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { createSessionToken, setSessionCookie } from '@/lib/auth';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  const host = req.headers.get('host') || 'localhost:3000';
  const proto = req.headers.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
  const origin = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;

  // Handle user cancellation or OAuth errors
  if (error) {
    console.warn('[GoogleOAuth] Google returned error:', error);
    if (error === 'access_denied') {
      return NextResponse.redirect(`${origin}/login?error=google_cancelled`);
    }
    return NextResponse.redirect(`${origin}/login?error=google_failed`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  // Verify and consume CSRF state cookie
  const cookieStore = cookies();
  const storedState = cookieStore.get('google_oauth_state')?.value;

  // Clear the state cookie immediately
  cookieStore.set('google_oauth_state', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  if (!storedState || storedState !== state) {
    console.error('[GoogleOAuth] CSRF state mismatch.');
    return NextResponse.redirect(`${origin}/login?error=invalid_state`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('[GoogleOAuth] Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env');
    return NextResponse.redirect(`${origin}/login?error=google_not_configured`);
  }

  try {
    // 1. Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${origin}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('[GoogleOAuth] Token exchange failed:', tokenRes.status, errText);
      return NextResponse.redirect(`${origin}/login?error=token_exchange_failed`);
    }

    const tokens = await tokenRes.json();
    if (!tokens.id_token) {
      console.error('[GoogleOAuth] No id_token returned by Google.');
      return NextResponse.redirect(`${origin}/login?error=missing_id_token`);
    }

    // 2. Validate Google ID token via official Google TokenInfo endpoint
    const verifyRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(tokens.id_token)}`
    );

    if (!verifyRes.ok) {
      const verifyErr = await verifyRes.text();
      console.error('[GoogleOAuth] Google TokenInfo rejected token:', verifyErr);
      return NextResponse.redirect(`${origin}/login?error=invalid_token`);
    }

    const claims = await verifyRes.json();

    // Security validation of critical claims
    if (claims.aud !== clientId) {
      console.error('[GoogleOAuth] Audience mismatch:', claims.aud, 'expected:', clientId);
      return NextResponse.redirect(`${origin}/login?error=invalid_audience`);
    }

    const validIssuers = ['https://accounts.google.com', 'accounts.google.com'];
    if (!validIssuers.includes(claims.iss)) {
      console.error('[GoogleOAuth] Issuer mismatch:', claims.iss);
      return NextResponse.redirect(`${origin}/login?error=invalid_issuer`);
    }

    const emailVerified = claims.email_verified === 'true' || claims.email_verified === true;
    if (!emailVerified) {
      console.error('[GoogleOAuth] Email is not verified by Google.');
      return NextResponse.redirect(`${origin}/login?error=unverified_email`);
    }

    const googleId = claims.sub as string;
    const email = (claims.email as string).toLowerCase().trim();
    const name = (claims.name as string) || (claims.given_name as string) || email.split('@')[0];
    const picture = (claims.picture as string) || null;

    // 3. User lookup, creation, and safe account linking
    let user = await prisma.user.findUnique({
      where: { googleId },
      include: { profile: true },
    });

    if (!user) {
      // Check if user already exists with this verified email
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email },
        include: { profile: true },
      });

      if (existingUserByEmail) {
        // Safely link Google identity to existing account
        user = await prisma.user.update({
          where: { id: existingUserByEmail.id },
          data: {
            googleId,
            avatarUrl: existingUserByEmail.avatarUrl || picture,
          },
          include: { profile: true },
        });
      } else {
        // Create new Google-authenticated user
        user = await prisma.user.create({
          data: {
            email,
            googleId,
            name: name.trim(),
            avatarUrl: picture,
            password: null, // Passwordless Google account
            onboarded: false,
            role: 'USER',
            currentLevel: 1,
            totalXp: 0,
            currentStreak: 0,
            longestStreak: 0,
            profile: {
              create: {
                grade: 'Class 12',
                examGoal: 'JEE Main & Advanced',
                dailyStudyGoalHours: 3.0,
                preferredFocusMinutes: 25,
                themePreference: 'light',
              },
            },
          },
          include: { profile: true },
        });

      }
    }

    // 4. Issue Studyz session cookie
    const token = await createSessionToken({ userId: user.id, email: user.email });
    await setSessionCookie(token);

    // Redirect to onboarding if not yet onboarded, else dashboard
    if (user.onboarded === false) {
      return NextResponse.redirect(`${origin}/onboarding`);
    }

    return NextResponse.redirect(`${origin}/dashboard`);
  } catch (err: unknown) {
    const e = err as Error;
    console.error('[GoogleOAuth] Unexpected error in callback:', e.message);
    return NextResponse.redirect(`${origin}/login?error=server_error`);
  }
}
