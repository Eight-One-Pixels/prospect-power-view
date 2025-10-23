# Gmail SMTP Quick Start Guide

**Quick reference for switching from Resend to Gmail SMTP**

## 🚀 Quick Setup (5 Minutes)

### 1. Generate Gmail App Password
```
1. Go to: https://myaccount.google.com/security
2. Enable 2-Step Verification (if not already)
3. Go to: App passwords
4. Create new: Mail → Other (Custom) → "Alo Sales"
5. Copy the 16-character password
```

### 2. Set Supabase Secrets
```bash
supabase secrets set SMTP_HOST=smtp.gmail.com
supabase secrets set SMTP_PORT=587
supabase secrets set SMTP_USER=alo@eiteone.org
supabase secrets set SMTP_PASSWORD="xxxx xxxx xxxx xxxx"
supabase secrets set SMTP_FROM_EMAIL=alo@eiteone.org
supabase secrets set SMTP_FROM_NAME="Alo—Sales"
```

### 3. Deploy Functions
```bash
supabase functions deploy send-waitlist-email
supabase functions deploy send-visit-reminder
```

### 4. Test
```bash
# Check logs
supabase functions logs send-waitlist-email --tail
```

## ✅ What's Updated

- ✅ Both edge functions now use Gmail SMTP
- ✅ Emails sent from: `alo@eiteone.org`
- ✅ No more Resend API dependency
- ✅ Same email templates, just different delivery

## 📊 Limits

- **Free Gmail**: 500 emails/day
- **Google Workspace**: 2,000 emails/day

## 🔧 Files Modified

```
supabase/functions/send-waitlist-email/index.ts
supabase/functions/send-visit-reminder/index.ts
```

## 📚 Full Documentation

See `GMAIL_SMTP_SETUP.md` for complete guide with troubleshooting.

---

**That's it!** Your edge functions now use Gmail SMTP for sending emails.
