import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { emailService } from '@/lib/email-service';

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

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { emails } = await request.json();

    if (!emails || !Array.isArray(emails)) {
      return NextResponse.json(
        { error: 'Emails array is required' },
        { status: 400 }
      );
    }

    console.log(`[ADMIN-RESEND] Processing ${emails.length} emails for verification resend`);

    const results = [];
    const errors = [];

    // Process each email
    for (const email of emails) {
      try {
        console.log(`[ADMIN-RESEND] Sending verification email to: ${email}`);
        
        // First check if user exists and needs verification
        const { data: users } = await supabaseAdmin.auth.admin.listUsers();
        const user = users.users.find(u => u.email === email);
        
        if (!user) {
          errors.push({ email, error: 'User not found' });
          continue;
        }

        if (user.email_confirmed_at) {
          results.push({ 
            email, 
            status: 'already_verified',
            message: 'Email already verified' 
          });
          continue;
        }

        // Send verification email using the email service
        const result = await emailService.resendVerificationEmail(email);
        
        if (result.success) {
          results.push({ 
            email, 
            status: 'sent',
            message: 'Verification email sent successfully',
            service: result.service,
            attempts: result.attempts
          });
        } else {
          errors.push({ 
            email, 
            error: result.error || 'Failed to send email',
            debug: result.debug
          });
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`[ADMIN-RESEND] Error processing ${email}:`, error);
        errors.push({ 
          email, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    // Generate summary
    const summary = {
      total: emails.length,
      successful: results.filter(r => r.status === 'sent').length,
      already_verified: results.filter(r => r.status === 'already_verified').length,
      failed: errors.length
    };

    console.log('[ADMIN-RESEND] Summary:', summary);

    return NextResponse.json({
      success: true,
      summary,
      results,
      errors,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[ADMIN-RESEND] Fatal error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check unverified users
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all unverified users
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      throw error;
    }

    const unverifiedUsers = users.users
      .filter(u => !u.email_confirmed_at)
      .map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        user_metadata: u.user_metadata
      }));

    return NextResponse.json({
      success: true,
      total_unverified: unverifiedUsers.length,
      users: unverifiedUsers
    });

  } catch (error) {
    console.error('[ADMIN-RESEND] Error fetching unverified users:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch unverified users',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}