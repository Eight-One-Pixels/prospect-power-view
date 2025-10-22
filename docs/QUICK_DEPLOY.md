# 🚀 Quick Deployment Guide - Email Automation

## 3 Steps to Deploy

### Step 1: Database (2 minutes)
```sql
-- Go to Supabase SQL Editor
-- Copy/paste from: supabase/migrations/20250627000002_add_email_automation.sql
-- Click "Run"
```
✅ Creates email queue table  
✅ Updates referral function

---

### Step 2: Edge Function (3 minutes)
1. Supabase Dashboard → Edge Functions → Create
2. Name: `send-waitlist-email`
3. Copy code from: `supabase/functions/send-waitlist-email/index.ts`
4. Paste and Deploy
5. Add environment variable:
   - Key: `APP_URL`
   - Value: `https://alo-sales.eiteone.org`

✅ Email sending enabled

---

### Step 3: Deploy Frontend (1 minute)
```bash
npm run build
# Deploy to your hosting
```
✅ WaitlistForm already updated  
✅ Email calls integrated

---

## ✅ Test It

1. Submit waitlist form → Check email
2. Use referral link → Check original email
3. Done! 🎉

---

## 📧 Email Types Enabled

| Email | Trigger | Recipient |
|-------|---------|-----------|
| **Welcome** | Signup | New member |
| **Referral Success** | Code used | Referrer |
| **Instant Access** | 5 referrals | Referrer |

---

## 🔍 Monitor

**Email Queue:**
```sql
SELECT * FROM waitlist_email_queue ORDER BY created_at DESC LIMIT 10;
```

**Edge Logs:**  
Supabase → Functions → send-waitlist-email → Logs

**Resend:**  
https://resend.com/emails

---

## 🆘 Troubleshooting

**No email?**
- Check spam folder
- Check edge function logs
- Check Resend dashboard

**Wrong position?**
```sql
SELECT update_all_waitlist_positions();
```

**Referral not working?**
- Verify code in waitlist table
- Check referrals table
- Check email queue

---

## 📞 Support
hello@eiteone.org | +265 99 655 4837

---

**That's it! You're live! 🚀**
