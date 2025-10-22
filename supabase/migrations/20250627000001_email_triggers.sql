-- Database Trigger + Webhook for Email Automation
-- This adds triggers to automatically send webhooks when events happen

-- 1. Create a webhook notification function
CREATE OR REPLACE FUNCTION notify_webhook_waitlist_event()
RETURNS TRIGGER AS $$
DECLARE
  payload JSONB;
  webhook_url TEXT := 'https://your-domain.com/api/webhooks/waitlist'; -- Replace with your endpoint
BEGIN
  -- Build payload based on trigger event
  IF TG_OP = 'INSERT' THEN
    payload := jsonb_build_object(
      'event', 'waitlist_joined',
      'data', row_to_json(NEW)
    );
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'invited' AND OLD.status != 'invited' THEN
    payload := jsonb_build_object(
      'event', 'instant_access_granted',
      'data', row_to_json(NEW)
    );
  END IF;

  -- Send to your webhook endpoint (you'll need to set this up)
  -- This uses pg_net extension or http extension
  PERFORM
    net.http_post(
      url := webhook_url,
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := payload
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create trigger for new waitlist entries
CREATE TRIGGER on_waitlist_insert_send_email
  AFTER INSERT ON waitlist
  FOR EACH ROW
  EXECUTE FUNCTION notify_webhook_waitlist_event();

-- 3. Create trigger for status changes (instant access)
CREATE TRIGGER on_waitlist_status_change_send_email
  AFTER UPDATE OF status ON waitlist
  FOR EACH ROW
  WHEN (NEW.status = 'invited' AND OLD.status != 'invited')
  EXECUTE FUNCTION notify_webhook_waitlist_event();

-- 4. Create function to track referral notifications
CREATE OR REPLACE FUNCTION notify_referral_success()
RETURNS TRIGGER AS $$
DECLARE
  referrer_record RECORD;
  webhook_url TEXT := 'https://your-domain.com/api/webhooks/referral'; -- Replace with your endpoint
BEGIN
  -- Get referrer details
  SELECT * INTO referrer_record
  FROM waitlist
  WHERE id = NEW.referrer_id;

  -- Send notification
  PERFORM
    net.http_post(
      url := webhook_url,
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := jsonb_build_object(
        'event', 'referral_success',
        'referrer', row_to_json(referrer_record),
        'referee_id', NEW.referee_id
      )
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger for new referrals
CREATE TRIGGER on_referral_insert_send_email
  AFTER INSERT ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION notify_referral_success();

-- Note: You'll need to enable the pg_net or http extension first:
-- CREATE EXTENSION IF NOT EXISTS pg_net;
