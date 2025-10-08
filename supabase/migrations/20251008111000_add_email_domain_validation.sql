-- Function to validate email domain
CREATE OR REPLACE FUNCTION validate_email_domain()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if email ends with '@marmelab.com'
    IF NEW.email IS NOT NULL AND NEW.email !~ '@marmelab\.com$' THEN
        RAISE EXCEPTION 'Email must end with @marmelab.com domain'
            USING ERRCODE = 'check_violation',
                  HINT = 'Only @marmelab.com email addresses are allowed';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on auth.users table
CREATE TRIGGER validate_user_email_domain
    BEFORE INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION validate_email_domain();
