import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { z } from 'zod';
import { generateVerificationToken } from '@/lib/verification-token';

// Create admin client for user lookup
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

// Input validation schema
const requestPasswordResetSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase()
});

interface RequestPasswordResetResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Get base URL for password reset links
function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}

// Password reset email template (matches your Nobridge branding)
function getPasswordResetTemplate(resetUrl: string, userEmail: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Nobridge Password</title>
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
            .reset-section {
                background: #FEF3C7;
                padding: 32px;
                border-radius: 8px;
                margin: 32px 0;
                text-align: center;
            }
            .reset-button {
                display: inline-block;
                background: #EF4444;
                color: white;
                padding: 16px 40px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin: 16px 0;
            }
            .security-notice {
                background: #FEF2F2;
                padding: 20px;
                border-radius: 8px;
                margin: 24px 0;
                border-left: 4px solid #EF4444;
            }
            .footer {
                text-align: center;
                margin-top: 32px;
                padding-top: 24px;
                border-top: 1px solid #E5E7EB;
                color: #6B7280;
                font-size: 14px;
            }
            .expires {
                color: #EF4444;
                font-weight: 600;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Reset Your Nobridge Password</h1>
                <p>We received a request to reset your password for <strong>${userEmail}</strong></p>
            </div>

            <div class="reset-section">
                <h2>Reset Your Password</h2>
                <p>Click the button below to create a new password for your account:</p>
                <a href="${resetUrl}" class="reset-button">Reset My Password</a>
                <p class="expires">⏰ This link expires in 1 hour for security</p>
            </div>

            <div class="security-notice">
                <p style="margin: 0 0 8px 0; color: #0D0D39;"><strong>🛡️ Security Notice:</strong></p>
                <ul style="margin: 0; padding-left: 20px; color: #666;">
                    <li>If you didn't request this password reset, please ignore this email</li>
                    <li>Your current password remains unchanged until you complete the reset</li>
                    <li>This link can only be used once and expires in 1 hour</li>
                    <li>Never share this link with anyone else</li>
                </ul>
            </div>

            <div style="background: #F4F6FC; padding: 16px; border-radius: 8px; margin: 24px 0;">
                <p><strong>💡 Having trouble?</strong></p>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; font-size: 12px; color: #666;">${resetUrl}</p>
            </div>

            <div class="footer">
                <p>This password reset was requested from your Nobridge account.</p>
                <p>Need help? Contact our support team if you're having trouble accessing your account.</p>
                <p>&copy; 2024 Nobridge. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

export async function POST(request: NextRequest): Promise<NextResponse<RequestPasswordResetResponse>> {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    console.log(`[PASSWORD-RESET-API-${requestId}] Starting password reset request`);
    
    if (!resend) {
      console.error(`[PASSWORD-RESET-API-${requestId}] Resend API not configured`);
      return NextResponse.json({
        success: false,
        error: 'Email service not available'
      }, { status: 500 });
    }
    
    // Parse and validate input
    const body = await request.json();
    const validatedData = requestPasswordResetSchema.parse(body);
    
    console.log(`[PASSWORD-RESET-API-${requestId}] Processing reset for: ${validatedData.email}`);
    
    // Check if user exists in our system
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error(`[PASSWORD-RESET-API-${requestId}] Error checking user existence:`, listError);
      // For security, always return success even if we can't check
      return NextResponse.json({
        success: true,
        message: 'If an account exists for this email, a password reset link has been sent.'
      });
    }
    
    const existingUser = existingUsers.users.find(u => u.email === validatedData.email);
    
    if (!existingUser) {
      console.log(`[PASSWORD-RESET-API-${requestId}] No user found for email: ${validatedData.email}`);
      // For security, always return success even if user doesn't exist
      return NextResponse.json({
        success: true,
        message: 'If an account exists for this email, a password reset link has been sent.'
      });
    }
    
    console.log(`[PASSWORD-RESET-API-${requestId}] User found, generating reset token`);
    
    // Generate secure reset token (expires in 1 hour)
    const resetToken = await generateVerificationToken(validatedData.email, 3600);
    
    // Create reset URL
    const resetUrl = `${getBaseUrl()}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(validatedData.email)}`;
    
    // Send password reset email via Resend
    console.log(`[PASSWORD-RESET-API-${requestId}] Sending reset email via Resend`);
    
    const emailResult = await resend.emails.send({
      from: process.env.NODE_ENV === 'production' ? 'noreply@nobridge.co' : 'onboarding@resend.dev',
      to: validatedData.email,
      subject: 'Reset Your Nobridge Password',
      html: getPasswordResetTemplate(resetUrl, validatedData.email)
    });
    
    if (emailResult.error) {
      console.error(`[PASSWORD-RESET-API-${requestId}] Resend email failed:`, emailResult.error);
      return NextResponse.json({
        success: false,
        error: 'Failed to send password reset email. Please try again.'
      }, { status: 500 });
    }
    
    // Log email attempt for tracking
    const { error: logError } = await supabaseAdmin
      .from('email_logs')
      .insert({
        recipient_email: validatedData.email,
        sender_email: process.env.NODE_ENV === 'production' ? 'noreply@nobridge.co' : 'onboarding@resend.dev',
        subject: 'Reset Your Nobridge Password',
        template_type: 'password_reset',
        status: 'sent',
        external_id: emailResult.data?.id,
        user_id: existingUser.id,
        metadata: {
          service: 'resend',
          resetTokenGenerated: true,
          requestId
        }
      });
    
    if (logError) {
      console.warn(`[PASSWORD-RESET-API-${requestId}] Email log warning:`, logError);
    }
    
    const duration = Date.now() - startTime;
    console.log(`[PASSWORD-RESET-API-${requestId}] Password reset email sent successfully in ${duration}ms`);
    
    return NextResponse.json({
      success: true,
      message: 'If an account exists for this email, a password reset link has been sent. Please check your inbox and spam folder.'
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[PASSWORD-RESET-API-${requestId}] Unexpected error after ${duration}ms:`, error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json({
        success: false,
        error: `Invalid email: ${firstError.message}`
      }, { status: 400 });
    }
    
    // For any other errors, return generic success message for security
    return NextResponse.json({
      success: true,
      message: 'If an account exists for this email, a password reset link has been sent.'
    });
  }
}

// Health check endpoint
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'healthy',
    service: 'password-reset-api',
    timestamp: new Date().toISOString(),
    resendConfigured: !!resend,
    environment: process.env.NODE_ENV
  });
}