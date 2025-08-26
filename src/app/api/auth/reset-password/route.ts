import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { validateVerificationToken } from '@/lib/verification-token';

// Create admin client for password updates
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

// Input validation schema
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  email: z.string().email('Invalid email address').toLowerCase(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters')
});

interface ResetPasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
  code?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<ResetPasswordResponse>> {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    console.log(`[RESET-PASSWORD-API-${requestId}] Starting password reset validation`);
    
    // Parse and validate input
    const body = await request.json();
    const validatedData = resetPasswordSchema.parse(body);
    
    console.log(`[RESET-PASSWORD-API-${requestId}] Validating reset token for: ${validatedData.email}`);
    
    // Validate the reset token
    const tokenPayload = await validateVerificationToken(validatedData.token);
    
    if (!tokenPayload) {
      console.log(`[RESET-PASSWORD-API-${requestId}] Invalid or expired token`);
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired reset link. Please request a new password reset.',
        code: 'INVALID_TOKEN'
      }, { status: 400 });
    }
    
    // Verify the email matches the token
    if (tokenPayload.email !== validatedData.email) {
      console.log(`[RESET-PASSWORD-API-${requestId}] Email mismatch in token`);
      return NextResponse.json({
        success: false,
        error: 'Invalid reset link. Please request a new password reset.',
        code: 'EMAIL_MISMATCH'
      }, { status: 400 });
    }
    
    // Find the user in Supabase auth
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error(`[RESET-PASSWORD-API-${requestId}] Error checking user existence:`, listError);
      return NextResponse.json({
        success: false,
        error: 'Unable to process password reset. Please try again.',
        code: 'USER_LOOKUP_FAILED'
      }, { status: 500 });
    }
    
    const user = existingUsers.users.find(u => u.email === validatedData.email);
    
    if (!user) {
      console.log(`[RESET-PASSWORD-API-${requestId}] User not found: ${validatedData.email}`);
      return NextResponse.json({
        success: false,
        error: 'Account not found. Please check your email or create a new account.',
        code: 'USER_NOT_FOUND'
      }, { status: 404 });
    }
    
    console.log(`[RESET-PASSWORD-API-${requestId}] Updating password for user: ${user.id}`);
    
    // Update the user's password using admin client
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        password: validatedData.newPassword
      }
    );
    
    if (updateError) {
      console.error(`[RESET-PASSWORD-API-${requestId}] Password update failed:`, updateError);
      return NextResponse.json({
        success: false,
        error: 'Failed to update password. Please try again.',
        code: 'PASSWORD_UPDATE_FAILED'
      }, { status: 500 });
    }
    
    // Log the password reset activity
    const { error: logError } = await supabaseAdmin
      .from('email_logs')
      .insert({
        recipient_email: validatedData.email,
        sender_email: 'system',
        subject: 'Password Reset Completed',
        template_type: 'password_reset_completed',
        status: 'sent',
        user_id: user.id,
        metadata: {
          action: 'password_reset_completed',
          requestId,
          timestamp: new Date().toISOString()
        }
      });
    
    if (logError) {
      console.warn(`[RESET-PASSWORD-API-${requestId}] Activity log warning:`, logError);
    }
    
    const duration = Date.now() - startTime;
    console.log(`[RESET-PASSWORD-API-${requestId}] Password reset completed successfully in ${duration}ms`);
    
    return NextResponse.json({
      success: true,
      message: 'Your password has been updated successfully. You can now sign in with your new password.',
      code: 'PASSWORD_UPDATED'
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[RESET-PASSWORD-API-${requestId}] Unexpected error after ${duration}ms:`, error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json({
        success: false,
        error: `Validation error: ${firstError.message}`,
        code: 'VALIDATION_ERROR'
      }, { status: 400 });
    }
    
    // Generic error fallback
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred. Please try again.',
      code: 'UNEXPECTED_ERROR'
    }, { status: 500 });
  }
}

// Token validation endpoint (for frontend to check token validity before showing form)
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    if (!token || !email) {
      return NextResponse.json({
        valid: false,
        error: 'Missing token or email parameter'
      }, { status: 400 });
    }
    
    // Validate the token
    const tokenPayload = await validateVerificationToken(token);
    
    if (!tokenPayload || tokenPayload.email !== email) {
      return NextResponse.json({
        valid: false,
        error: 'Invalid or expired reset link'
      });
    }
    
    return NextResponse.json({
      valid: true,
      email: tokenPayload.email
    });
    
  } catch (error) {
    console.error('[RESET-PASSWORD-VALIDATE] Token validation error:', error);
    return NextResponse.json({
      valid: false,
      error: 'Unable to validate reset link'
    }, { status: 500 });
  }
}