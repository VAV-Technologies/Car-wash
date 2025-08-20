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
 * Send verification email directly via Resend with custom OTP
 * This completely bypasses Supabase's email system
 */
export async function sendVerificationEmailDirect(
  email: string,
  options: {
    trigger?: 'initial_registration' | 'manual_resend' | 'auto_retry' | 'admin_resend';
    userId?: string;
    userAgent?: string;
    ipAddress?: string;
  } = {}
): Promise<EmailBypassResult> {
  try {
    console.log(`[EMAIL-BYPASS] Sending OTP verification email directly to ${email}`);

    // Import OTP service
    const { sendOTPEmail } = await import('./otp-service');
    
    // Send OTP email via our custom service with context
    const result = await sendOTPEmail(email, {
      trigger: options.trigger || 'initial_registration',
      userId: options.userId,
      userAgent: options.userAgent,
      ipAddress: options.ipAddress
    });
    
    if (!result.success) {
      console.error(`[EMAIL-BYPASS] Failed to send OTP email:`, result.error);
      return {
        success: false,
        error: result.error || 'Failed to send verification email'
      };
    }

    console.log(`[EMAIL-BYPASS] OTP email sent successfully via Resend to ${email}`);
    
    return {
      success: true,
      message: 'Verification code sent to your email. Please check your inbox.',
      method: 'resend-direct-otp'
    };

  } catch (error) {
    console.error(`[EMAIL-BYPASS] Failed to send verification email:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending verification email',
      method: 'resend-direct-otp'
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