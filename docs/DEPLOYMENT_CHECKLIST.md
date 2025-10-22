# Waitlist Email Automation - Deployment Checklist

## ✅ Pre-Deployment Checklist

### Database
- [ ] Run migration: `20250627000002_add_email_automation.sql` in Supabase SQL Editor
- [ ] Verify `waitlist_email_queue` table created
- [ ] Check that `process_referral()` function updated
- [ ] Test RLS policies working correctly

### Edge Function
- [ ] Copy code from `/supabase/functions/send-waitlist-email/index.ts`
- [ ] Create new edge function in Supabase Dashboard
- [ ] Name it: `send-waitlist-email`
- [ ] Deploy the function
- [ ] Set `APP_URL` environment variable: `https://alo-sales.eiteone.org`
- [ ] Verify `RESEND_API_KEY` already set

### Frontend
- [ ] Code already updated in `WaitlistForm.tsx`
- [ ] No additional changes needed
- [ ] Build and deploy: `npm run build`

## 🧪 Testing Checklist

### Test 1: Welcome Email
- [ ] Submit waitlist form with new email
- [ ] Verify email received within 1 minute
- [ ] Check position number displayed correctly
- [ ] Click referral link - should have `?ref=CODE` parameter
- [ ] Test social share buttons work

### Test 2: Referral Email (First Referral)
- [ ] Copy referral link from welcome email
- [ ] Open in incognito/private window
- [ ] Submit form with different email
- [ ] Check original user's inbox
- [ ] Should receive "referral success" email
- [ ] Position should show moved up 10 spots
- [ ] Should show "4 more for instant access"

### Test 3: Instant Access Email (5th Referral)
- [ ] Get 5 people to use referral code (or test with 5 different emails)
- [ ] On 5th signup, original user should receive "instant access" email
- [ ] Email should have gold tier badge
- [ ] Should show rewards list
- [ ] Status in database should be 'invited'

### Test 4: Error Handling
- [ ] Submit form with invalid referral code - should still work
- [ ] Check console logs for email errors (should be caught gracefully)
- [ ] Verify user still added to waitlist even if email fails

## 📊 Post-Deployment Monitoring

### Day 1
- [ ] Check Supabase Edge Function logs for errors
- [ ] Monitor Resend dashboard for email delivery
- [ ] Query email queue: `SELECT * FROM waitlist_email_queue WHERE status = 'failed'`
- [ ] Verify no failed emails in queue

### Week 1
- [ ] Check total emails sent: `SELECT COUNT(*) FROM waitlist_email_queue WHERE status = 'sent'`
- [ ] Review bounce rate in Resend dashboard
- [ ] Check for any spam complaints
- [ ] Monitor referral conversion rate

## 🔧 Maintenance Tasks

### Weekly
- [ ] Review failed emails in queue
- [ ] Check for stuck 'pending' emails
- [ ] Monitor Resend quota usage
- [ ] Review top referrers

### Monthly
- [ ] Clean up old queue entries (optional)
- [ ] Review email template performance
- [ ] Check for any user feedback on emails
- [ ] Update email templates if needed

## 📝 SQL Queries for Monitoring

### Check pending emails
```sql
SELECT * FROM waitlist_email_queue 
WHERE status = 'pending' 
ORDER BY created_at DESC;
```

### Check failed emails
```sql
SELECT event_type, recipient_email, last_error, attempts
FROM waitlist_email_queue 
WHERE status = 'failed' 
ORDER BY created_at DESC;
```

### Email stats for today
```sql
SELECT 
  event_type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'sent') as sent,
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  COUNT(*) FILTER (WHERE status = 'pending') as pending
FROM waitlist_email_queue 
WHERE DATE(created_at) = CURRENT_DATE
GROUP BY event_type;
```

### Top referrers this week
```sql
SELECT 
  full_name,
  email,
  referral_count,
  position,
  status
FROM waitlist
WHERE created_at >= NOW() - INTERVAL '7 days'
  AND referral_count > 0
ORDER BY referral_count DESC
LIMIT 10;
```

## 🚨 Troubleshooting

### Emails not sending?
1. Check edge function logs in Supabase Dashboard
2. Verify `RESEND_API_KEY` set correctly
3. Check Resend dashboard for API errors
4. Query email queue for pending/failed entries

### Wrong position calculated?
1. Run manually: `SELECT update_all_waitlist_positions();`
2. Check referral_count matches referrals table
3. Verify position calculation logic

### Referral not tracked?
1. Check `referrals` table for new entry
2. Verify referral code is valid
3. Check `referred_by` column updated
4. Verify email queued

## 📧 Contact Information

**Support:**
- Email: hello@eiteone.org
- WhatsApp: +265 99 655 4837

**Resend Support:**
- Dashboard: https://resend.com/
- Docs: https://resend.com/docs

**Supabase Support:**
- Dashboard: https://supabase.com/dashboard
- Docs: https://supabase.com/docs

---

## ✨ What You've Built

**Complete Email Automation System:**
✅ Welcome emails on signup
✅ Referral success notifications
✅ Instant access celebration emails
✅ Queue-based reliability
✅ Beautiful HTML templates
✅ Social sharing integration
✅ Error handling & monitoring

**Everything is ready to go live! 🚀**
