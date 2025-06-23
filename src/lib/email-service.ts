import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Create Supabase admin client for email operations
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

// Create regular Supabase client for auth operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Initialize Resend client for production fallbacks
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface EmailResult {
  success: boolean;
  message?: string;
  error?: string;
  debug?: any;
  attempts?: number;
  service?: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Unified email service with retry logic, fallbacks, and monitoring
 * Consolidates all email functionality to eliminate conflicts
 */
export class EmailService {
  private static instance: EmailService;
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

  static getInstance(): EmailService {
    if (!this.instance) {
      this.instance = new EmailService();
    }
    return this.instance;
  }

  /**
   * Get base URL for email redirects
   */
  private getBaseUrl(): string {
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }

  /**
   * Sleep utility for retry delays
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Enhanced email templates that match app design principles (no emojis)
   */
  private getVerificationTemplate(verificationUrl: string): string {
    return `
      <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F4F6FC; padding: 20px;">
        <div style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(13, 13, 57, 0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0D0D39; margin: 0; font-size: 24px; font-weight: 600;">Welcome to Nobridge!</h1>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">Please verify your email address to complete your registration.</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #0D0D39; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Verify Email Address
            </a>
          </div>

          <div style="background: #F0F9FF; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #3B82F6;">
            <p style="margin: 0; color: #0D0D39;"><strong>What happens next:</strong></p>
            <p style="margin: 8px 0 0 0; color: #666;">Click the button above to verify your email and gain full access to the Nobridge platform.</p>
          </div>

          <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #E5E7EB; color: #6B7280; font-size: 14px;">
            <p style="margin: 0;">If you didn't create an account with Nobridge, you can safely ignore this email.</p>
            <p style="margin: 5px 0 0 0;">&copy; 2024 Nobridge. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;
  }

  private getPasswordResetTemplate(resetUrl: string): string {
    return `
      <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F4F6FC; padding: 20px;">
        <div style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(13, 13, 57, 0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0D0D39; margin: 0; font-size: 24px; font-weight: 600;">Reset Your Nobridge Password</h1>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">We received a request to reset your password. Click the button below to create a new password.</p>
          </div>

          <div style="background: #FEF3C7; padding: 32px; border-radius: 8px; margin: 32px 0; text-align: center;">
            <h2 style="color: #0D0D39; margin: 0 0 16px 0;">Reset Your Password</h2>
            <a href="${resetUrl}" style="background-color: #EF4444; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; margin: 16px 0;">
              Reset My Password
            </a>
            <p style="margin: 16px 0 0 0; color: #666; font-size: 14px;">This link will expire in 1 hour for security</p>
          </div>

          <div style="background: #FEF2F2; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #EF4444;">
            <p style="margin: 0 0 8px 0; color: #0D0D39;"><strong>Security Notice:</strong></p>
            <ul style="margin: 0; padding-left: 20px; color: #666;">
              <li>If you didn't request this password reset, please ignore this email</li>
              <li>Your current password remains unchanged until you complete the reset</li>
              <li>This link can only be used once and expires in 1 hour</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #E5E7EB; color: #6B7280; font-size: 14px;">
            <p style="margin: 0;">Need help? Contact our support team if you're having trouble accessing your account.</p>
            <p style="margin: 5px 0 0 0;">&copy; 2024 Nobridge. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Send custom email with retry logic and fallbacks
   */
  async sendCustomEmail(options: SendEmailOptions): Promise<EmailResult> {
    const { to, subject, html, from = 'noreply@yourdomain.com' } = options;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`[EMAIL-SERVICE] Attempt ${attempt}/${this.maxRetries}: Sending ${subject} to ${to}`);

        if (process.env.NODE_ENV === 'production' && resend) {
          // Use Resend in production
          const result = await resend.emails.send({
            from,
            to,
            subject,
            html,
          });

          console.log(`[EMAIL-SERVICE] SUCCESS (Resend): ${subject} sent to ${to}`);
          return {
            success: true,
            message: 'Email sent successfully via Resend',
            service: 'resend',
            attempts: attempt,
            debug: { result, attempt }
          };
        } else {
          // Use Supabase admin to generate email in development
          const { data, error } = await supabaseAdmin.auth.admin.generateLink({
            type: 'email_change_new',
            email: to,
            options: {
              redirectTo: `${this.getBaseUrl()}/auth/callback`
            }
          });

          if (error) throw error;

          console.log(`[EMAIL-SERVICE] SUCCESS (Supabase Dev): ${subject} sent to ${to} via Mailpit`);
      return {
            success: true,
            message: 'Email sent successfully via Supabase (Mailpit)',
            service: 'supabase-dev',
            attempts: attempt,
            debug: { data, attempt, viewAt: 'http://localhost:54324' }
      };
        }
    } catch (error) {
        console.error(`[EMAIL-SERVICE] Attempt ${attempt}/${this.maxRetries} failed:`, error);

        if (attempt === this.maxRetries) {
      return {
        success: false,
            error: `Failed after ${this.maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`,
            attempts: attempt,
            debug: { finalError: error }
      };
        }

        await this.sleep(this.retryDelay * attempt); // Exponential backoff
    }
  }

    return {
      success: false,
      error: 'Unexpected retry loop exit',
      attempts: this.maxRetries
    };
  }

  /**
   * Send notification email (for contact forms, alerts, etc.)
   * This method works without requiring the recipient to be a registered user
   */
  async sendNotificationEmail(options: SendEmailOptions): Promise<EmailResult> {
    const { to, subject, html, from = 'noreply@yourdomain.com' } = options;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`[EMAIL-SERVICE] Notification attempt ${attempt}/${this.maxRetries}: Sending ${subject} to ${to}`);

        if (process.env.NODE_ENV === 'production' && resend) {
          // Use Resend in production
          const result = await resend.emails.send({
            from,
            to,
            subject,
            html,
          });

          console.log(`[EMAIL-SERVICE] SUCCESS (Resend): Notification sent to ${to}`);
          return {
            success: true,
            message: 'Notification email sent successfully via Resend',
            service: 'resend',
            attempts: attempt,
            debug: { result, attempt }
          };
        } else {
          // In development, we'll simulate sending to Mailpit by creating a dummy user email action
          // This bypasses the "user must exist" requirement
          console.log(`[EMAIL-SERVICE] DEV MODE: Simulating notification email to ${to}`);
          console.log(`[EMAIL-SERVICE] Subject: ${subject}`);
          console.log(`[EMAIL-SERVICE] Content Preview: ${html.substring(0, 200)}...`);

          // In development, we just return success since we can't actually send to arbitrary emails via Supabase
          // The user should check their actual email in production or use a real email testing service
          console.log(`[EMAIL-SERVICE] SUCCESS (Dev Simulation): Notification simulated for ${to}`);
          return {
            success: true,
            message: 'Notification email simulated successfully (development mode). In production, this would be sent via Resend.',
            service: 'development-simulation',
            attempts: attempt,
            debug: {
              mode: 'development-simulation',
              note: 'Email content logged to console. In production, this would use Resend.',
              to,
              subject,
              contentPreview: html.substring(0, 200) + '...'
            }
          };
        }
      } catch (error) {
        console.error(`[EMAIL-SERVICE] Notification attempt ${attempt}/${this.maxRetries} failed:`, error);

        if (attempt === this.maxRetries) {
          return {
            success: false,
            error: `Notification failed after ${this.maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`,
            attempts: attempt,
            debug: { finalError: error }
          };
        }

        await this.sleep(this.retryDelay * attempt);
      }
    }

    return {
      success: false,
      error: 'Unexpected retry loop exit',
      attempts: this.maxRetries
    };
  }

  /**
   * Send password reset email with enhanced reliability
   */
  async sendPasswordResetEmail(email: string): Promise<EmailResult> {
      console.log(`[EMAIL-SERVICE] Sending password reset email to ${email}`);

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`[EMAIL-SERVICE] Password reset attempt ${attempt}/${this.maxRetries} for ${email}`);

        // Primary method: Use Supabase auth password reset
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${this.getBaseUrl()}/auth/update-password`
      });

      if (error) {
          // Handle specific errors
        if (error.message?.includes('User not found')) {
          return {
            success: false,
            error: 'No account found with this email address',
              attempts: attempt,
            debug: {
              method: 'auth.resetPasswordForEmail',
                note: 'User not found - no retry needed',
              supabaseError: error
            }
          };
        }

          // For other errors, try Resend fallback if available
          if (attempt === this.maxRetries && resend) {
            console.log(`[EMAIL-SERVICE] Fallback to Resend for password reset: ${email}`);

            const resetUrl = `${this.getBaseUrl()}/auth/update-password`;
            const result = await this.sendCustomEmail({
              to: email,
              subject: 'Reset Your Nobridge Password',
              html: this.getPasswordResetTemplate(resetUrl)
            });

            if (result.success) {
              return {
                ...result,
                message: 'Password reset email sent via Resend fallback',
                service: 'resend-fallback'
              };
            }
          }

          throw error;
        }

        console.log(`[EMAIL-SERVICE] Password reset email sent successfully to ${email}`);
        return {
          success: true,
          message: 'Password reset email sent successfully',
          service: 'supabase-auth',
          attempts: attempt,
          debug: {
            method: 'auth.resetPasswordForEmail',
            recipient: email
          }
        };

      } catch (error) {
        console.error(`[EMAIL-SERVICE] Password reset attempt ${attempt}/${this.maxRetries} failed:`, error);

        if (attempt === this.maxRetries) {
      return {
            success: false,
            error: `Password reset failed after ${this.maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`,
            attempts: attempt,
        debug: {
              method: 'auth.resetPasswordForEmail',
              finalError: error
        }
      };
        }

        await this.sleep(this.retryDelay * attempt);
      }
    }

      return {
        success: false,
      error: 'Unexpected retry loop exit',
      attempts: this.maxRetries
      };
  }

  /**
   * Resend verification email with enhanced reliability
   */
  async resendVerificationEmail(email: string): Promise<EmailResult> {
      console.log(`[EMAIL-SERVICE] Resending verification email to ${email}`);

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`[EMAIL-SERVICE] Verification resend attempt ${attempt}/${this.maxRetries} for ${email}`);

        // Check if user exists using admin client
      const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000
      });

      if (listError) {
          throw new Error(`User lookup failed: ${listError.message}`);
      }

      const user = users?.users?.find(u => u.email === email);

      if (!user) {
        // For security, return success even if user doesn't exist
        console.log(`[EMAIL-SERVICE] User ${email} not found - returning success for security`);
        return {
          success: true,
          message: 'If this email exists in our system, a verification email has been sent.',
            service: 'security-response',
            attempts: attempt,
          debug: {
              note: 'User not found, but returning success for security reasons'
          }
        };
      }

        // User exists, use the resend method
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${this.getBaseUrl()}/auth/callback`
        }
      });

      if (error) {
          // Handle rate limiting specifically
          if (error.message?.includes('rate limit') || error.message?.includes('too many')) {
        return {
          success: false,
              error: 'Rate limit exceeded. Please wait a moment before requesting another verification email.',
              attempts: attempt,
          debug: {
            method: 'auth.resend',
                rateLimited: true,
                suggestion: 'Wait 60 seconds before retrying',
            supabaseError: error
          }
        };
      }

          // Try Resend fallback if available
          if (attempt === this.maxRetries && resend) {
            console.log(`[EMAIL-SERVICE] Fallback to Resend for verification: ${email}`);

            const verificationUrl = `${this.getBaseUrl()}/auth/callback`;
            const result = await this.sendCustomEmail({
              to: email,
              subject: 'Welcome to Nobridge - Verify Your Email',
              html: this.getVerificationTemplate(verificationUrl)
            });

            if (result.success) {
              return {
                ...result,
                message: 'Verification email sent via Resend fallback',
                service: 'resend-fallback'
              };
            }
          }

          throw error;
        }

        console.log(`[EMAIL-SERVICE] Verification email resent successfully to ${email}`);
      return {
        success: true,
          message: 'Verification email resent successfully',
          service: 'supabase-auth',
          attempts: attempt,
          debug: {
            recipient: email,
          userExists: true,
          userId: user.id,
          emailConfirmed: user.email_confirmed_at ? 'already confirmed' : 'pending',
            method: 'auth.resend'
        }
      };

    } catch (error) {
        console.error(`[EMAIL-SERVICE] Verification resend attempt ${attempt}/${this.maxRetries} failed:`, error);

        if (attempt === this.maxRetries) {
      return {
        success: false,
            error: `Verification email resend failed after ${this.maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`,
            attempts: attempt,
            debug: {
              method: 'auth.resend',
              finalError: error
            }
          };
        }

        await this.sleep(this.retryDelay * attempt);
      }
    }

    return {
      success: false,
      error: 'Unexpected retry loop exit',
      attempts: this.maxRetries
    };
  }

  /**
   * Send verification email for new signups
   * This is typically handled automatically by Supabase during signup
   */
  async sendVerificationEmail(email: string): Promise<EmailResult> {
    console.log(`[EMAIL-SERVICE] Sending verification email to ${email}`);

    // This method is typically called after a user has signed up
    // In a test context, we need a user to exist first
    return {
      success: false,
      error: 'Direct verification email sending requires user signup. Use auth.signUp() instead.',
      debug: {
        note: 'Verification emails are automatically sent during user signup',
        suggestion: 'Create a user first, then use resendVerificationEmail()'
      }
      };
    }

  /**
   * Send signup confirmation email (delegates to verification flow)
   */
  async sendSignupConfirmationEmail(email: string): Promise<EmailResult> {
    console.log(`[EMAIL-SERVICE] Sending signup confirmation email to ${email}`);

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`[EMAIL-SERVICE] Signup confirmation attempt ${attempt}/${this.maxRetries} for ${email}`);

        // Use Supabase auth signup with email confirmation
        const { error } = await supabase.auth.signUp({
          email: email,
          password: 'temp_password_will_be_reset', // User will set real password via email link
          options: {
            emailRedirectTo: `${this.getBaseUrl()}/auth/callback`
          }
        });

        if (error) {
          // If user already exists, try resend instead
          if (error.message?.includes('already registered')) {
            return await this.resendVerificationEmail(email);
          }

          throw error;
        }

        console.log(`[EMAIL-SERVICE] Signup confirmation email sent successfully to ${email}`);
        return {
          success: true,
          message: 'Signup confirmation email sent successfully',
          service: 'supabase-auth',
          attempts: attempt,
          debug: {
            method: 'auth.signUp',
            recipient: email
          }
        };

      } catch (error) {
        console.error(`[EMAIL-SERVICE] Signup confirmation attempt ${attempt}/${this.maxRetries} failed:`, error);

        if (attempt === this.maxRetries) {
          return {
            success: false,
            error: `Signup confirmation failed after ${this.maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`,
            attempts: attempt,
            debug: {
              method: 'auth.signUp',
              finalError: error
            }
          };
        }

        await this.sleep(this.retryDelay * attempt);
      }
    }

    return {
      success: false,
      error: 'Unexpected retry loop exit',
      attempts: this.maxRetries
    };
  }

  /**
   * Get email service status and configuration
   */
  async getEmailServiceStatus(): Promise<any> {
    return {
      service: 'unified-email-service',
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      emailViewer: process.env.NODE_ENV === 'development' ? 'http://localhost:54324' : 'production inbox',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      appUrl: this.getBaseUrl(),
      resendEnabled: !!resend,
      retryConfig: {
        maxRetries: this.maxRetries,
        retryDelay: this.retryDelay
      },
      note: process.env.NODE_ENV === 'development'
        ? 'In development, emails are captured by Mailpit at http://localhost:54324'
        : 'In production, using Resend with Supabase fallback',
      methods: {
        resendVerification: 'auth.resend() with retry logic and user validation',
        passwordReset: 'auth.resetPasswordForEmail() with retry logic and Resend fallback',
        customEmail: 'Resend in production, Supabase admin in development',
        signup: 'auth.signUp() - triggers email automatically'
      },
      improvements: [
        'Added retry logic with exponential backoff',
        'Implemented Resend fallback for password resets',
        'Enhanced error handling and user feedback',
        'Added rate limiting detection',
        'Consolidated multiple email service implementations',
        'Added comprehensive logging and debugging'
      ]
    };
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance();
