-- Create table for logging all email attempts
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_email TEXT NOT NULL,
    sender_email TEXT,
    subject TEXT NOT NULL,
    template_type TEXT, -- 'otp_verification', 'password_reset', 'welcome', etc.
    email_provider TEXT DEFAULT 'resend', -- 'resend', 'supabase', 'sendgrid', etc.
    
    -- Email content metadata
    html_content TEXT, -- Store full HTML for debugging
    text_content TEXT, -- Plain text version if available
    
    -- Delivery tracking
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'bounced', 'failed', 'clicked', 'opened'
    external_id TEXT, -- Provider's message ID (Resend ID, etc.)
    error_message TEXT, -- Error details if failed
    
    -- Additional metadata
    user_id UUID, -- If associated with a specific user
    ip_address INET, -- IP that triggered the email
    user_agent TEXT, -- Browser info
    metadata JSONB DEFAULT '{}', -- Additional context data
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE, -- When actually sent to provider
    delivered_at TIMESTAMP WITH TIME ZONE, -- When marked as delivered
    opened_at TIMESTAMP WITH TIME ZONE, -- When user opened email
    clicked_at TIMESTAMP WITH TIME ZONE, -- When user clicked link
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON public.email_logs (recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs (status);
CREATE INDEX IF NOT EXISTS idx_email_logs_template_type ON public.email_logs (template_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON public.email_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON public.email_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_external_id ON public.email_logs (external_id);

-- Add RLS policies
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view email logs
CREATE POLICY "Admins can view all email logs"
    ON public.email_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid()
            AND up.role = 'admin'
        )
    );

-- Policy: Only the system can insert email logs (via service role)
CREATE POLICY "System can insert email logs"
    ON public.email_logs
    FOR INSERT
    WITH CHECK (true); -- Restricted by service role usage

-- Policy: Only the system can update email logs
CREATE POLICY "System can update email logs"
    ON public.email_logs
    FOR UPDATE
    WITH CHECK (true); -- Restricted by service role usage

-- Add updated_at trigger
CREATE TRIGGER update_email_logs_updated_at
    BEFORE UPDATE ON public.email_logs
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Add cleanup function to remove old email logs (keep 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_email_logs()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM public.email_logs 
    WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;

-- Add comment
COMMENT ON TABLE public.email_logs IS 'Comprehensive logging for all email attempts and delivery tracking';