import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';
import { createClient } from '@supabase/supabase-js';

// Create admin client to test Supabase email
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

export async function GET(request: NextRequest) {
  try {
    // Get current configuration
    const config = {
      environment: process.env.NODE_ENV,
      hasResendKey: !!process.env.RESEND_API_KEY,
      resendKeyPreview: process.env.RESEND_API_KEY ? 
        `${process.env.RESEND_API_KEY.substring(0, 10)}...` : 'NOT SET',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      emailServiceStatus: await emailService.getEmailServiceStatus()
    };

    return NextResponse.json({
      success: true,
      config,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, type = 'test' } = await request.json();

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email is required'
      }, { status: 400 });
    }

    console.log(`[EMAIL-TEST] Testing email delivery to ${email}, type: ${type}`);

    let result;

    switch (type) {
      case 'resend-direct':
        // Test Resend directly
        if (!process.env.RESEND_API_KEY) {
          throw new Error('RESEND_API_KEY not configured');
        }
        
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        const resendResult = await resend.emails.send({
          from: 'onboarding@resend.dev', // Use Resend's test email
          to: email,
          subject: 'Test Email from Nobridge (Direct Resend)',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1>Test Email from Nobridge</h1>
              <p>This is a test email sent directly via Resend API.</p>
              <p>If you received this, Resend is working correctly!</p>
              <hr>
              <p style="color: #666; font-size: 12px;">
                Sent at: ${new Date().toISOString()}<br>
                Environment: ${process.env.NODE_ENV}<br>
                Method: Direct Resend API
              </p>
            </div>
          `
        });
        
        result = {
          success: true,
          method: 'resend-direct',
          response: resendResult
        };
        break;

      case 'registration-api':
        // Test our new registration API
        const registrationResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            password: 'TestPassword123!',
            full_name: 'Test User',
            role: 'buyer'
          })
        });
        
        const registrationResult = await registrationResponse.json();
        
        result = {
          success: registrationResponse.ok,
          method: 'registration-api',
          response: registrationResult,
          status: registrationResponse.status
        };
        break;

      case 'email-service':
        // Test our email service
        const serviceResult = await emailService.sendCustomEmail({
          to: email,
          subject: 'Test Email from Nobridge (Email Service)',
          from: 'business@nobridge.co',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1>Test Email from Nobridge</h1>
              <p>This is a test email sent via the email service.</p>
              <p>If you received this, the email service is working!</p>
              <hr>
              <p style="color: #666; font-size: 12px;">
                Sent at: ${new Date().toISOString()}<br>
                Environment: ${process.env.NODE_ENV}<br>
                Method: Email Service
              </p>
            </div>
          `
        });
        
        result = {
          success: serviceResult.success,
          method: 'email-service',
          ...serviceResult
        };
        break;

      default:
        throw new Error('Invalid test type');
    }

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[EMAIL-TEST] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}