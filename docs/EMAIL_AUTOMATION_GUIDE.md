# Email Automation Implementation Guide

## Current Status
❌ **Emails are NOT being sent automatically**

The waitlist system tracks everything in the database but doesn't send emails yet. You need to implement one of these solutions:

---

## Option 1: Supabase Edge Functions + Resend (Recommended)

**Best for**: Full control, customization, good deliverability

### Step 1: Install Resend
```bash
npm install resend
```

### Step 2: Get Resend API Key
1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Add to Supabase secrets or environment variables

### Step 3: Create Edge Function
```bash
# Create the function
npx supabase functions new send-waitlist-email
```

### Step 4: Implement the function
**File**: `supabase/functions/send-waitlist-email/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  try {
    const { event, data } = await req.json();

    let email;

    switch (event) {
      case "waitlist_joined":
        email = await sendWaitlistConfirmation(data);
        break;
      case "referral_success":
        email = await sendReferralSuccess(data);
        break;
      case "instant_access":
        email = await sendInstantAccess(data);
        break;
    }

    return new Response(JSON.stringify({ success: true, email }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

async function sendWaitlistConfirmation(data: any) {
  const referralUrl = `${Deno.env.get("APP_URL")}?ref=${data.referral_code}`;
  
  return await resend.emails.send({
    from: "Alo—Sales <hello@eiteone.org>",
    to: data.email,
    subject: `You're #${data.position} on the Alo—Sales Waitlist! 🎉`,
    html: `
      <h1>Welcome to Alo—Sales! 🎉</h1>
      <p>Hi ${data.full_name},</p>
      
      <p>You're officially on the waitlist!</p>
      
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; opacity: 0.9;">Your position</p>
        <h1 style="margin: 10px 0; font-size: 48px;">#${data.position}</h1>
        <p style="margin: 0; font-size: 14px; opacity: 0.9;">Estimated wait: 2-3 weeks</p>
      </div>

      <h2>⚡ Skip the Line!</h2>
      <p>Share your referral link and move up faster:</p>
      <ul>
        <li><strong>Each referral</strong> = Move up 10 positions</li>
        <li><strong>5 referrals</strong> = Instant Access! 🎉</li>
        <li><strong>10 referrals</strong> = Lifetime 20% discount</li>
      </ul>

      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0; font-weight: bold;">Your referral link:</p>
        <a href="${referralUrl}" style="color: #667eea; word-break: break-all;">${referralUrl}</a>
      </div>

      <p>Share on:</p>
      <p>
        <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(`Just joined the Alo—Sales waitlist! 🚀 Transform your sales process. Join me: ${referralUrl}`)}" style="margin-right: 10px;">Twitter</a> |
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}" style="margin-right: 10px;">LinkedIn</a> |
        <a href="https://wa.me/?text=${encodeURIComponent(`Check out Alo—Sales! ${referralUrl}`)}" style="margin-right: 10px;">WhatsApp</a>
      </p>

      <p>Questions? Reply to this email or contact us at hello@eiteone.org</p>

      <p>Best regards,<br>The Alo—Sales Team</p>
    `,
  });
}

async function sendReferralSuccess(data: any) {
  return await resend.emails.send({
    from: "Alo—Sales <hello@eiteone.org>",
    to: data.referrer.email,
    subject: "🎉 Your referral just joined!",
    html: `
      <h1>Great news! 🎉</h1>
      <p>Hi ${data.referrer.full_name},</p>
      
      <p>Someone just used your referral link to join the waitlist!</p>

      <div style="background: #10b981; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <p style="margin: 0;">New Position: <strong>#${data.referrer.position}</strong> (↑10)</p>
        <p style="margin: 10px 0 0 0;">Referrals: <strong>${data.referrer.referral_count} of 5</strong> for instant access</p>
      </div>

      ${data.referrer.referral_count >= 5 ? `
        <div style="background: #fbbf24; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin: 0 0 10px 0;">⚡ You've unlocked Instant Access!</h2>
          <p style="margin: 0;">You'll receive your invite code shortly.</p>
        </div>
      ` : `
        <p>${5 - data.referrer.referral_count} more referral${5 - data.referrer.referral_count !== 1 ? 's' : ''} for instant access!</p>
      `}

      <p>Keep sharing: <a href="${Deno.env.get("APP_URL")}?ref=${data.referrer.referral_code}">${Deno.env.get("APP_URL")}?ref=${data.referrer.referral_code}</a></p>

      <p>Best regards,<br>The Alo—Sales Team</p>
    `,
  });
}

