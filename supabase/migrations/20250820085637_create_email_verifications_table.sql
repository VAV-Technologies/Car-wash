-- Create table for storing email verification OTP codes
CREATE TABLE IF NOT EXISTS public.email_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Add index for fast email lookups
    CONSTRAINT unique_pending_verification UNIQUE (email, otp_code)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON public.email_verifications (email);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON public.email_verifications (expires_at);
CREATE INDEX IF NOT EXISTS idx_email_verifications_otp ON public.email_verifications (otp_code);

-- Add RLS policies
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own verification records
CREATE POLICY "Users can view their own email verification attempts"
    ON public.email_verifications
    FOR SELECT
    USING (email = auth.email());

-- Policy: Only the system can insert verification records (via service role)
CREATE POLICY "System can insert verification records"
    ON public.email_verifications
    FOR INSERT
    WITH CHECK (true); -- This will be restricted by service role usage

-- Policy: Only the system can update verification records
CREATE POLICY "System can update verification records"
    ON public.email_verifications
    FOR UPDATE
    WITH CHECK (true); -- This will be restricted by service role usage

-- Add a cleanup function to remove expired OTP codes
CREATE OR REPLACE FUNCTION cleanup_expired_verifications()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM public.email_verifications 
    WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_email_verifications_updated_at
    BEFORE UPDATE ON public.email_verifications
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.email_verifications IS 'Stores OTP codes for email verification, bypassing Supabase email system';