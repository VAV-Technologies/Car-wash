import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { cookies } from 'next/headers';

// Create admin client
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
const createUserSchema = z.object({
  // Common fields
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(1, 'Full name is required').max(100),
  phoneNumber: z.string().optional(),
  country: z.string().optional(),
  role: z.enum(['buyer', 'seller']),
  
  // Seller-specific fields
  initialCompanyName: z.string().optional(),
  
  // Buyer-specific fields
  buyerPersonaType: z.string().optional(),
  buyerPersonaOther: z.string().optional(),
  investmentFocusDescription: z.string().optional(),
  preferredInvestmentSize: z.string().optional(),
  keyIndustriesOfInterest: z.string().optional(),
  
  // Admin options
  validateEmail: z.boolean().optional().default(false)
});

interface CreateUserResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
  message?: string;
  error?: string;
}

// Helper function to validate admin access - simplified and more reliable
async function isAdmin(request: NextRequest): Promise<{ isAdmin: boolean; adminUserId?: string }> {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { isAdmin: false };
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer '
    
    // Verify token with service role admin client
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      console.log('[ADMIN-CREATE-USER] Invalid or expired token');
      return { isAdmin: false };
    }
    
    // Check if user is admin in user_profiles using service role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profileError || profile?.role !== 'admin') {
      console.log('[ADMIN-CREATE-USER] User is not admin or profile not found');
      return { isAdmin: false };
    }
    
    return { isAdmin: true, adminUserId: user.id };
  } catch (error) {
    console.error('[ADMIN-CREATE-USER] Error checking admin status:', error);
    return { isAdmin: false };
  }
}

