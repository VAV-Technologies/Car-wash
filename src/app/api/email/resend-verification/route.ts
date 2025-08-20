import { NextRequest, NextResponse } from 'next/server';
import { sendOTPEmail } from '@/lib/otp-service';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email is required'
        },
        { status: 400 }
      );
    }

    console.log(`[RESEND-VERIFICATION-API] Processing OTP resend request for ${email}`);

    // Use the new OTP service to resend verification code
    const result = await sendOTPEmail(email);

    if (!result.success) {
      console.error(`[RESEND-VERIFICATION-API] Failed to resend OTP:`, result.error);
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to resend verification code',
        code: 'RESEND_FAILED'
      }, { status: 500 });
    }

    console.log(`[RESEND-VERIFICATION-API] OTP resent successfully for ${email}`);

    // Return consistent response format
    return NextResponse.json({
      success: true,
      message: 'A new verification code has been sent to your email. Please check your inbox.',
      code: 'OTP_RESENT'
    });

  } catch (error) {
    console.error('[RESEND-VERIFICATION-API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send verification email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
