-- Create table to store mapping between custom OTP codes and Supabase token hashes
-- This allows us to send user-friendly 6-digit codes via Resend while using Supabase's secure verification

CREATE TABLE IF NOT EXISTS public.otp_token_mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  custom_otp TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure only one active OTP per email at a time
  UNIQUE(email, custom_otp)
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_otp_mappings_email_otp ON public.otp_token_mappings (email, custom_otp);
CREATE INDEX IF NOT EXISTS idx_otp_mappings_expires ON public.otp_token_mappings (expires_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.otp_token_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only service role can manage OTP mappings
CREATE POLICY "Service role can manage OTP mappings" ON public.otp_token_mappings
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Function to cleanup expired OTP mappings (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_otp_mappings()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.otp_token_mappings 
  WHERE expires_at < NOW() 
  OR used_at IS NOT NULL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON public.otp_token_mappings TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_expired_otp_mappings() TO service_role;

-- Add helpful comments
COMMENT ON TABLE public.otp_token_mappings IS 'Maps custom 6-digit OTP codes to Supabase token hashes for hybrid verification';
COMMENT ON COLUMN public.otp_token_mappings.custom_otp IS 'User-facing 6-digit OTP code sent via email';
COMMENT ON COLUMN public.otp_token_mappings.token_hash IS 'Supabase hashed token for verification';
COMMENT ON COLUMN public.otp_token_mappings.expires_at IS 'When this OTP mapping expires (typically 1 hour)';
COMMENT ON COLUMN public.otp_token_mappings.used_at IS 'When this OTP was successfully used (null if unused)';