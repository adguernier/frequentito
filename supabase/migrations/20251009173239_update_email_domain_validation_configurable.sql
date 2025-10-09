-- Create a configuration table for email domain validation
CREATE TABLE IF NOT EXISTS public.app_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop the old trigger and function
DROP TRIGGER IF EXISTS validate_user_email_domain ON auth.users;
DROP FUNCTION IF EXISTS validate_email_domain();

-- Create updated function that reads from configuration table
CREATE OR REPLACE FUNCTION validate_email_domain()
RETURNS TRIGGER AS $$
DECLARE
    allowed_domain TEXT;
BEGIN
    -- Get the allowed domain from configuration
    SELECT value INTO allowed_domain 
    FROM public.app_config 
    WHERE key = 'allowed_email_domain';
    
    -- If no configuration found, raise an error
    IF allowed_domain IS NULL THEN
        RAISE EXCEPTION 'Email domain configuration not found'
            USING ERRCODE = 'configuration_error',
                  HINT = 'The allowed_email_domain must be configured in app_config table';
    END IF;
    
    -- Check if email ends with the allowed domain
    IF NEW.email IS NOT NULL AND NEW.email !~ ('@' || allowed_domain || '$') THEN
        RAISE EXCEPTION 'Email must end with @% domain', allowed_domain
            USING ERRCODE = 'check_violation',
                  HINT = 'Only @' || allowed_domain || ' email addresses are allowed';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER validate_user_email_domain
    BEFORE INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION validate_email_domain();

-- Enable Row Level Security
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT ON public.app_config TO authenticated;
GRANT SELECT ON public.app_config TO anon;

-- Create RLS policies
-- Allow everyone to read configuration (needed for email validation)
CREATE POLICY "Allow read access to app_config" ON public.app_config
    FOR SELECT
    USING (true);

-- Only allow service_role to insert/update/delete configuration
CREATE POLICY "Only service_role can modify app_config" ON public.app_config
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
