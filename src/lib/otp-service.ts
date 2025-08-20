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

export interface OTPVerificationResult {
  success: boolean;
  message?: string;
  error?: string;
  userVerified?: boolean;
  debug?: any;
}

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
 * Send OTP verification email directly via Resend
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
    console.log(`[OTP-SERVICE] Generating OTP for ${email} (trigger: ${trigger})`);
    
    // Generate OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    console.log(`[OTP-SERVICE] Generated OTP ${otpCode} for ${email}, expires at ${expiresAt.toISOString()}`);

    // Prepare email content
    const subject = 'Welcome to Nobridge - Your Verification Code';
    const senderEmail = process.env.NODE_ENV === 'production' 
      ? 'noreply@nobridge.co'
      : 'onboarding@resend.dev';
    const htmlTemplate = getOTPEmailTemplate(otpCode);
    
    // Determine template type based on trigger
    const templateType = trigger === 'initial_registration' ? 'otp_verification_initial' : 'otp_verification_resend';

    // Store OTP in database
    const { error: dbError } = await supabaseAdmin
      .from('email_verifications')
      .insert({
        email,
        otp_code: otpCode,
        expires_at: expiresAt.toISOString()
      });

    if (dbError) {
      console.error('[OTP-SERVICE] Failed to store OTP in database:', dbError);
      
      // Log failed email attempt
      await logEmailAttempt({
        recipientEmail: email,
        senderEmail,
        subject,
        templateType,
        status: 'failed',
        errorMessage: 'Failed to store OTP in database: ' + dbError.message,
        userId,
        metadata: { 
          otpGenerated: true, 
          dbError: dbError.message,
          trigger,
          userAgent,
          ipAddress
        }
      });

      return {
        success: false,
        error: 'Failed to store verification code'
      };
    }

    console.log(`[OTP-SERVICE] OTP stored in database for ${email}`);

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
        otpCode: process.env.NODE_ENV === 'development' ? otpCode : '[HIDDEN]',
        expiresAt: expiresAt.toISOString(),
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
        expiresAt: expiresAt.toISOString()
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
 * Verify OTP code and confirm user email
 */
export async function verifyOTP(email: string, otpCode: string): Promise<OTPVerificationResult> {
  try {
    console.log(`[OTP-SERVICE] Verifying OTP ${otpCode} for ${email}`);

    // Find the OTP record
    const { data: otpRecord, error: fetchError } = await supabaseAdmin
      .from('email_verifications')
      .select('*')
      .eq('email', email)
      .eq('otp_code', otpCode)
      .is('verified_at', null) // Not already used
      .gte('expires_at', new Date().toISOString()) // Not expired
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !otpRecord) {
      console.log(`[OTP-SERVICE] Invalid or expired OTP for ${email}: ${otpCode}`);
      return {
        success: false,
        error: 'Invalid or expired verification code. Please request a new one.'
      };
    }

    console.log(`[OTP-SERVICE] Valid OTP found for ${email}, marking as verified`);

    // Mark OTP as used
    const { error: updateError } = await supabaseAdmin
      .from('email_verifications')
      .update({ 
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', otpRecord.id);

    if (updateError) {
      console.error('[OTP-SERVICE] Failed to mark OTP as verified:', updateError);
      return {
        success: false,
        error: 'Failed to process verification'
      };
    }

    console.log(`[OTP-SERVICE] OTP marked as verified, now confirming user email in auth`);

    // Find and confirm the user's email in Supabase Auth
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('[OTP-SERVICE] Failed to list users:', listError);
      return {
        success: false,
        error: 'Failed to verify user account'
      };
    }

    const user = users.users.find(u => u.email === email);
    if (!user) {
      console.error(`[OTP-SERVICE] User not found for email: ${email}`);
      return {
        success: false,
        error: 'User account not found'
      };
    }

    // Update user to confirm email
    const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      email_confirm: true
    });

    if (confirmError) {
      console.error('[OTP-SERVICE] Failed to confirm user email:', confirmError);
      return {
        success: false,
        error: 'Failed to verify user account'
      };
    }

    console.log(`[OTP-SERVICE] User email confirmed successfully for ${email} (${user.id})`);

    return {
      success: true,
      message: 'Email verified successfully! You can now sign in.',
      userVerified: true,
      debug: {
        userId: user.id,
        verifiedAt: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('[OTP-SERVICE] Verification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown verification error'
    };
  }
}

/**
 * Clean up expired OTP codes (call periodically)
 */
export async function cleanupExpiredOTPs(): Promise<{ deleted: number }> {
  try {
    const { count, error } = await supabaseAdmin
      .from('email_verifications')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('*', { count: 'exact' });

    if (error) {
      console.error('[OTP-SERVICE] Failed to cleanup expired OTPs:', error);
      return { deleted: 0 };
    }

    console.log(`[OTP-SERVICE] Cleaned up ${count || 0} expired OTP records`);
    return { deleted: count || 0 };
  } catch (error) {
    console.error('[OTP-SERVICE] Cleanup error:', error);
    return { deleted: 0 };
  }
}