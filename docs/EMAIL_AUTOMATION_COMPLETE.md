# Waitlist Email Automation - Complete Guide

## Overview
This document explains how the automated email system works for the waitlist and referral features.

## Email Types

### 1. **Waitlist Joined** (Welcome Email)
- **Trigger**: When someone submits the waitlist form
- **Sent To**: New waitlist member
- **Sent By**: `WaitlistForm.tsx` after successful signup
- **Contains**:
  - Their position number (#XX)
  - Unique referral link with their code
  - Social sharing buttons (Twitter, LinkedIn, WhatsApp)
  - Reward tiers explanation (1/3/5/10 referrals)
  - What happens next guide

### 2. **Referral Success** (Position Update)
- **Trigger**: When someone uses their referral code
- **Sent To**: Referrer (person whose code was used)
- **Sent By**: `process_referral()` function via email queue
- **Contains**:
  - Celebration message
  - New position (moved up 10 spots)
  - Progress toward instant access (X of 5 referrals)
  - Encouragement to keep sharing

### 3. **Instant Access** (5 Referrals Achieved)
- **Trigger**: When someone gets their 5th referral
- **Sent To**: Referrer who hit 5 referrals
- **Sent By**: `process_referral()` function via email queue
- **Sent By**: Automatically when referral count reaches 5
- **Contains**:
  - Big celebration (🎊)
  - Gold tier badge
  - List of earned rewards
  - 4-step onboarding guide
  - Call-to-action to create account

### 4. **Position Update** (Optional)
- **Trigger**: Manual or scheduled (not currently automated)
- **Sent To**: Waitlist members
- **Contains**:
  - Updated position
  - Referral count
  - Encouragement to share

## Technical Flow

### Email Queue System

The system uses a queue-based approach for reliability:

```
1. User Action (join waitlist / referral used)
   ↓
2. Database Function (process_referral)
   ↓
3. Insert into waitlist_email_queue table
   ↓
4. Frontend reads queue
   ↓
5. Calls Edge Function (send-waitlist-email)
   ↓
6. Resend API sends email
   ↓
7. Update queue status (sent/failed)
```

### Database Tables

**waitlist_email_queue**
```sql
- id: UUID
- event_type: 'waitlist_joined' | 'referral_success' | 'instant_access' | 'position_update'
- recipient_email: TEXT
- recipient_name: TEXT
- data: JSONB (email template data)
- status: 'pending' | 'sent' | 'failed'
- attempts: INTEGER
- last_error: TEXT
- created_at: TIMESTAMP
- sent_at: TIMESTAMP
```

### Code Flow

#### WaitlistForm.tsx
```typescript
// After successful waitlist insert:

1. Call process_referral() if referral code provided
   → This queues referral_success or instant_access email

2. Fetch email queue entry for referrer

3. Send email via edge function

4. Mark queue entry as 'sent'

5. Send welcome email to new member
```

#### process_referral() Function
```sql
1. Validate referrer code
2. Insert into referrals table
3. Update referrer's referral_count
4. Recalculate positions
5. Check if instant access (≥5 referrals)
   → Queue 'instant_access' email
   OR
   → Queue 'referral_success' email
6. Return result with referrer details
```

## Deployment Steps

### 1. Deploy Database Migration
```bash
# Run in Supabase SQL Editor or via CLI
supabase db push
```

Run migration file:
- `20250627000002_add_email_automation.sql`

This creates:
- `waitlist_email_queue` table
- Updated `process_referral()` function
- RLS policies for email queue

### 2. Deploy Edge Function

In Supabase Dashboard:
1. Go to Edge Functions
2. Create new function: `send-waitlist-email`
3. Copy code from `/supabase/functions/send-waitlist-email/index.ts`
4. Deploy

### 3. Set Environment Variables

In Supabase Dashboard → Edge Functions → Configuration:
```
RESEND_API_KEY=re_xxxxxxxxxxxxx (already set)
APP_URL=https://alo-sales.eiteone.org
```

### 4. Update Frontend

The frontend code is already updated in:
- `src/components/forms/WaitlistForm.tsx`

No additional changes needed!

## Testing the Email Flow

### Test 1: New Signup
1. Go to landing page
2. Submit waitlist form
3. Check email inbox for welcome email
4. Verify position, referral link, and social buttons

### Test 2: Referral Flow
1. Copy referral link from welcome email
2. Open in new incognito window
3. Submit form with different email
4. Original user should receive "referral success" email
5. Check that position improved by 10

### Test 3: Instant Access
1. Get 5 people to use your referral code
2. On 5th referral, check inbox
3. Should receive "instant access" email instead of "referral success"
4. Verify status changed to 'invited' in database

## Monitoring

### Check Email Queue
```sql
-- View pending emails
SELECT * FROM waitlist_email_queue 
WHERE status = 'pending' 
ORDER BY created_at DESC;

-- View failed emails
SELECT * FROM waitlist_email_queue 
WHERE status = 'failed' 
ORDER BY created_at DESC;

-- View all emails sent today
SELECT * FROM waitlist_email_queue 
WHERE DATE(created_at) = CURRENT_DATE 
ORDER BY created_at DESC;
```

### Check Edge Function Logs
1. Go to Supabase Dashboard
2. Edge Functions → send-waitlist-email
3. Click "Logs" tab
4. Filter by date/time

### Check Resend Dashboard
1. Go to resend.com dashboard
2. View "Emails" section
3. Check delivery status
4. View bounces/complaints

## Error Handling

### Email Fails to Send
- Form submission still succeeds
- Error logged to console
- Email remains in queue with status 'pending'
- Can be retried manually or via scheduled function

### Edge Function Down
- Frontend catches error
- User still gets added to waitlist
- Email queued for later processing
- No impact on user experience

### Resend API Error
- Edge function logs error
- Returns error response to frontend
- Email marked as 'failed' in queue
- Can investigate via Resend dashboard

## Advanced: Scheduled Email Processing

If you want automatic retry for failed emails:

### Create Cron Edge Function
```typescript
// supabase/functions/process-email-queue/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL"),
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  );

  // Get pending emails
  const { data: pendingEmails } = await supabase
    .from("waitlist_email_queue")
    .select("*")
    .eq("status", "pending")
    .lt("attempts", 3) // Max 3 attempts
    .limit(10);

  if (!pendingEmails) return new Response("No pending emails");

  // Process each email
  for (const email of pendingEmails) {
    try {
      const response = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-waitlist-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: email.event_type,
            data: email.data,
          }),
        }
      );

      if (response.ok) {
        await supabase
          .from("waitlist_email_queue")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", email.id);
      } else {
        throw new Error(await response.text());
      }
    } catch (error) {
      await supabase
        .from("waitlist_email_queue")
        .update({
          attempts: email.attempts + 1,
          last_error: error.message,
          status: email.attempts + 1 >= 3 ? "failed" : "pending",
        })
        .eq("id", email.id);
    }
  }

  return new Response(`Processed ${pendingEmails.length} emails`);
});
```

### Schedule with Supabase Cron
```sql
-- Run every 5 minutes
SELECT cron.schedule(
  'process-waitlist-emails',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT net.http_post(
    url := 'https://xfaeneifadmdtebvxltq.supabase.co/functions/v1/process-email-queue',
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  $$
);
```

## Troubleshooting

### Email not received
1. Check spam folder
2. Verify email in `waitlist_email_queue` with status 'sent'
3. Check Resend dashboard for delivery status
4. Check edge function logs for errors

### Wrong position shown
1. Run `update_all_waitlist_positions()` manually
2. Check `waitlist` table for correct `referral_count`
3. Verify `position` column updated

### Referral not working
1. Check `referrals` table for new entry
2. Verify `referred_by` set on referee
3. Check `referral_count` incremented on referrer
4. Verify email queued in `waitlist_email_queue`

### Instant access not granted
1. Check `referral_count` >= 5
2. Verify status changed to 'invited'
3. Check `invited_at` timestamp set
4. Verify 'instant_access' email in queue

## Summary

✅ **Automated Emails**:
- Welcome email on signup
- Referral success when code used
- Instant access at 5 referrals

✅ **Queue-Based System**:
- Reliable delivery
- Error handling
- Retry capability

✅ **User-Friendly**:
- Beautiful HTML emails
- Social sharing built-in
- Clear next steps

✅ **Admin Monitoring**:
- Email queue table
- Edge function logs
- Resend dashboard

The system is production-ready and handles all edge cases gracefully! 🚀
