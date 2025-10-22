-- Waitlist + Referral System Migration
-- This creates tables for invite-only waitlist with referral tracking

-- Waitlist table: tracks everyone who joins the waitlist
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  company_name TEXT,
  team_size TEXT,
  use_case TEXT,
  referral_code TEXT UNIQUE NOT NULL,
  referred_by UUID REFERENCES waitlist(id) ON DELETE SET NULL,
  position INTEGER,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'invited', 'signed_up', 'rejected')),
  referral_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invited_at TIMESTAMP WITH TIME ZONE,
  signed_up_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Invite codes table: tracks codes given to users to invite others
CREATE TABLE IF NOT EXISTS invite_codes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_by_waitlist UUID REFERENCES waitlist(id) ON DELETE CASCADE,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'revoked'))
);

-- Referrals table: tracks referral relationships and rewards
CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  referrer_id UUID REFERENCES waitlist(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES waitlist(id) ON DELETE CASCADE,
  reward_points INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(referrer_id, referee_id)
);

-- User invites allocation: tracks how many invites each user has
CREATE TABLE IF NOT EXISTS user_invites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  invites_total INTEGER DEFAULT 3,
  invites_remaining INTEGER DEFAULT 3,
  invites_sent INTEGER DEFAULT 0,
  invites_accepted INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_referral_code ON waitlist(referral_code);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_position ON waitlist(position);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at);
CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_invite_codes_status ON invite_codes(status);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee ON referrals(referee_id);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-character code from email hash + random
    code := UPPER(SUBSTRING(MD5(user_email || NOW()::TEXT || RANDOM()::TEXT) FROM 1 FOR 8));
    
    -- Check if code exists
    SELECT EXISTS(SELECT 1 FROM waitlist WHERE referral_code = code) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate waitlist position
CREATE OR REPLACE FUNCTION calculate_waitlist_position(waitlist_id UUID)
RETURNS INTEGER AS $$
DECLARE
  entry_created_at TIMESTAMP WITH TIME ZONE;
  entry_referral_count INTEGER;
  calculated_position INTEGER;
BEGIN
  -- Get entry details
  SELECT created_at, referral_count INTO entry_created_at, entry_referral_count
  FROM waitlist
  WHERE id = waitlist_id;
  
  -- Calculate position: count all entries created before this one
  -- minus bonus from referrals (10 positions per referral)
  SELECT COUNT(*) INTO calculated_position
  FROM waitlist
  WHERE status = 'waiting'
    AND (
      created_at < entry_created_at
      OR (created_at = entry_created_at AND id < waitlist_id)
    );
  
  -- Add 1 to make it 1-indexed, subtract referral bonus
  calculated_position := calculated_position + 1 - (entry_referral_count * 10);
  
  -- Ensure position is at least 1
  calculated_position := GREATEST(calculated_position, 1);
  
  RETURN calculated_position;
END;
$$ LANGUAGE plpgsql;

