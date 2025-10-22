-- Fix Row Level Security for Waitlist Table
-- Run this in your Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can join waitlist" ON waitlist;
DROP POLICY IF EXISTS "Users can view their own waitlist entry" ON waitlist;
DROP POLICY IF EXISTS "Admins can view all waitlist entries" ON waitlist;

-- Allow anonymous and authenticated users to insert
CREATE POLICY "Anyone can join waitlist" ON waitlist
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Allow anyone to read waitlist entries (needed for referral code validation)
CREATE POLICY "Anyone can view waitlist entries" ON waitlist
  FOR SELECT TO anon, authenticated
  USING (true);

-- Allow admins to do everything
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
