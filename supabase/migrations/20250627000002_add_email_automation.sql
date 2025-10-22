-- Migration to add automatic email sending for referral events
-- This updates the process_referral function to queue email notifications

-- Create email queue table for async processing
CREATE TABLE IF NOT EXISTS waitlist_email_queue (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('waitlist_joined', 'referral_success', 'instant_access', 'position_update')),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  data JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  attempts INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Create index for processing queue
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON waitlist_email_queue(status, created_at);

-- Enable RLS
ALTER TABLE waitlist_email_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policy for admins only
CREATE POLICY "Admins can manage email queue" ON waitlist_email_queue
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.sys_role IN ('admin', 'super_admin')
    )
  );

-- Updated process_referral function with email queue
CREATE OR REPLACE FUNCTION process_referral(
  referrer_code TEXT,
  referee_id UUID
)
RETURNS JSONB AS $$
DECLARE
  referrer_record RECORD;
  new_referral_count INTEGER;
  new_position INTEGER;
  result JSONB;
BEGIN
  -- Find referrer by code
  SELECT id, referral_count, full_name, email INTO referrer_record
  FROM waitlist
  WHERE referral_code = referrer_code
    AND status IN ('waiting', 'invited');
  
  -- If referrer not found or invalid, return error
  IF referrer_record.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid referral code');
  END IF;
  
  -- Insert referral relationship
  INSERT INTO referrals (referrer_id, referee_id, reward_points)
  VALUES (referrer_record.id, referee_id, 10)
  ON CONFLICT (referrer_id, referee_id) DO NOTHING;
  
  -- Update referrer's referral count
  UPDATE waitlist
  SET referral_count = referral_count + 1
  WHERE id = referrer_record.id
  RETURNING referral_count INTO new_referral_count;
  
  -- Update referee's referred_by
  UPDATE waitlist
  SET referred_by = referrer_record.id
  WHERE id = referee_id;
  
  -- Recalculate positions for all waiting entries
  PERFORM update_all_waitlist_positions();
  
  -- Get referrer's new position
  SELECT position INTO new_position
  FROM waitlist
  WHERE id = referrer_record.id;
  
  -- Check if referrer should get instant access (5+ referrals)
  IF new_referral_count >= 5 THEN
    UPDATE waitlist
    SET status = 'invited',
        invited_at = NOW()
    WHERE id = referrer_record.id
      AND status = 'waiting';
    
    -- Queue instant access email
    INSERT INTO waitlist_email_queue (event_type, recipient_email, recipient_name, data)
    VALUES (
      'instant_access',
      referrer_record.email,
      referrer_record.full_name,
      jsonb_build_object(
        'email', referrer_record.email,
        'full_name', referrer_record.full_name,
        'position', new_position,
        'referral_code', referrer_code,
        'referral_count', new_referral_count
      )
    );
    
  ELSE
    -- Queue referral success email
    INSERT INTO waitlist_email_queue (event_type, recipient_email, recipient_name, data)
    VALUES (
      'referral_success',
      referrer_record.email,
      referrer_record.full_name,
      jsonb_build_object(
        'email', referrer_record.email,
        'full_name', referrer_record.full_name,
        'position', new_position,
        'referral_code', referrer_code,
        'referral_count', new_referral_count
      )
    );
  END IF;
  
  result := jsonb_build_object(
    'success', true,
    'referrer_id', referrer_record.id,
    'referrer_name', referrer_record.full_name,
    'referrer_email', referrer_record.email,
    'new_referral_count', new_referral_count,
    'new_position', new_position,
    'instant_access', new_referral_count >= 5,
    'email_queued', true
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION process_referral TO anon, authenticated;
