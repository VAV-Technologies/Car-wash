import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/otp-service';
import { z } from 'zod';

// Input validation schema
const verifyOTPSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  otpCode: z.string().min(6, 'OTP code must be 6 digits').max(6, 'OTP code must be 6 digits').regex(/^\d{6}$/, 'OTP code must be 6 digits')
});

interface VerifyOTPResponse {
  success: boolean;
  message?: string;
  error?: string;
  code?: string;
  userVerified?: boolean;
}

export async function POST(request: NextRequest): Promise<NextResponse<VerifyOTPResponse>> {
  const startTime = Date.now();
  let requestId = Math.random().toString(36).substring(7);
  
  try {
    console.log(`[VERIFY-OTP-API-${requestId}] Starting OTP verification request`);
    
    // Parse and validate input
    const body = await request.json();
    const validatedData = verifyOTPSchema.parse(body);
    
    console.log(`[VERIFY-OTP-API-${requestId}] Validating OTP for email: ${validatedData.email}`);
    
    // Verify OTP using our service
    const result = await verifyOTP(validatedData.email, validatedData.otpCode);
    
    if (!result.success) {
      console.log(`[VERIFY-OTP-API-${requestId}] OTP verification failed: ${result.error}`);
      return NextResponse.json({
        success: false,
        error: result.error || 'Invalid verification code',
        code: 'INVALID_OTP'
      }, { status: 400 });
    }
    
    const duration = Date.now() - startTime;
    console.log(`[VERIFY-OTP-API-${requestId}] OTP verification successful in ${duration}ms`);
    
    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now sign in to your account.',
      code: 'EMAIL_VERIFIED',
      userVerified: true
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[VERIFY-OTP-API-${requestId}] Unexpected error after ${duration}ms:`, error);
    
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
    service: 'otp-verification-api',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasResendKey: !!process.env.RESEND_API_KEY
  });
}