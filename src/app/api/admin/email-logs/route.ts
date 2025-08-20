import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '500', 10);
    const status = searchParams.get('status');
    const templateType = searchParams.get('template_type');
    const provider = searchParams.get('provider');
    const search = searchParams.get('search');

    // Build query
    let query = supabaseAdmin
      .from('email_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (templateType && templateType !== 'all') {
      query = query.eq('template_type', templateType);
    }

    if (provider && provider !== 'all') {
      query = query.eq('email_provider', provider);
    }

    if (search) {
      query = query.ilike('recipient_email', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[EMAIL-LOGS-API] Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch email logs', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });

  } catch (error) {
    console.error('[EMAIL-LOGS-API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Health check
export async function POST(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'healthy',
    service: 'email-logs-api',
    timestamp: new Date().toISOString()
  });
}