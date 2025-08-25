import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import crypto from 'crypto';

// Create admin client for OTP operations
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

export interface OTPResult {
  success: boolean;
  message?: string;
  error?: string;
  otpCode?: string; // Only for development/testing
  debug?: any;
}

// OTP verification is now handled directly by Supabase's built-in system

/**
 * Log email attempt to database for tracking and debugging
 */
async function logEmailAttempt(data: {
  recipientEmail: string;
  senderEmail?: string;
  subject: string;
  templateType: string;
  htmlContent?: string;
  status: 'pending' | 'sent' | 'failed';
  externalId?: string;
  errorMessage?: string;
  userId?: string;
  metadata?: any;
}): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('email_logs')
      .insert({
        recipient_email: data.recipientEmail,
        sender_email: data.senderEmail,
        subject: data.subject,
        template_type: data.templateType,
        html_content: data.htmlContent,
        status: data.status,
        external_id: data.externalId,
        error_message: data.errorMessage,
        user_id: data.userId,
        metadata: data.metadata || {},
        sent_at: data.status === 'sent' ? new Date().toISOString() : null
      });

    if (error) {
      console.error('[OTP-SERVICE] Failed to log email attempt:', error);
    } else {
      console.log(`[OTP-SERVICE] Email attempt logged for ${data.recipientEmail}`);
    }
  } catch (error) {
    console.error('[OTP-SERVICE] Error logging email attempt:', error);
  }
}

/**
 * Generate a secure 6-digit OTP code
 */
export function generateOTP(): string {
  // Generate cryptographically secure random 6-digit number
  const buffer = crypto.randomBytes(4);
  const num = buffer.readUInt32BE(0);
  const otp = (num % 900000) + 100000; // Ensures 6 digits (100000-999999)
  return otp.toString();
}

/**
 * Get base URL for email redirects
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
  return 'http://localhost:3000';
}

/**
 * Clean HTML template for OTP email
 */
function getOTPEmailTemplate(otpCode: string): string {
  return `
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
            .otp-section {
                background: #F4F6FC;
                padding: 32px;
                border-radius: 8px;
                margin: 24px 0;
                text-align: center;
            }
            .otp-code {
                font-size: 48px;
                font-weight: bold;
                letter-spacing: 12px;
                color: #0D0D39;
                background: #FFFFFF;
                padding: 24px;
                border-radius: 12px;
                display: inline-block;
                margin: 16px 0;
                border: 2px solid #E5E7EB;
                font-family: 'Courier New', monospace;
            }
            .footer {
                text-align: center;
                margin-top: 32px;
                padding-top: 24px;
                border-top: 1px solid #E5E7EB;
                color: #6B7280;
                font-size: 14px;
            }
            .warning {
                background: #FEF3C7;
                padding: 16px;
                border-radius: 8px;
                margin: 24px 0;
                border-left: 4px solid #F59E0B;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to Nobridge!</h1>
                <p>Please verify your email address to complete your registration.</p>
            </div>

            <div class="otp-section">
                <h2 style="color: #0D0D39; margin: 0 0 16px 0;">Your Verification Code</h2>
                <p>Enter this 6-digit code to verify your email:</p>
                <div class="otp-code">${otpCode}</div>
                <p style="color: #6B7280; font-size: 14px;">This code expires in 1 hour</p>
            </div>

            <div class="warning">
                <p style="margin: 0; color: #92400E;"><strong>Security Note:</strong> Never share this code with anyone. Nobridge will never ask for your verification code via phone or email.</p>
            </div>

            <div style="background: #F0F9FF; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #3B82F6;">
                <p style="margin: 0 0 8px 0; color: #0D0D39;"><strong>What's next?</strong></p>
                <p style="margin: 0; color: #374151;">After verification, you'll have full access to browse and connect with business opportunities across Asia.</p>
            </div>

            <div class="footer">
                <p>Welcome to the Nobridge community!</p>
                <p><small>If you didn't create an account with Nobridge, you can safely ignore this email.</small></p>
                <p><small>&copy; 2024 Nobridge. All rights reserved.</small></p>
            </div>
        </div>
    </body>
    </html>
  `;
}

/**
 * Send OTP verification email using Supabase OTP generation + Resend delivery
 */