// Optional email validation (basic check)
function isValidEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest): Promise<NextResponse<CreateUserResponse>> {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    console.log(`[ADMIN-CREATE-USER-${requestId}] Starting admin user creation request`);
    
    // Check admin authorization
    const adminCheck = await isAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized. Admin access required.'
      }, { status: 403 });
    }
    
    const adminUserId = adminCheck.adminUserId!;
    
    // Parse and validate input
    const body = await request.json();
    const validatedData = createUserSchema.parse(body);
    
    console.log(`[ADMIN-CREATE-USER-${requestId}] Creating user: ${validatedData.email} as ${validatedData.role}`);
    
    // Optional email validation
    if (validatedData.validateEmail && !isValidEmailFormat(validatedData.email)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email format'
      }, { status: 400 });
    }
    
    // Check if user already exists
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error(`[ADMIN-CREATE-USER-${requestId}] Error checking existing users:`, listError);
      return NextResponse.json({
        success: false,
        error: 'Unable to verify email availability'
      }, { status: 500 });
    }
    
    const existingUser = existingUsers.users.find(u => u.email === validatedData.email);
    
    if (existingUser) {
      console.log(`[ADMIN-CREATE-USER-${requestId}] User already exists: ${validatedData.email}`);
      return NextResponse.json({
        success: false,
        error: 'A user with this email already exists'
      }, { status: 409 });
    }
    
    // Prepare user metadata based on role
    const userMetadata: any = {
      role: validatedData.role,
      full_name: validatedData.fullName,
      phone_number: validatedData.phoneNumber || '',
      country: validatedData.country || '',
      created_by_admin: true,
      admin_created_at: new Date().toISOString()
    };
    
    // Add role-specific metadata
    if (validatedData.role === 'seller') {
      if (validatedData.initialCompanyName) {
        userMetadata.initial_company_name = validatedData.initialCompanyName;
      }
    } else if (validatedData.role === 'buyer') {
      if (validatedData.buyerPersonaType) {
        userMetadata.buyer_persona_type = validatedData.buyerPersonaType;
      }
      if (validatedData.buyerPersonaOther) {
        userMetadata.buyer_persona_other = validatedData.buyerPersonaOther;
      }
      if (validatedData.investmentFocusDescription) {
        userMetadata.investment_focus_description = validatedData.investmentFocusDescription;
      }
      if (validatedData.preferredInvestmentSize) {
        userMetadata.preferred_investment_size = validatedData.preferredInvestmentSize;
      }
      if (validatedData.keyIndustriesOfInterest) {
        userMetadata.key_industries_of_interest = validatedData.keyIndustriesOfInterest;
      }
    }
    
    // Create user with email already confirmed
    console.log(`[ADMIN-CREATE-USER-${requestId}] Creating user via admin API with email pre-confirmed`);
    
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      email_confirm: true, // This is the key - email is pre-confirmed
      user_metadata: userMetadata
    });
    
    if (createError || !newUser.user) {
      console.error(`[ADMIN-CREATE-USER-${requestId}] User creation failed:`, createError);
      return NextResponse.json({
        success: false,
        error: createError?.message || 'Failed to create user'
      }, { status: 500 });
    }
    
    // Wait a moment for the trigger to complete profile creation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Verify the profile was created correctly by the trigger
    const { data: createdProfile, error: profileCheckError } = await supabaseAdmin
      .from('user_profiles')
      .select('role, is_email_verified, verification_status')
      .eq('id', newUser.user.id)
      .single();
    
    if (profileCheckError || !createdProfile) {
      console.error(`[ADMIN-CREATE-USER-${requestId}] Profile creation verification failed:`, profileCheckError);
      return NextResponse.json({
        success: false,
        error: 'User created but profile setup failed. Please try again.'
      }, { status: 500 });
    }
    
    // Verify the profile has correct settings
    if (!createdProfile.is_email_verified) {
      console.error(`[ADMIN-CREATE-USER-${requestId}] Profile not properly verified by trigger`);
      return NextResponse.json({
        success: false,
        error: 'User created but email verification setup failed. Please try again.'
      }, { status: 500 });
    }
    
    console.log(`[ADMIN-CREATE-USER-${requestId}] Profile verified: role=${createdProfile.role}, email_verified=${createdProfile.is_email_verified}, status=${createdProfile.verification_status}`);
    
    // Create verification record for login compatibility
    // Admin-created users get a pre-verified email verification record
    const { error: verificationRecordError } = await supabaseAdmin
      .from('email_verifications')
      .insert({
        email: validatedData.email,
        otp_code: '000000', // Placeholder code for admin-created users
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Valid for 1 year
        verified_at: new Date().toISOString(), // Already verified
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (verificationRecordError) {
      console.warn(`[ADMIN-CREATE-USER-${requestId}] Verification record creation warning:`, verificationRecordError);
      // Don't fail - this is for compatibility, not critical
    } else {
      console.log(`[ADMIN-CREATE-USER-${requestId}] Created verification record for login compatibility`);
    }
    
    // Create OTP token mapping for compatibility with hybrid verification system
    const { error: otpMappingError } = await supabaseAdmin
      .from('otp_token_mappings')
      .insert({
        email: validatedData.email,
        custom_otp: '000000', // Placeholder for admin-created users  
        token_hash: 'admin_created_bypass', // Special marker
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Valid for 1 year
        used_at: new Date().toISOString(), // Mark as already used
        created_at: new Date().toISOString()
      });
    
    if (otpMappingError) {
      console.warn(`[ADMIN-CREATE-USER-${requestId}] OTP mapping creation warning:`, otpMappingError);
      // Don't fail - this is for compatibility, not critical  
    } else {
      console.log(`[ADMIN-CREATE-USER-${requestId}] Created OTP mapping for verification system compatibility`);
    }
    
    // Log admin action for audit trail
    const { error: auditError } = await supabaseAdmin
      .from('admin_actions')
      .insert({
        admin_id: adminUserId,
        action_type: 'create_user',
        target_type: 'user',
        target_id: newUser.user.id,
        metadata: {
          email: validatedData.email,
          role: validatedData.role,
          created_with_verified_email: true
        }
      });
    
    if (auditError) {
      console.error(`[ADMIN-CREATE-USER-${requestId}] CRITICAL: Audit log failed:`, auditError);
      // Audit logging failure is a security concern - make it visible
      // But don't fail user creation since it's already done
    }
    
    const duration = Date.now() - startTime;
    console.log(`[ADMIN-CREATE-USER-${requestId}] User created successfully in ${duration}ms`);
    
    return NextResponse.json({
      success: true,
      user: {
        id: newUser.user.id,
        email: newUser.user.email!,
        fullName: validatedData.fullName,
        role: validatedData.role
      },
      message: `User created successfully with verified email. They can now login with their credentials.`,
      // Include audit status for transparency
      auditLogged: !auditError
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[ADMIN-CREATE-USER-${requestId}] Unexpected error after ${duration}ms:`, error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json({
        success: false,
        error: `Validation error: ${firstError.path.join('.')}: ${firstError.message}`
      }, { status: 400 });
    }
    
    // Generic error fallback
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred while creating the user'
    }, { status: 500 });
  }
}

// Health check endpoint
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'healthy',
    service: 'admin-user-creation-api',
    timestamp: new Date().toISOString()
  });
}