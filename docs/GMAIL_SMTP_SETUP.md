# Gmail SMTP Email Setup Guide

This guide explains how to set up Gmail's SMTP service for sending emails through your Supabase Edge Functions, replacing Resend with a more flexible, lightweight solution.

## Overview

We're using **Gmail's SMTP service** with the email: `alo@eiteone.org`

**Benefits:**
- ✅ More flexibility and control
- ✅ Fewer external API dependencies
- ✅ Lightweight solution
- ✅ Free for moderate email volumes (500 emails/day)
- ✅ Professional email from your domain

---

## Step 1: Set Up Gmail App Password

Since you're using `alo@eiteone.org` with Gmail, you need to generate an **App Password** for secure SMTP access.

### Instructions:

1. **Go to Google Account Settings**
   - Visit: https://myaccount.google.com/
   - Sign in with `alo@eiteone.org`

2. **Enable 2-Step Verification** (if not already enabled)
   - Navigate to: **Security** → **2-Step Verification**
   - Follow the prompts to enable it

3. **Generate App Password**
   - Go to: **Security** → **App passwords**
   - Select **Mail** and **Other (Custom name)**
   - Name it: `Alo Sales - Edge Functions`
   - Click **Generate**
   - **⚠️ IMPORTANT**: Copy the 16-character password immediately (it won't be shown again)
   - Example format: `abcd efgh ijkl mnop`

4. **Save the App Password Securely**
   - Store it in a password manager
   - You'll need this for the next step

---

## Step 2: Configure Supabase Environment Variables

Add the SMTP credentials to your Supabase project's secrets/environment variables.

### Via Supabase CLI:

```bash
# Set SMTP configuration
supabase secrets set SMTP_HOST=smtp.gmail.com
supabase secrets set SMTP_PORT=587
supabase secrets set SMTP_USER=alo@eiteone.org
supabase secrets set SMTP_PASSWORD="your-16-char-app-password-here"
supabase secrets set SMTP_FROM_EMAIL=alo@eiteone.org
supabase secrets set SMTP_FROM_NAME="Alo—Sales"
```

### Via Supabase Dashboard:

1. Go to your project at https://app.supabase.com
2. Navigate to **Settings** → **Edge Functions** → **Secrets**
3. Add the following secrets:

| Secret Name | Value |
|-------------|-------|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `alo@eiteone.org` |
| `SMTP_PASSWORD` | `your-16-char-app-password` |
| `SMTP_FROM_EMAIL` | `alo@eiteone.org` |
| `SMTP_FROM_NAME` | `Alo—Sales` |

### Optional: Remove Resend API Key

If you're no longer using Resend, you can remove the old key:

```bash
supabase secrets unset RESEND_API_KEY
```

---

## Step 3: Edge Functions Configuration

The edge functions have been updated to use **denomailer** library for SMTP support.

### What Changed:

#### 1. **Updated Dependencies**
```typescript
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
```

#### 2. **SMTP Client Initialization**
```typescript
const smtpClient = new SMTPClient({
  connection: {
    hostname: Deno.env.get("SMTP_HOST") || "smtp.gmail.com",
    port: parseInt(Deno.env.get("SMTP_PORT") || "587"),
    tls: true,
    auth: {
      username: Deno.env.get("SMTP_USER"),
      password: Deno.env.get("SMTP_PASSWORD"),
    },
  },
});
```

#### 3. **Sending Emails**
```typescript
await smtpClient.send({
  from: `${smtpFromName} <${smtpFromEmail}>`,
  to: recipientEmail,
  subject: "Your Subject",
  content: "auto",
  html: emailHtmlContent,
});

await smtpClient.close();
```

### Files Modified:
- ✅ `/supabase/functions/send-waitlist-email/index.ts`
- ✅ `/supabase/functions/send-visit-reminder/index.ts`

---

## Step 4: Deploy Updated Edge Functions

Deploy the updated functions to Supabase:

```bash
# Deploy waitlist email function
supabase functions deploy send-waitlist-email

# Deploy visit reminder function
supabase functions deploy send-visit-reminder
```

### Verify Deployment:

```bash
# List all deployed functions
supabase functions list

# Check function logs
supabase functions logs send-waitlist-email
supabase functions logs send-visit-reminder
```

---

## Step 5: Test the Email Functions

### Test Waitlist Email:

```bash
curl -i --location --request POST \
  'https://your-project-ref.supabase.co/functions/v1/send-waitlist-email' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"event":"waitlist_joined","data":{"email":"test@example.com","position":42,"referral_code":"ABC123","full_name":"Test User"}}'
```

### Test Visit Reminder:

```bash
curl -i --location --request POST \
  'https://your-project-ref.supabase.co/functions/v1/send-visit-reminder' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"to":"test@example.com","visitData":{"company_name":"Test Corp","contact_person":"John Doe","visit_type":"initial_visit","visit_datetime":"2025-10-24T10:00:00","rep_name":"Sales Rep","notes":"Test meeting"}}'
```

---

## Gmail SMTP Limits & Best Practices

### Daily Limits:
- **Free Gmail**: 500 emails per day
- **Google Workspace**: 2,000 emails per day (if you upgrade)

### Best Practices:

1. **Warm Up Your Email Domain**
   - Start with low email volumes
   - Gradually increase over time
   - This helps avoid spam filters

2. **Monitor Sending Reputation**
   - Check bounce rates
   - Avoid spammy content
   - Include unsubscribe links

3. **Handle Errors Gracefully**
   - Log failed emails
   - Implement retry logic for transient errors
   - Alert on repeated failures

4. **Rate Limiting**
   - Don't send all emails at once
   - Implement delays between bulk sends
   - Respect Gmail's limits

5. **Email Content Tips**
   - Use responsive HTML templates
   - Include plain text alternatives
   - Test on multiple email clients
   - Avoid spam trigger words

---

## Troubleshooting

### Common Issues:

#### 1. **Authentication Failed**
```
Error: Invalid login credentials
```
**Solution**: 
- Verify App Password is correct (no spaces)
- Ensure 2-Step Verification is enabled
- Regenerate App Password if needed

#### 2. **Connection Timeout**
```
Error: Connection timeout
```
**Solution**:
- Check SMTP_HOST is `smtp.gmail.com`
- Verify SMTP_PORT is `587` (not 465 or 25)
- Ensure Supabase can reach external SMTP servers

#### 3. **Rate Limit Exceeded**
```
Error: Daily sending quota exceeded
```
**Solution**:
- Wait 24 hours for quota reset
- Consider upgrading to Google Workspace
- Implement email queuing system

#### 4. **Emails Going to Spam**
```
Emails delivered but in spam folder
```
**Solution**:
- Set up SPF, DKIM, DMARC records for eiteone.org
- Improve email content (less promotional language)
- Ask recipients to whitelist your address

#### 5. **SMTP Client Not Closing**
```
Warning: SMTP connection left open
```
**Solution**:
- Always call `await smtpClient.close()` after sending
- Use try-finally blocks to ensure cleanup

---

## Email Templates

All email templates remain the same. The only change is the delivery method (SMTP instead of Resend API).

### Available Email Types:

1. **Waitlist Joined** - Welcome email with referral link
2. **Referral Success** - Notification when someone uses referral
3. **Instant Access** - Unlock email at 5 referrals
4. **Position Update** - Periodic position updates
5. **Visit Reminder** - Meeting reminder emails

---

## Migration from Resend

### What Was Changed:

| Before (Resend) | After (Gmail SMTP) |
|-----------------|-------------------|
| `RESEND_API_KEY` | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` |
| `fetch()` to Resend API | `SMTPClient.send()` |
| `from: "Alo—Sales <onboarding@resend.dev>"` | `from: "Alo—Sales <alo@eiteone.org>"` |
| No connection management | Explicit `connect()` and `close()` |

### Benefits of This Change:

✅ **More Control**: Direct SMTP access, no API intermediaries  
✅ **Cost Savings**: Free for moderate volumes  
✅ **Flexibility**: Can easily switch providers later  
✅ **Simplicity**: Fewer external dependencies  
✅ **Professional**: Emails from your actual domain

---

## Monitoring & Maintenance

### Check Function Logs:

```bash
# Real-time logs
supabase functions logs send-waitlist-email --tail

# Recent logs
supabase functions logs send-visit-reminder --limit 50
```

### Monitor Email Delivery:

1. **Check Supabase Function Logs** for SMTP errors
2. **Monitor Gmail Account** for bounce notifications
3. **Track Database Notifications Table** for sent emails
4. **Set Up Alerts** for function failures

### Regular Maintenance:

- [ ] Review email bounce rates monthly
- [ ] Rotate App Password every 6 months
- [ ] Update email templates based on user feedback
- [ ] Monitor daily sending volume
- [ ] Check spam reports

---

## Next Steps

1. ✅ Generate Gmail App Password
2. ✅ Add environment variables to Supabase
3. ✅ Deploy updated edge functions
4. ✅ Test email sending
5. ✅ Monitor first batch of emails
6. ⏳ Set up SPF/DKIM/DMARC for better deliverability (optional but recommended)

---

## Support

If you encounter issues:

1. Check Supabase Edge Function logs
2. Verify Gmail App Password is valid
3. Test SMTP connection manually
4. Review Gmail's SMTP documentation: https://support.google.com/a/answer/176600
5. Check this guide's troubleshooting section

---

**Setup Complete!** 🎉

Your edge functions are now using Gmail's SMTP service for sending emails. All emails will be sent from `alo@eiteone.org` with full control and flexibility.
