# Gmail SMTP Cloud Restriction Issue & Solution

## The Problem

Gmail restricts SMTP access from cloud providers and data centers for security reasons. This means you **cannot** send emails via Gmail's SMTP (`smtp.gmail.com:587`) from:
- AWS (where Supabase Edge Functions run)
- Google Cloud Platform
- Azure
- Most serverless/edge computing environments

### Error You'll See:
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

Even with correct credentials, Google blocks the connection from cloud IP addresses.

## Why This Happens

1. **Security Measure**: Google blocks high-volume cloud IPs to prevent spam
2. **App Password Limitations**: App Passwords work locally but not from cloud/serverless
3. **Geographic Restrictions**: Cloud data centers (like `eu-west-3`) are flagged

## The Solution: Use Resend API

We switched from Gmail SMTP to **Resend** - an email API service designed for serverless environments.

### Benefits of Resend:
- ✅ Works perfectly with Supabase Edge Functions
- ✅ No cloud/IP restrictions
- ✅ Better deliverability
- ✅ Built-in analytics
- ✅ Simple REST API (no SMTP complexity)
- ✅ Free tier: 3,000 emails/month

## Implementation

### Before (SMTP - Doesn't Work):
```typescript
const nodemailer = await import('npm:nodemailer@6.9.7');
const transporter = nodemailer.default.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: { user: "alo@eiteone.org", pass: "apppassword" },
});
await transporter.sendMail({ from, to, subject, html });
```

### After (Resend API - Works):
```typescript
const resendResponse = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${resendApiKey}`,
  },
  body: JSON.stringify({
    from: `${fromName} <${fromEmail}>`,
    to: [emailAddress],
    subject: subject,
    html: emailHtml,
  }),
});
```

## Environment Variables

Your Supabase secrets already include:
```bash
RESEND_API_KEY=re_xxxxx  # Your Resend API key
SMTP_FROM_EMAIL=alo@eiteone.org  # Still used as "from" address
SMTP_FROM_NAME=Alo—Sales  # Still used as "from" name
```

## Alternative Solutions (Not Recommended)

If you really need Gmail:

### 1. Use Gmail API (Complex)
- Requires OAuth2 setup
- More code complexity
- Better than SMTP but overkill

### 2. Use a Relay Server (Expensive)
- Set up your own SMTP relay on a VPS
- Add another service to maintain
- Not worth it for most use cases

### 3. SendGrid/Mailgun (Good Alternatives)
- Similar to Resend
- More expensive
- More complex API

## Testing

Both functions now use Resend:
- `send-visit-reminder` - Meeting reminders
- `send-waitlist-email` - Waitlist notifications (4 types)

Test by triggering either function - emails will now send successfully!

## Related Files

- `/supabase/functions/send-visit-reminder/index.ts`
- `/supabase/functions/send-waitlist-email/index.ts`

## References

- [Google's SMTP restrictions](https://support.google.com/mail/answer/7126229)
- [Resend Documentation](https://resend.com/docs)
- [Why Gmail blocks cloud providers](https://support.google.com/mail/?p=BadCredentials)
