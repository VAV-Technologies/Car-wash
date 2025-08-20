import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Create admin client for database operations
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
const getTokenHashSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  customOtp: z.string().min(6, 'OTP must be 6 digits').max(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must be 6 digits')
});

interface TokenHashResponse {
  success: boolean;
  tokenHash?: string;
  error?: string;
  code?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<TokenHashResponse>> {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    console.log(`[GET-TOKEN-HASH-API-${requestId}] Processing token hash lookup request`);
    
    // Parse and validate input
    const body = await request.json();
    const validatedData = getTokenHashSchema.parse(body);
    
    console.log(`[GET-TOKEN-HASH-API-${requestId}] Looking up token hash for email: ${validatedData.email}, OTP: ${validatedData.customOtp.substring(0, 2)}***`);
    
    // Look up the token hash from custom OTP
    const { data: mapping, error: lookupError } = await supabaseAdmin
      .from('otp_token_mappings')
      .select('token_hash, expires_at, used_at')
      .eq('email', validatedData.email)
      .eq('custom_otp', validatedData.customOtp)
      .is('used_at', null) // Not already used
      .gte('expires_at', new Date().toISOString()) // Not expired
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (lookupError || !mapping) {
      console.log(`[GET-TOKEN-HASH-API-${requestId}] Invalid or expired OTP for ${validatedData.email}: ${validatedData.customOtp}`);
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired verification code. Please request a new one.',
        code: 'INVALID_OTP'
      }, { status: 400 });
    }

    console.log(`[GET-TOKEN-HASH-API-${requestId}] Found valid OTP mapping for ${validatedData.email}`);

    // Mark OTP as used to prevent replay attacks
    const { error: updateError } = await supabaseAdmin
      .from('otp_token_mappings')
      .update({ 
        used_at: new Date().toISOString()
      })
      .eq('email', validatedData.email)
      .eq('custom_otp', validatedData.customOtp);

    if (updateError) {
      console.error(`[GET-TOKEN-HASH-API-${requestId}] Failed to mark OTP as used:`, updateError);
      return NextResponse.json({
        success: false,
        error: 'Failed to process verification code',
        code: 'UPDATE_FAILED'
      }, { status: 500 });
    }

    const duration = Date.now() - startTime;
    console.log(`[GET-TOKEN-HASH-API-${requestId}] Token hash lookup successful in ${duration}ms`);
    
    return NextResponse.json({
      success: true,
      tokenHash: mapping.token_hash,
      code: 'TOKEN_HASH_FOUND'
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[GET-TOKEN-HASH-API-${requestId}] Unexpected error after ${duration}ms:`, error);
    
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
    service: 'get-token-hash-api',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
  });
}