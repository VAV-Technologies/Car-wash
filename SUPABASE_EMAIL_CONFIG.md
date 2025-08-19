# Supabase Email Configuration Guide

## Problem
Supabase is sending magic links instead of OTP codes for email verification.

## Solution
Configure Supabase to use OTP authentication mode in your Supabase Dashboard.

### Steps to Configure in Supabase Dashboard:

1. **Go to your Supabase project dashboard**
   - Navigate to: https://app.supabase.com/project/[your-project-id]

2. **Configure Auth Settings**
   - Go to Authentication → Settings → Email Auth
   - Set the following:
     - **Enable Email Confirmations**: ON
     - **Enable Email Change Confirmations**: ON
     - **Confirmation flow**: Select "OTP" (not Magic Link)
     
3. **Configure SMTP Settings (Already Done)**
   - Go to Project Settings → Auth
   - SMTP Settings:
     - Host: `smtp.resend.com`
     - Port: `587`
     - Username: `resend`
     - Password: Your Resend API key
     - Sender email: `noreply@nobridge.co` (or your verified domain)
     - Sender name: `Nobridge`

4. **Configure Email Templates**
   - Go to Authentication → Email Templates
   - Select "Confirm signup" template
   - Make sure it uses `{{ .Token }}` for the OTP code
   - Template should look like:
   ```html
   <h2>Your verification code is: {{ .Token }}</h2>
   <p>Enter this code on the verification page to confirm your email.</p>
   ```

5. **Important Auth Settings**
   - Go to Authentication → Settings
   - Under "Auth Providers", make sure:
     - Email provider is enabled
     - Phone provider is disabled (unless you need it)
   
6. **URL Configuration**
   - Site URL: `https://nobridge.asia` (your production URL)
   - Redirect URLs: Add:
     - `https://nobridge.asia/auth/callback`
     - `https://nobridge.asia/verify-otp`
     - `https://nobridge.asia/auth/confirm`

## Testing the Configuration

1. **Test Registration Flow**:
   ```bash
   # In production
   curl -X POST https://nobridge.asia/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "TestPass123!",
       "full_name": "Test User",
       "role": "buyer"
     }'
   ```

2. **Check Email**:
   - You should receive an email with a 6-digit OTP code
   - NOT a magic link

3. **Verify OTP**:
   - Go to: https://nobridge.asia/verify-otp?email=test@example.com&type=register
   - Enter the 6-digit code

## Current Implementation Status

✅ **Backend Ready**:
- `/api/auth/register` - Creates user and triggers OTP email
- `/verify-otp` page - Ready to accept OTP codes
- `auth.verifyEmailOtp()` - Function to verify OTP codes

✅ **Email System Updated**:
- `sendVerificationEmailDirect()` now uses Supabase's OTP system
- Triggers `signInWithOtp()` which sends OTP codes

⚠️ **Required Dashboard Configuration**:
- Switch from Magic Link to OTP mode in Supabase Dashboard
- This MUST be done in the dashboard - cannot be done via code

## Troubleshooting

### Still getting magic links?
1. Clear Supabase auth cache
2. Ensure "Confirmation flow" is set to "OTP" not "Magic Link" 
3. Check email template uses `{{ .Token }}` not `{{ .ConfirmationURL }}`

### OTP not working?
1. Check OTP expiry time (default 3600 seconds)
2. Ensure `otp_length` is set to 6 in config
3. Verify email templates are correctly configured

### Email not sending?
1. Check Resend API key is valid
2. Verify sender domain is verified in Resend
3. Check Supabase logs for SMTP errors

## Environment Variables Required

```env
# Production
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
RESEND_API_KEY=[your-resend-api-key]
NEXT_PUBLIC_APP_URL=https://nobridge.asia
```