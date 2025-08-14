import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailManually } from '@/lib/email-bypass';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log(`[VERIFY-BYPASS] Verifying email manually: ${email}`);

    const result = await verifyEmailManually(email);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email verified successfully',
        method: result.method
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[VERIFY-BYPASS] API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Handle GET requests for email verification links (bypass system)
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    if (!email) {
      return new Response('Email parameter is required', { status: 400 });
    }

    console.log(`[VERIFY-BYPASS] Processing email verification link for: ${email}`);

    const result = await verifyEmailManually(email);

    if (result.success) {
      // Redirect to success page
      const redirectUrl = new URL('/auth/verification-success', request.url);
      redirectUrl.searchParams.set('email', email);
      redirectUrl.searchParams.set('method', 'bypass');
      
      return Response.redirect(redirectUrl.toString(), 302);
    } else {
      // Redirect to error page
      const redirectUrl = new URL('/auth/verification-error', request.url);
      redirectUrl.searchParams.set('error', result.error || 'Verification failed');
      
      return Response.redirect(redirectUrl.toString(), 302);
    }
  } catch (error) {
    console.error('[VERIFY-BYPASS] GET error:', error);
    const redirectUrl = new URL('/auth/verification-error', request.url);
    redirectUrl.searchParams.set('error', 'System error during verification');
    
    return Response.redirect(redirectUrl.toString(), 302);
  }
}