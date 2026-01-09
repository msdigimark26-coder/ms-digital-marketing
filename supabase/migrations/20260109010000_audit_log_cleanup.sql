-- Function to clean up old logs and storage
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  -- 1. Delete DB logs older than 3 days
  DELETE FROM public.admin_login_logs
  WHERE created_at < (now() - INTERVAL '3 days');

  -- 2. Delete Storage objects older than 3 days in the admin_logs bucket
  -- Note: This requires permissions on storage.objects which the postgres role usually has
  DELETE FROM storage.objects
  WHERE bucket_id = 'admin_logs'
    AND created_at < (now() - INTERVAL '3 days');
END;
$$ LANGUAGE plpgsql;

-- Attempt to schedule with pg_cron if available (Standard on Supabase)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Schedule to run every day at midnight
    -- Check if job exists first to avoid duplicates
    IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup_audit_logs_job') THEN
        PERFORM cron.schedule('cleanup_audit_logs_job', '0 0 * * *', 'SELECT cleanup_old_audit_logs()');
    END IF;
  END IF;
END
$$;