-- Function to process a referral
CREATE OR REPLACE FUNCTION process_referral(
  referrer_code TEXT,
  referee_id UUID
)
RETURNS JSONB AS $$
DECLARE
  referrer_record RECORD;
  new_referral_count INTEGER;
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
  
  -- Check if referrer should get instant access (5+ referrals)
  IF new_referral_count >= 5 THEN
    UPDATE waitlist
    SET status = 'invited',
        invited_at = NOW()
    WHERE id = referrer_record.id
      AND status = 'waiting';
  END IF;
  
  result := jsonb_build_object(
    'success', true,
    'referrer_id', referrer_record.id,
    'referrer_name', referrer_record.full_name,
    'new_referral_count', new_referral_count,
    'instant_access', new_referral_count >= 5
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to update all waitlist positions
CREATE OR REPLACE FUNCTION update_all_waitlist_positions()
RETURNS void AS $$
BEGIN
  UPDATE waitlist
  SET position = calculate_waitlist_position(id)
  WHERE status = 'waiting';
END;
$$ LANGUAGE plpgsql;

-- Trigger to update waitlist positions on insert
CREATE OR REPLACE FUNCTION trigger_update_waitlist_positions()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_all_waitlist_positions();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER waitlist_insert_trigger
AFTER INSERT ON waitlist
FOR EACH ROW
EXECUTE FUNCTION trigger_update_waitlist_positions();

-- Trigger to update waitlist positions on referral count change
CREATE TRIGGER waitlist_update_trigger
AFTER UPDATE OF referral_count ON waitlist
FOR EACH ROW
WHEN (OLD.referral_count IS DISTINCT FROM NEW.referral_count)
EXECUTE FUNCTION trigger_update_waitlist_positions();

-- Function to generate invite code for new users
CREATE OR REPLACE FUNCTION generate_invite_code(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate code format: INV-XXXXX-TIMESTAMP
    code := 'INV-' || UPPER(SUBSTRING(MD5(user_id::TEXT || NOW()::TEXT || RANDOM()::TEXT) FROM 1 FOR 5)) || '-' || EXTRACT(EPOCH FROM NOW())::INTEGER;
    
    -- Check if code exists
    SELECT EXISTS(SELECT 1 FROM invite_codes WHERE code = code) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to create invite codes for new users
CREATE OR REPLACE FUNCTION create_user_invite_codes(
  user_id UUID,
  num_codes INTEGER DEFAULT 3
)
RETURNS void AS $$
DECLARE
  i INTEGER;
  new_code TEXT;
BEGIN
  -- Create user_invites entry
  INSERT INTO user_invites (user_id, invites_total, invites_remaining)
  VALUES (user_id, num_codes, num_codes)
  ON CONFLICT (user_id) DO UPDATE
  SET invites_total = user_invites.invites_total + num_codes,
      invites_remaining = user_invites.invites_remaining + num_codes;
  
  -- Generate invite codes
  FOR i IN 1..num_codes LOOP
    new_code := generate_invite_code(user_id);
    INSERT INTO invite_codes (code, created_by, max_uses, expires_at)
    VALUES (new_code, user_id, 1, NOW() + INTERVAL '30 days');
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to validate and use invite code
CREATE OR REPLACE FUNCTION use_invite_code(
  code_to_use TEXT,
  user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  code_record RECORD;
  result JSONB;
BEGIN
  -- Find and lock the invite code
  SELECT * INTO code_record
  FROM invite_codes
  WHERE code = code_to_use
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > NOW())
    AND current_uses < max_uses
  FOR UPDATE;
  
  -- If code not found or invalid
  IF code_record.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invite code');
  END IF;
  
  -- Update code usage
  UPDATE invite_codes
  SET current_uses = current_uses + 1,
      used_by = user_id,
      used_at = NOW(),
      status = CASE WHEN current_uses + 1 >= max_uses THEN 'used' ELSE 'active' END
  WHERE id = code_record.id;
  
  -- Update user_invites for the creator
  IF code_record.created_by IS NOT NULL THEN
    UPDATE user_invites
    SET invites_accepted = invites_accepted + 1
    WHERE user_id = code_record.created_by;
  END IF;
  
  result := jsonb_build_object(
    'success', true,
    'code_id', code_record.id,
    'created_by', code_record.created_by
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get waitlist stats
CREATE OR REPLACE FUNCTION get_waitlist_stats()
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_waiting', COUNT(*) FILTER (WHERE status = 'waiting'),
    'total_invited', COUNT(*) FILTER (WHERE status = 'invited'),
    'total_signed_up', COUNT(*) FILTER (WHERE status = 'signed_up'),
    'total_rejected', COUNT(*) FILTER (WHERE status = 'rejected'),
    'total_referrals', (SELECT COUNT(*) FROM referrals),
    'avg_referrals_per_user', (SELECT AVG(referral_count) FROM waitlist WHERE status = 'waiting'),
    'top_referrers', (
      SELECT jsonb_agg(jsonb_build_object(
        'name', full_name,
        'email', email,
        'referrals', referral_count
      ) ORDER BY referral_count DESC)
      FROM (
        SELECT full_name, email, referral_count
        FROM waitlist
        WHERE referral_count > 0
        ORDER BY referral_count DESC
        LIMIT 10
      ) top
    )
  ) INTO stats
  FROM waitlist;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for waitlist
CREATE POLICY "Anyone can join waitlist" ON waitlist
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view waitlist entries" ON waitlist
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage all waitlist entries" ON waitlist
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.sys_role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.sys_role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for invite_codes
CREATE POLICY "Users can view their own invite codes" ON invite_codes
  FOR SELECT TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can create invite codes" ON invite_codes
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Admins can manage all invite codes" ON invite_codes
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.sys_role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for referrals
CREATE POLICY "Users can view their referrals" ON referrals
  FOR SELECT TO authenticated
  USING (
    referrer_id IN (SELECT id FROM waitlist WHERE email = auth.jwt()->>'email')
  );

CREATE POLICY "Admins can view all referrals" ON referrals
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.sys_role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for user_invites
CREATE POLICY "Users can view their own invites" ON user_invites
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own invites" ON user_invites
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all user invites" ON user_invites
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.sys_role IN ('admin', 'super_admin')
    )
  );

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION generate_referral_code TO anon, authenticated;
GRANT EXECUTE ON FUNCTION calculate_waitlist_position TO anon, authenticated;
GRANT EXECUTE ON FUNCTION process_referral TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_all_waitlist_positions TO anon, authenticated;
GRANT EXECUTE ON FUNCTION generate_invite_code TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_invite_codes TO authenticated;
GRANT EXECUTE ON FUNCTION use_invite_code TO authenticated;
GRANT EXECUTE ON FUNCTION get_waitlist_stats TO authenticated;

-- Initial data: Create some admin invite codes for testing
-- You can manually insert admin codes or generate them via the admin dashboard