export async function sendOTPEmail(
  email: string, 
  options: {
    trigger?: 'initial_registration' | 'manual_resend' | 'auto_retry' | 'admin_resend';
    userId?: string;
    userAgent?: string;
    ipAddress?: string;
  } = {}
): Promise<OTPResult> {
  if (!resend) {
    return {
      success: false,
      error: 'Resend API key not configured'
    };
  }

  try {
    const { trigger = 'manual_resend', userId, userAgent, ipAddress } = options;
    console.log(`[OTP-SERVICE] Generating Supabase OTP for ${email} (trigger: ${trigger})`);
    
    // Hybrid Approach: Generate both custom OTP and Supabase TokenHash
    console.log(`[OTP-SERVICE] Generating hybrid OTP system for ${email}`);
    
    // Step 1: Generate custom 6-digit OTP
    const customOtp = generateOTP();
    console.log(`[OTP-SERVICE] Generated custom OTP for ${email}`);
    
    // Step 2: Generate Supabase TokenHash via magiclink
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${getBaseUrl()}/verify-otp?email=${encodeURIComponent(email)}`
      }
    });

    if (linkError || !linkData?.properties?.hashed_token) {
      console.error('[OTP-SERVICE] Failed to generate Supabase TokenHash:', linkError);
      
      // Log failed email attempt
      const subject = 'Welcome to Nobridge - Your Verification Code';
      const senderEmail = process.env.NODE_ENV === 'production' 
        ? 'noreply@nobridge.co'
        : 'onboarding@resend.dev';
      const templateType = trigger === 'initial_registration' ? 'otp_verification_initial' : 'otp_verification_resend';
      
      await logEmailAttempt({
        recipientEmail: email,
        senderEmail,
        subject,
        templateType,
        status: 'failed',
        errorMessage: 'Failed to generate Supabase TokenHash: ' + (linkError?.message || 'No hashed_token in response'),
        userId,
        metadata: { 
          otpGenerated: false, 
          supabaseError: linkError?.message || 'No hashed_token in response',
          trigger,
          userAgent,
          ipAddress
        }
      });

      return {
        success: false,
        error: 'Failed to generate verification code'
      };
    }

    const tokenHash = linkData.properties.hashed_token;
    console.log(`[OTP-SERVICE] Generated Supabase TokenHash for ${email}`);
    
    // Step 3: Store OTP → TokenHash mapping in database
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    
    const { error: mappingError } = await supabaseAdmin
      .from('otp_token_mappings')
      .insert({
        email: email,
        custom_otp: customOtp,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString()
      });

    if (mappingError) {
      console.error('[OTP-SERVICE] Failed to store OTP mapping:', mappingError);
      
      // Log failed email attempt
      const subject = 'Welcome to Nobridge - Your Verification Code';
      const senderEmail = process.env.NODE_ENV === 'production' 
        ? 'noreply@nobridge.co'
        : 'onboarding@resend.dev';
      const templateType = trigger === 'initial_registration' ? 'otp_verification_initial' : 'otp_verification_resend';
      
      await logEmailAttempt({
        recipientEmail: email,
        senderEmail,
        subject,
        templateType,
        status: 'failed',
        errorMessage: 'Failed to store OTP mapping: ' + mappingError.message,
        userId,
        metadata: { 
          otpGenerated: true,
          mappingError: mappingError.message,
          trigger,
          userAgent,
          ipAddress
        }
      });

      return {
        success: false,
        error: 'Failed to generate verification code'
      };
    }

    console.log(`[OTP-SERVICE] Stored OTP mapping successfully for ${email}`);
    
    // Use custom OTP for email (user sees the 6-digit code)
    const otpCode = customOtp;
    console.log(`[OTP-SERVICE] Generated Supabase OTP ${otpCode} for ${email}`);

    // Prepare email content
    const subject = 'Welcome to Nobridge - Your Verification Code';
    const senderEmail = process.env.NODE_ENV === 'production' 
      ? 'noreply@nobridge.co'
      : 'onboarding@resend.dev';
    const htmlTemplate = getOTPEmailTemplate(otpCode);
    
    // Determine template type based on trigger
    const templateType = trigger === 'initial_registration' ? 'otp_verification_initial' : 'otp_verification_resend';

    // Send email via Resend
    const result = await resend.emails.send({
      from: senderEmail,
      to: email,
      subject,
      html: htmlTemplate
    });

    console.log(`[OTP-SERVICE] Email sent successfully via Resend to ${email}:`, result);

    // Log successful email attempt
    await logEmailAttempt({
      recipientEmail: email,
      senderEmail,
      subject,
      templateType,
      htmlContent: htmlTemplate,
      status: 'sent',
      externalId: result.data?.id || undefined,
      userId,
      metadata: {
        customOtp: process.env.NODE_ENV === 'development' ? otpCode : '[HIDDEN]',
        hybridSystem: true,
        tokenHashGenerated: true,
        mappingStored: true,
        resendResponse: result,
        trigger,
        userAgent,
        ipAddress
      }
    });

    return {
      success: true,
      message: 'Verification code sent successfully',
      otpCode: process.env.NODE_ENV === 'development' ? otpCode : undefined, // Only show in dev
      debug: {
        emailId: result.data?.id,
        hybridSystem: true,
        customOtpGenerated: true,
        tokenHashGenerated: true,
        mappingStored: true
      }
    };

  } catch (error) {
    console.error('[OTP-SERVICE] Failed to send OTP email:', error);

    // Log failed email attempt
    const { trigger = 'manual_resend', userId, userAgent, ipAddress } = options;
    const subject = 'Welcome to Nobridge - Your Verification Code';
    const senderEmail = process.env.NODE_ENV === 'production' 
      ? 'noreply@nobridge.co'
      : 'onboarding@resend.dev';
    const templateType = trigger === 'initial_registration' ? 'otp_verification_initial' : 'otp_verification_resend';
      
    await logEmailAttempt({
      recipientEmail: email,
      senderEmail,
      subject,
      templateType,
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Unknown error sending verification code',
      userId,
      metadata: { 
        errorType: 'send_failure', 
        originalError: String(error),
        trigger,
        userAgent,
        ipAddress
      }
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending verification code'
    };
  }
}

/**
 * Verify OTP code by looking up the mapping and using Supabase's verification
 */
export async function verifyOTP(email: string, otpCode: string): Promise<OTPResult> {
  try {
    console.log(`[OTP-SERVICE] Verifying OTP for ${email}`);
    
    // Step 1: Look up the OTP mapping
    const { data: mapping, error: lookupError } = await supabaseAdmin
      .from('otp_token_mappings')
      .select('token_hash, expires_at, used_at')
      .eq('email', email)
      .eq('custom_otp', otpCode)
      .single();

    if (lookupError || !mapping) {
      console.error('[OTP-SERVICE] OTP mapping not found:', lookupError);
      return {
        success: false,
        error: 'Invalid or expired verification code'
      };
    }

    // Check if already used
    if (mapping.used_at) {
      console.log('[OTP-SERVICE] OTP already used');
      return {
        success: false,
        error: 'This verification code has already been used'
      };
    }

    // Check if expired
    if (new Date(mapping.expires_at) < new Date()) {
      console.log('[OTP-SERVICE] OTP expired');
      return {
        success: false,
        error: 'Verification code has expired. Please request a new one.'
      };
    }

    // Step 2: Use the token hash to verify with Supabase
    const { data: verifyData, error: verifyError } = await supabaseAdmin.auth.verifyOtp({
      token_hash: mapping.token_hash,
      type: 'magiclink' // We use magiclink type for the token hash
    });

    if (verifyError) {
      console.error('[OTP-SERVICE] Supabase verification failed:', verifyError);
      return {
        success: false,
        error: 'Failed to verify code. Please try again.'
      };
    }

    // Step 3: Mark OTP as used
    await supabaseAdmin
      .from('otp_token_mappings')
      .update({ used_at: new Date().toISOString() })
      .eq('email', email)
      .eq('custom_otp', otpCode);

    console.log(`[OTP-SERVICE] Successfully verified OTP for ${email}`);
    
    return {
      success: true,
      message: 'Email verified successfully'
    };

  } catch (error) {
    console.error('[OTP-SERVICE] Unexpected error during OTP verification:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during verification'
    };
  }
}

/**
 * Note: OTP verification is now handled by Supabase's built-in verification system.
 * When users enter the OTP code, they should use Supabase's verify OTP endpoint directly:
 * - supabase.auth.verifyOtp({ email, token, type: 'email' })
 * This eliminates the need for custom verification logic and table.
 */