async function sendInstantAccess(data: any) {
  return await resend.emails.send({
    from: "Alo—Sales <hello@eiteone.org>",
    to: data.email,
    subject: "🎊 Welcome to Alo—Sales! You're In!",
    html: `
      <h1>🎊 You're In!</h1>
      <p>Hi ${data.full_name},</p>
      
      <p>Congratulations! You've earned instant access to Alo—Sales.</p>

      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin: 20px 0;">
        <h2 style="margin: 0;">🏆 Gold Tier Unlocked</h2>
        <p style="margin: 10px 0 0 0;">You brought ${data.referral_count} people to Alo—Sales!</p>
      </div>

      <h2>What's Next?</h2>
      <ol>
        <li><a href="${Deno.env.get("APP_URL")}/auth">Create your account</a></li>
        <li>Set up your team</li>
        <li>Import your first leads</li>
        <li>Invite team members (you have 3 invite codes)</li>
      </ol>

      <p><strong>Need help?</strong> Our team is here:</p>
      <ul>
        <li>📧 hello@eiteone.org</li>
        <li>💬 WhatsApp: +265 99 655 4837</li>
      </ul>

      <p>Welcome aboard! 🚀</p>

      <p>Best regards,<br>The Alo—Sales Team</p>
    `,
  });
}
```

### Step 5: Deploy the function
```bash
npx supabase functions deploy send-waitlist-email --no-verify-jwt
```

### Step 6: Call from your app

Update `WaitlistForm.tsx` to call the edge function:

```typescript
// After successful waitlist insert
await supabase.functions.invoke('send-waitlist-email', {
  body: {
    event: 'waitlist_joined',
    data: waitlistData
  }
});
```

---

## Option 2: Database Triggers + Webhooks

**Best for**: Automatic emails without app code changes

1. Enable `pg_net` extension in Supabase
2. Run the `20250627000001_email_triggers.sql` migration
3. Create a webhook endpoint in your app
4. Handle webhook events and send emails

---

## Option 3: Client-Side (Simple but Limited)

**Best for**: Quick testing, not recommended for production

Call an email service directly from the form:

```typescript
// In WaitlistForm.tsx after submission
const response = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${RESEND_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from: 'hello@eiteone.org',
    to: formData.email,
    subject: 'Welcome to waitlist!',
    html: '...'
  })
});
```

⚠️ **Not recommended**: Exposes API keys, no server-side control

---

## Option 4: Third-Party Automation (Easiest)

**Best for**: No-code solution, quick setup

Use Zapier or Make.com:

1. Connect Supabase to Zapier
2. Trigger: New row in `waitlist` table
3. Action: Send email via Gmail/SendGrid/Mailgun
4. Map the fields

**Pros**: No coding required  
**Cons**: Costs money, less customization

---

## Email Templates Needed

You'll need emails for these events:

1. ✉️ **Waitlist Confirmation** - When someone joins
2. ✉️ **Referral Success** - When someone uses your link  
3. ✉️ **Position Update** - Every X referrals
4. ✉️ **Instant Access** - When hitting 5 referrals
5. ✉️ **You're Next** - When in top 50
6. ✉️ **Welcome** - When finally invited

Full templates are in `WAITLIST_REFERRAL_SYSTEM.md`

---

## Recommended Setup

For production, I recommend:

1. **Supabase Edge Functions** (Option 1)
2. **Resend** for email delivery
3. **Database triggers** to auto-call functions

This gives you:
- ✅ Automatic email sending
- ✅ Full customization
- ✅ Good deliverability  
- ✅ No exposed API keys
- ✅ Server-side control

---

## Quick Start (5 minutes)

```bash
# 1. Install Resend
npm install resend

# 2. Create edge function
npx supabase functions new send-waitlist-email

# 3. Add the code from above

# 4. Deploy
npx supabase functions deploy send-waitlist-email

# 5. Call from your form
```

**Want me to implement the full email system for you?** Let me know which option you prefer!
