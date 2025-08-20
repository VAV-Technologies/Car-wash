import { NextRequest, NextResponse } from 'next/server';
import { sendOTPEmail } from '@/lib/otp-service';
import { z } from 'zod';

// Input validation schema
const resendOTPSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase()
});

interface ResendOTPResponse {
  success: boolean;
  message?: string;
  error?: string;
  code?: string;
  rateLimited?: boolean;
}

export async function POST(request: NextRequest): Promise<NextResponse<ResendOTPResponse>> {
  const startTime = Date.now();
  let requestId = Math.random().toString(36).substring(7);
  
  try {
    console.log(`[RESEND-OTP-API-${requestId}] Starting OTP resend request`);
    
    // Parse and validate input
    const body = await request.json();
    const validatedData = resendOTPSchema.parse(body);
    
    console.log(`[RESEND-OTP-API-${requestId}] Resending OTP for email: ${validatedData.email}`);
    
    // Send OTP email using our service
    const result = await sendOTPEmail(validatedData.email);
    
    if (!result.success) {
      console.error(`[RESEND-OTP-API-${requestId}] OTP resend failed: ${result.error}`);
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to resend verification code',
        code: 'RESEND_FAILED'
      }, { status: 500 });
    }
    
    const duration = Date.now() - startTime;
    console.log(`[RESEND-OTP-API-${requestId}] OTP resent successfully in ${duration}ms`);
    
    return NextResponse.json({
      success: true,
      message: 'A new verification code has been sent to your email. Please check your inbox.',
      code: 'OTP_RESENT'
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[RESEND-OTP-API-${requestId}] Unexpected error after ${duration}ms:`, error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json({
        success: false,
        error: firstError.message,
        code: 'VALIDATION_ERROR'
      }, { status: 400 });
    }
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request format',
        code: 'INVALID_JSON'
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

// Health check endpoint
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'healthy',
    service: 'otp-resend-api',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasResendKey: !!process.env.RESEND_API_KEY
  });
}