/**
 * Studyz Email Service
 *
 * Supports email delivery via Resend REST API (zero extra dependencies).
 * If RESEND_API_KEY is not configured, logs diagnostic info safely and returns
 * delivery status so callers know whether real email delivery occurred.
 */

export interface EmailSendResult {
  success: boolean;
  delivered: boolean;
  reason?: string;
  error?: string;
}

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
): Promise<EmailSendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.EMAIL_FROM || 'Studyz <onboarding@resend.dev>';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Studyz Password</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0E0F12; color: #E5E7EB; margin: 0; padding: 30px 15px; }
          .container { max-width: 480px; margin: 0 auto; background-color: #16171D; border: 1px solid #272932; border-radius: 20px; padding: 36px 28px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
          .logo { text-align: center; margin-bottom: 24px; }
          .brand { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #FFFFFF; margin: 0; }
          .tagline { font-size: 10px; font-weight: 800; color: #FF704E; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; }
          h2 { font-size: 18px; font-weight: 700; color: #FFFFFF; margin-top: 24px; margin-bottom: 8px; }
          p { font-size: 14px; line-height: 1.6; color: #9CA3AF; margin: 0 0 18px 0; }
          .btn-container { text-align: center; margin: 28px 0; }
          .btn { display: inline-block; background: linear-gradient(135deg, #FFA088 0%, #FF704E 100%); color: #FFFFFF !important; font-weight: 700; font-size: 14px; text-decoration: none; padding: 13px 32px; border-radius: 14px; box-shadow: 0 6px 20px rgba(255, 112, 78, 0.35); }
          .link-box { word-break: break-all; background-color: #111216; border: 1px solid #282A35; border-radius: 12px; padding: 12px; font-size: 12px; color: #FF8E72; }
          .footer { font-size: 12px; color: #6B7280; text-align: center; margin-top: 28px; border-top: 1px solid #262832; paddingTop: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <h1 class="brand">STUDYZ</h1>
            <div class="tagline">Learn. Focus. Grow.</div>
          </div>
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your Studyz account password. Click the button below to choose a new password:</p>
          <div class="btn-container">
            <a href="${resetUrl}" class="btn" target="_blank" rel="noopener noreferrer">Reset My Password</a>
          </div>
          <p style="font-size: 12px; color: #6B7280;">If the button above does not work, copy and paste this link into your browser:</p>
          <div class="link-box">${resetUrl}</div>
          <p style="font-size: 12px; color: #6B7280; margin-top: 20px;">
            This link is secure and will expire in <strong>60 minutes</strong>. If you did not request a password reset, you can safely ignore this email.
          </p>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Studyz. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  if (!apiKey) {
    console.warn(
      '[EmailService] RESEND_API_KEY is not configured. Set RESEND_API_KEY in .env for actual email delivery.'
    );
    if (process.env.NODE_ENV !== 'production') {
      console.info('[EmailService] Dev Reset Link:', resetUrl);
    }
    return {
      success: true,
      delivered: false,
      reason: 'PROVIDER_NOT_CONFIGURED',
    };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [email],
        subject: 'Reset your Studyz password',
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[EmailService] Resend API error:', res.status, errorText);
      return {
        success: false,
        delivered: false,
        error: `Resend API returned status ${res.status}`,
      };
    }

    return {
      success: true,
      delivered: true,
    };
  } catch (err: unknown) {
    const e = err as Error;
    console.error('[EmailService] Network error sending email:', e.message);
    return {
      success: false,
      delivered: false,
      error: e.message,
    };
  }
}
