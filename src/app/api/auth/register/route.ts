import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendVerificationEmailDirect } from '@/lib/email-bypass';
import { z } from 'zod';

// Create admin client with proper error handling
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
const registerSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(1, 'Full name is required').max(100),
  phone_number: z.string().optional(),
  country: z.string().optional(),
  role: z.enum(['buyer', 'seller']).default('buyer'),
  // Seller-specific fields
  initialCompanyName: z.string().optional(),
});

interface RegisterResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    needsVerification: boolean;
  };
  message?: string;
  error?: string;
  code?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<RegisterResponse>> {
  const startTime = Date.now();
  let requestId = Math.random().toString(36).substring(7);
  
  try {
    console.log(`[REGISTER-API-${requestId}] Starting registration request`);
    
    // Parse and validate input
    const body = await request.json();
    const validatedData = registerSchema.parse(body);
    
    console.log(`[REGISTER-API-${requestId}] Validated input for email: ${validatedData.email}`);
    
    // Check if user already exists
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error(`[REGISTER-API-${requestId}] Error checking existing users:`, listError);
      return NextResponse.json({
        success: false,
        error: 'Unable to verify email availability',
        code: 'USER_CHECK_FAILED'
      }, { status: 500 });
    }
    
    const existingUser = existingUsers.users.find(u => u.email === validatedData.email);
    
    if (existingUser) {
      console.log(`[REGISTER-API-${requestId}] User already exists: ${validatedData.email}`);
      
      // Check if they're already verified
      if (existingUser.email_confirmed_at) {
        return NextResponse.json({
          success: false,
          error: 'An account with this email already exists. Please try logging in instead.',
          code: 'USER_EXISTS_VERIFIED'
        }, { status: 409 });
      } else {
        // User exists but not verified - resend OTP verification
        console.log(`[REGISTER-API-${requestId}] Resending OTP verification for existing unverified user`);
        
        // Send verification email via Resend
        console.log(`[REGISTER-API-${requestId}] Resending verification for existing unverified user`);
        
        const emailResult = await sendVerificationEmailDirect(validatedData.email);
        
        if (!emailResult.success) {
          console.error(`[REGISTER-API-${requestId}] Failed to resend verification:`, emailResult.error);
          return NextResponse.json({
            success: false,
            error: 'Unable to send verification email. Please try again.',
            code: 'EMAIL_SEND_FAILED'
          }, { status: 500 });
        }
        
        return NextResponse.json({
          success: true,
          user: {
            id: existingUser.id,
            email: existingUser.email!,
            needsVerification: true
          },
          message: 'Verification email sent. Please check your email to activate your account.',
          code: 'VERIFICATION_RESENT'
        });
      }
    }
    
    // Create new user using admin method (no session created)
    console.log(`[REGISTER-API-${requestId}] Creating new user via admin: ${validatedData.email}`);
    
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      email_confirm: false, // User needs to verify via OTP
      user_metadata: {
        role: validatedData.role,
        full_name: validatedData.full_name,
        phone_number: validatedData.phone_number || '',
        country: validatedData.country || '',
        // Seller-specific metadata
        ...(validatedData.role === 'seller' && validatedData.initialCompanyName && {
          initial_company_name: validatedData.initialCompanyName
        })
      }
    });
    
    if (createError) {
      console.error(`[REGISTER-API-${requestId}] User creation failed:`, createError);
      
      // Handle specific error types
      if (createError.message?.includes('already registered')) {
        return NextResponse.json({
          success: false,
          error: 'An account with this email already exists. Please try logging in instead.',
          code: 'USER_EXISTS'
        }, { status: 409 });
      }
      
      return NextResponse.json({
        success: false,
        error: 'Failed to create account. Please try again.',
        code: 'USER_CREATION_FAILED'
      }, { status: 500 });
    }
    
    if (!newUser.user) {
      console.error(`[REGISTER-API-${requestId}] User creation returned no user object`);
      return NextResponse.json({
        success: false,
        error: 'Account creation failed. Please try again.',
        code: 'NO_USER_RETURNED'
      }, { status: 500 });
    }
    
    console.log(`[REGISTER-API-${requestId}] User created successfully: ${newUser.user.id}`);
    
    // Send verification email via Resend
    console.log(`[REGISTER-API-${requestId}] Sending verification email via Resend`);
    
    const emailResult = await sendVerificationEmailDirect(validatedData.email);
    
    if (!emailResult.success) {
      console.error(`[REGISTER-API-${requestId}] Email sending failed:`, emailResult.error);
      
      // User was created but email failed - still return success but note the issue
      return NextResponse.json({
        success: true,
        user: {
          id: newUser.user.id,
          email: newUser.user.email!,
          needsVerification: true
        },
        message: 'Account created successfully, but verification email failed to send. Please contact support.',
        code: 'USER_CREATED_EMAIL_FAILED'
      });
    }
    
    const duration = Date.now() - startTime;
    console.log(`[REGISTER-API-${requestId}] Registration completed successfully in ${duration}ms`);
    
    return NextResponse.json({
      success: true,
      user: {
        id: newUser.user.id,
        email: newUser.user.email!,
        needsVerification: true
      },
      message: 'Account created successfully! Please check your email for a verification link.',
      code: 'USER_CREATED'
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[REGISTER-API-${requestId}] Unexpected error after ${duration}ms:`, error);
    
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
    service: 'registration-api',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasResendKey: !!process.env.RESEND_API_KEY
  });
}