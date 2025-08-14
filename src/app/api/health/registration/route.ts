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

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  checks: {
    [key: string]: {
      status: 'pass' | 'fail';
      message?: string;
      duration?: number;
    };
  };
}

export async function GET(): Promise<NextResponse<HealthCheck>> {
  const startTime = Date.now();
  const checks: HealthCheck['checks'] = {};

  try {
    // Check environment variables
    const envStart = Date.now();
    checks.environment_variables = {
      status: 'pass',
      duration: Date.now() - envStart
    };

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      checks.environment_variables = {
        status: 'fail',
        message: 'NEXT_PUBLIC_SUPABASE_URL missing'
      };
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      checks.environment_variables = {
        status: 'fail',
        message: 'SUPABASE_SERVICE_ROLE_KEY missing'
      };
    }

    if (!process.env.RESEND_API_KEY) {
      checks.environment_variables = {
        status: 'fail',
        message: 'RESEND_API_KEY missing'
      };
    }

    // Check Supabase connection
    const supabaseStart = Date.now();
    try {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers();
      
      if (error) throw error;
      
      checks.supabase_connection = {
        status: 'pass',
        message: `Connected successfully (${data.users.length} total users)`,
        duration: Date.now() - supabaseStart
      };
    } catch (error) {
      checks.supabase_connection = {
        status: 'fail',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - supabaseStart
      };
    }

    // Check Resend connection
    const resendStart = Date.now();
    try {
      if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY not configured');
      }

      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      // Test API key validity by checking domains (doesn't send emails)
      const domains = await resend.domains.list();
      
      checks.resend_connection = {
        status: 'pass',
        message: `Connected successfully (${domains.data?.length || 0} domains configured)`,
        duration: Date.now() - resendStart
      };
    } catch (error) {
      checks.resend_connection = {
        status: 'fail',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - resendStart
      };
    }

    // Check registration API endpoint
    const apiStart = Date.now();
    try {
      const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/register`, {
        method: 'GET' // Health check endpoint
      });
      
      const apiData = await apiResponse.json();
      
      checks.registration_api = {
        status: apiResponse.ok ? 'pass' : 'fail',
        message: apiResponse.ok ? 'API endpoint responding' : `API returned ${apiResponse.status}`,
        duration: Date.now() - apiStart
      };
    } catch (error) {
      checks.registration_api = {
        status: 'fail',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - apiStart
      };
    }

    // Determine overall status
    const failedChecks = Object.values(checks).filter(check => check.status === 'fail');
    let status: HealthCheck['status'] = 'healthy';
    
    if (failedChecks.length > 0) {
      status = failedChecks.length > 2 ? 'unhealthy' : 'degraded';
    }

    const healthCheck: HealthCheck = {
      status,
      timestamp: new Date().toISOString(),
      version: '2.0.0-resend-migration',
      environment: process.env.NODE_ENV || 'unknown',
      checks
    };

    console.log(`[HEALTH-CHECK] Registration health check completed in ${Date.now() - startTime}ms - Status: ${status}`);

    return NextResponse.json(healthCheck, {
      status: status === 'unhealthy' ? 503 : 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('[HEALTH-CHECK] Unexpected error during health check:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0-resend-migration',
      environment: process.env.NODE_ENV || 'unknown',
      checks: {
        ...checks,
        health_check_system: {
          status: 'fail',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
}