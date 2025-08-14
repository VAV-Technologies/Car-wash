import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// Create admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Initialize Resend
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface EmailBypassResult {
  success: boolean;
  message?: string;
  error?: string;
  method?: string;
}

/**
 * Get the production base URL
 */
function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  return 'https://nobridge.asia'; // fallback
}

/**
 * Send verification email directly via Resend, bypassing Supabase
 */
export async function sendVerificationEmailDirect(email: string, token?: string): Promise<EmailBypassResult> {
  if (!resend) {
    return {
      success: false,
      error: 'Resend API key not configured'
    };
  }

  try {
    console.log(`[EMAIL-BYPASS] Sending verification email directly to ${email}`);

    // Generate a verification URL
    const baseUrl = getBaseUrl();
    const verificationUrl = token 
      ? `${baseUrl}/auth/callback?token=${token}&type=email&redirect_to=${encodeURIComponent('/dashboard')}`
      : `${baseUrl}/verify-email?email=${encodeURIComponent(email)}&type=register`;

    // Determine the best sender email
    const senderEmail = process.env.NODE_ENV === 'production' 
      ? 'noreply@nobridge.co'  // Use your domain in production
      : 'onboarding@resend.dev'; // Use Resend's test domain in development

    const result = await resend.emails.send({
      from: senderEmail,
      to: email,
      subject: 'Welcome to Nobridge - Verify Your Email',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Nobridge - Verify Your Email</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    line-height: 1.6;
                    color: #0D0D39;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #F4F6FC;
                }
                .container {
                    background: white;
                    padding: 40px;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(13, 13, 57, 0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                h1 {
                    color: #0D0D39;
                    margin: 0;
                    font-size: 24px;
                    font-weight: 600;
                }
                .verification-section {
                    background: #F4F6FC;
                    padding: 24px;
                    border-radius: 8px;
                    margin: 24px 0;
                    text-align: center;
                }
                .magic-link-btn {
                    display: inline-block;
                    background: #0D0D39;
                    color: white;
                    padding: 16px 32px;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                    margin: 16px 0;
                }
                .footer {
                    text-align: center;
                    margin-top: 32px;
                    padding-top: 24px;
                    border-top: 1px solid #E5E7EB;
                    color: #6B7280;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to Nobridge!</h1>
                    <p>Please verify your email address to complete your registration.</p>
                </div>

                <div class="verification-section">
                    <p><strong>Click the button below to verify your email:</strong></p>
                    <a href="${verificationUrl}" class="magic-link-btn">
                        Verify Email Address
                    </a>
                    <p style="margin-top: 16px; color: #059669; font-weight: 600;">
                        This link will expire in 24 hours for security
                    </p>
                </div>

                <div style="background: #FEF3C7; padding: 16px; border-radius: 8px; margin: 24px 0;">
                    <p><strong>What's next?</strong></p>
                    <p>After verifying your email, you'll have full access to the Nobridge platform to connect with business opportunities across Asia.</p>
                </div>

                <div class="footer">
                    <p>Welcome to the Nobridge community! We're excited to help you connect with business opportunities.</p>
                    <p><small>If you didn't create an account with Nobridge, you can safely ignore this email.</small></p>
                    <p><small>&copy; 2024 Nobridge. All rights reserved.</small></p>
                </div>
            </div>
        </body>
        </html>
      `
    });

    console.log(`[EMAIL-BYPASS] Verification email sent successfully via Resend:`, result);
    
    return {
      success: true,
      message: 'Verification email sent successfully via Resend',
      method: 'resend-bypass'
    };
  } catch (error) {
    console.error(`[EMAIL-BYPASS] Failed to send verification email:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'resend-bypass'
    };
  }
}

/**
 * Create user manually and send verification email via Resend
 */
export async function signUpWithEmailBypass(email: string, password: string, metadata: any = {}): Promise<{
  success: boolean;
  user?: any;
  error?: string;
  needsVerification?: boolean;
}> {
  try {
    console.log(`[EMAIL-BYPASS] Attempting signup bypass for ${email}`);

    // First try normal Supabase signup but with email confirmation disabled temporarily
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // We'll handle verification manually
      user_metadata: metadata
    });

    if (error) {
      console.error('[EMAIL-BYPASS] Failed to create user:', error);
      return {
        success: false,
        error: error.message
      };
    }

    console.log(`[EMAIL-BYPASS] User created successfully: ${data.user?.id}`);

    // Send verification email via Resend
    const emailResult = await sendVerificationEmailDirect(email);
    
    if (!emailResult.success) {
      console.error('[EMAIL-BYPASS] Failed to send verification email:', emailResult.error);
      // User is created but email failed - still return success but note the email issue
      return {
        success: true,
        user: data.user,
        needsVerification: true,
        error: `User created but verification email failed: ${emailResult.error}`
      };
    }

    return {
      success: true,
      user: data.user,
      needsVerification: true
    };
  } catch (error) {
    console.error('[EMAIL-BYPASS] Signup bypass failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Verify email manually (for bypass flow)
 */
export async function verifyEmailManually(email: string): Promise<EmailBypassResult> {
  try {
    console.log(`[EMAIL-BYPASS] Manually verifying email: ${email}`);

    // Find user and confirm their email
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      throw listError;
    }

    const user = users.users.find(u => u.email === email);
    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // Update user to confirm email
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      email_confirm: true
    });

    if (updateError) {
      throw updateError;
    }

    console.log(`[EMAIL-BYPASS] Email verified successfully for user: ${user.id}`);
    
    return {
      success: true,
      message: 'Email verified successfully',
      method: 'manual-verification'
    };
  } catch (error) {
    console.error('[EMAIL-BYPASS] Manual email verification failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}