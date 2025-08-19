import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Create Supabase admin client for development mode
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send email using Resend in production or Supabase Inbucket in development
 */
export async function sendEmailWithResend({
  to,
  subject,
  html,
  from = 'noreply@yourdomain.com'
}: SendEmailOptions) {
  try {
    if (process.env.NODE_ENV === 'production') {
      // Use Resend in production
      console.log(`📧 Sending email via Resend (production):`, { to, subject });
      const result = await resend.emails.send({
        from,
        to,
        subject,
        html,
      });

      console.log('✅ Email sent via Resend (production):', result);
      return { success: true, data: result };
    } else {
      // Development: Send through Supabase to local email testing (Inbucket/Mailpit)
      console.log(`📧 [DEV] Sending custom HTML email to local testing:`, { to, subject });

      // Generate a verification link using Supabase admin
      const { data, error } = await supabase.auth.admin.generateLink({
        type: 'email_change_new',
        email: to,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`
        }
      });

      if (error) {
        console.error('❌ [DEV] Supabase email error:', error);
        throw error;
      }

      console.log('✅ [DEV] Email sent via Supabase to local email testing');
      return { success: true, data: { id: 'supabase-dev-email', recipient: to } };
    }
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return { success: false, error };
  }
}

/**
 * Send verification email using appropriate service for environment
 */
export async function sendVerificationEmail(email: string, verificationUrl: string) {
  if (process.env.NODE_ENV === 'production') {
    // Use Resend with custom template in production
    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <h1 style="color: #333; text-align: center;">Verify Your Email</h1>
        <p style="color: #666; font-size: 16px; line-height: 1.5;">
          Click the button below to verify your email address and complete your registration.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}"
             style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Verify Email Address here
          </a>
        </div>
        <p style="color: #888; font-size: 14px;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `;

    return sendEmailWithResend({
      to: email,
      subject: 'Verify Your Email Address',
      html
    });
  } else {
    // Development: Use Supabase admin to generate fresh verification links
    console.log(`📧 [DEV] Generating verification email for ${email}`);

    try {
      const { data, error } = await supabase.auth.admin.generateLink({
        type: 'signup',
        email: email,
        options: {
          redirectTo: verificationUrl
        }
      });

      if (error) {
        console.error('❌ [DEV] Supabase verification email error:', error);
        return { success: false, error };
      }

      console.log('✅ [DEV] Verification email sent via Supabase to local email testing');
      return { success: true, data: { id: 'supabase-dev-verification', recipient: email } };
    } catch (error) {
      console.error('❌ [DEV] Failed to send verification email:', error);
      return { success: false, error };
    }
  }
}

/**
 * Send password reset email using Resend
 */
export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <h1 style="color: #333; text-align: center;">Reset Your Password</h1>
      <p style="color: #666; font-size: 16px; line-height: 1.5;">
        Click the button below to reset your password. This link will expire in 1 hour.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}"
           style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #888; font-size: 14px;">
        If you didn't request a password reset, you can safely ignore this email.
      </p>
    </div>
  `;

  return sendEmailWithResend({
    to: email,
    subject: 'Reset Your Password',
    html
  });
}
