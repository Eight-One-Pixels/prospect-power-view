import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { event, data } = await req.json();
    console.log("Sending waitlist email for event:", event);
    console.log("Data:", data);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("SMTP_FROM_EMAIL") || "alo@eiteone.org";
    const fromName = Deno.env.get("SMTP_FROM_NAME") || "Alo—Sales";
    const appUrl = Deno.env.get("APP_URL") || "https://alo-sales.eiteone.org";

    const supabase = createClient(supabaseUrl, supabaseKey);

    let emailResult;

    // Route to appropriate email handler based on event
    switch (event) {
      case "waitlist_joined":
        emailResult = await sendWaitlistConfirmation(data, resendApiKey, fromEmail, fromName, appUrl, supabase);
        break;
      case "referral_success":
        emailResult = await sendReferralSuccess(data, resendApiKey, fromEmail, fromName, appUrl, supabase);
        break;
      case "instant_access":
        emailResult = await sendInstantAccess(data, resendApiKey, fromEmail, fromName, appUrl, supabase);
        break;
      case "position_update":
        emailResult = await sendPositionUpdate(data, resendApiKey, fromEmail, fromName, appUrl, supabase);
        break;
      default:
        throw new Error(`Unknown event type: ${event}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully",
        emailResult,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error in send-waitlist-email function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

// Send confirmation email when someone joins the waitlist
async function sendWaitlistConfirmation(data, resendApiKey, fromEmail, fromName, appUrl, supabase) {
  const referralUrl = `${appUrl}?ref=${data.referral_code}`;

  const emailHtml = `
    <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; color: #1f2937; border: 1px solid #e5e7eb; border-radius: 8px;">
      <header style="border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px;">
        <h1 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 24px; margin: 0;">
          Alo—Sales
        </h1>
      </header>

      <section>
        <p style="font-size: 16px; margin-bottom: 16px;">
          Welcome to the waitlist! 🎉
        </p>

        <div style="background-color: #f9fafb; border-left: 4px solid #111827; padding: 20px; border-radius: 6px; margin-bottom: 24px;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">Your position</p>
          <h2 style="margin: 0; font-size: 42px; font-weight: bold; color: #111827;">#${data.position}</h2>
          <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280;">Estimated wait: 2-3 weeks</p>
        </div>

        <h3 style="color: #111827; font-size: 18px; margin-bottom: 12px;">Skip the Line</h3>
        <p style="font-size: 15px; color: #4b5563; margin-bottom: 12px;">
          Share your referral link and move up faster:
        </p>
        <ul style="font-size: 15px; color: #4b5563; line-height: 1.8; margin-bottom: 24px;">
          <li><strong>Each referral</strong> = Move up 10 positions</li>
          <li><strong>3 referrals</strong> = Priority support</li>
          <li><strong>5 referrals</strong> = Instant Access</li>
          <li><strong>10 referrals</strong> = Lifetime 20% discount</li>
        </ul>

        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
          <p style="font-weight: 600; margin: 0 0 8px 0; color: #111827; font-size: 14px;">Your referral link:</p>
          <a href="${referralUrl}" style="color: #111827; word-break: break-all; font-size: 13px; text-decoration: underline;">${referralUrl}</a>
          
          <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
            <p style="font-weight: 600; margin: 0 0 8px 0; color: #111827; font-size: 14px;">Share via:</p>
            <p style="margin: 0;">
              <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(`Just joined the Alo—Sales waitlist! 🚀 Transform your sales process. Join me: ${referralUrl}`)}" style="color: #111827; text-decoration: underline; font-size: 14px; margin-right: 12px;">Twitter</a>
              <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}" style="color: #111827; text-decoration: underline; font-size: 14px; margin-right: 12px;">LinkedIn</a>
              <a href="https://wa.me/?text=${encodeURIComponent(`Check out Alo—Sales! ${referralUrl}`)}" style="color: #111827; text-decoration: underline; font-size: 14px;">WhatsApp</a>
            </p>
          </div>
        </div>

        <h3 style="color: #111827; font-size: 18px; margin-bottom: 12px;">What happens next?</h3>
        <div style="margin-bottom: 12px;">
          <p style="margin: 0; font-weight: 600; color: #111827; font-size: 15px;">1. Share your link</p>
          <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">Every friend who joins moves you up 10 positions</p>
        </div>
        <div style="margin-bottom: 12px;">
          <p style="margin: 0; font-weight: 600; color: #111827; font-size: 15px;">2. Watch your position climb</p>
          <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">We'll email you when you move up</p>
        </div>
        <div style="margin-bottom: 24px;">
          <p style="margin: 0; font-weight: 600; color: #111827; font-size: 15px;">3. Get instant access at 5 referrals</p>
          <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">Or wait for your turn to be invited</p>
        </div>

        <p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Best regards,</p>
        <p style="font-size: 14px; color: #6b7280; margin: 0;">The Alo—Sales Team</p>
      </section>

      <footer style="margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
        <p style="margin: 0;">
          Questions? 📧 hello@eiteone.org | 💬 +265 99 655 4837
        </p>
        <p style="margin: 8px 0 0 0;">
          This email was sent by Alo—Sales. You're receiving this because you joined our waitlist.
        </p>
      </footer>
    </div>
  `;

  // Log notification in database
  await supabase.from("notifications").insert({
    type: "waitlist_joined",
    recipient_email: data.email,
    title: `You're #${data.position} on the Waitlist!`,
    message: `Welcome to Alo—Sales waitlist. Share your referral link to move up faster.`,
    metadata: data,
    sent_at: new Date().toISOString(),
  });

  // Send via Resend API (Gmail SMTP blocked from cloud providers)
  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: `${fromName} <${fromEmail}>`,
      to: [data.email],
      subject: `You're #${data.position} on the Alo—Sales Waitlist! 🎉`,
      html: emailHtml,
    }),
  });

  if (!resendResponse.ok) {
    const errorText = await resendResponse.text();
    throw new Error(`Resend API error: ${resendResponse.status} - ${errorText}`);
  }

  const resendData = await resendResponse.json();
  return { success: true, message: "Email sent via Resend", emailId: resendData.id };
}

// Send notification when someone uses their referral link
async function sendReferralSuccess(data, resendApiKey, fromEmail, fromName, appUrl, supabase) {
  const referralUrl = `${appUrl}?ref=${data.referral_code}`;
  const remainingForInstant = Math.max(0, 5 - data.referral_count);

  const emailHtml = `
    <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; color: #1f2937; border: 1px solid #e5e7eb; border-radius: 8px;">
      <header style="border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px;">
        <h1 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 24px; margin: 0;">
          Alo—Sales
        </h1>
      </header>

      <section>
        <p style="font-size: 16px; margin-bottom: 16px;">
          Great news! 🎉
        </p>

        <div style="background-color: #f9fafb; border-left: 4px solid #111827; padding: 20px; border-radius: 6px; margin-bottom: 24px;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">Your referral just joined!</p>
          <h2 style="margin: 0; font-size: 32px; font-weight: bold; color: #111827;">#${data.position} <span style="font-size: 20px;">↑10</span></h2>
          <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280;"><strong>${data.referral_count} of 5</strong> referrals for instant access</p>
        </div>

      ${data.referral_count >= 5 ? `
        <div style="background-color: #f9fafb; border: 1px solid #111827; padding: 20px; border-radius: 6px; margin-bottom: 24px;">
          <h3 style="color: #111827; font-size: 18px; margin: 0 0 8px 0;">⚡ You've Unlocked Instant Access!</h3>
          <p style="color: #4b5563; margin: 0; font-size: 15px;">
            Congratulations! You've earned instant access to Alo—Sales. Check your email for your invite code coming shortly.
          </p>
        </div>
      ` : `
        <div style="background-color: #f9fafb; border: 1px solid #d1d5db; padding: 20px; border-radius: 6px; margin-bottom: 24px;">
          <h3 style="color: #111827; font-size: 18px; margin: 0 0 8px 0;">Almost there!</h3>
          <p style="color: #4b5563; margin: 0; font-size: 15px;">
            Just <strong>${remainingForInstant} more referral${remainingForInstant !== 1 ? 's' : ''}</strong> for instant access!
          </p>
        </div>
      `}

        <h3 style="color: #111827; font-size: 18px; margin-bottom: 12px;">Keep the momentum going!</h3>
        <p style="font-size: 15px; color: #4b5563; margin-bottom: 12px;">
          Share your link with more friends and colleagues:
        </p>
        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
          <a href="${referralUrl}" style="color: #111827; word-break: break-all; font-size: 13px; text-decoration: underline;">${referralUrl}</a>
        </div>

        <p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Best regards,</p>
        <p style="font-size: 14px; color: #6b7280; margin: 0;">The Alo—Sales Team</p>
      </section>

      <footer style="margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
        <p style="margin: 0;">
          📧 hello@eiteone.org | 💬 +265 99 655 4837
        </p>
      </footer>
    </div>
  `;

  // Log notification
  await supabase.from("notifications").insert({
    type: "referral_success",
    recipient_email: data.email,
    title: "Your referral just joined!",
    message: `You're now at position #${data.position}. ${remainingForInstant} more for instant access.`,
    metadata: data,
    sent_at: new Date().toISOString(),
  });

  // Send via Resend API
  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: `${fromName} <${fromEmail}>`,
      to: [data.email],
      subject: "🎉 Your referral just joined the waitlist!",
      html: emailHtml,
    }),
  });

  if (!resendResponse.ok) {
    const errorText = await resendResponse.text();
    throw new Error(`Resend API error: ${resendResponse.status} - ${errorText}`);
  }

  const resendData = await resendResponse.json();
  return { success: true, message: "Email sent via Resend", emailId: resendData.id };
}

// Send instant access email when user reaches 5 referrals
async function sendInstantAccess(data, resendApiKey, fromEmail, fromName, appUrl, supabase) {
  const emailHtml = `
    <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; color: #1f2937; border: 1px solid #e5e7eb; border-radius: 8px;">
      <header style="border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px;">
        <h1 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 24px; margin: 0;">
          Alo—Sales
        </h1>
      </header>

      <section>
        <p style="font-size: 16px; margin-bottom: 16px;">
          🎊 Welcome to Alo—Sales! You're officially in! 🚀
        </p>

        <div style="background-color: #111827; color: white; padding: 24px; border-radius: 6px; margin-bottom: 24px;">
          <h2 style="margin: 0 0 12px 0; font-size: 20px;">🏆 Gold Tier Unlocked</h2>
          <p style="margin: 0; font-size: 15px;">
            You brought <strong>${data.referral_count} people</strong> to Alo—Sales!
          </p>
          <div style="background: rgba(255, 255, 255, 0.1); padding: 12px; border-radius: 4px; margin-top: 16px;">
            <p style="margin: 0 0 8px 0; font-size: 14px;">Your rewards:</p>
            <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px;">
              <li>✓ Instant Access</li>
              <li>✓ 5 Bonus Invite Codes</li>
              <li>✓ Priority Onboarding</li>
              ${data.referral_count >= 10 ? '<li>✓ 20% Lifetime Discount</li>' : ''}
            </ul>
          </div>
        </div>

        <h3 style="color: #111827; font-size: 18px; margin-bottom: 12px;">What's Next?</h3>
        <div style="margin-bottom: 12px;">
          <p style="margin: 0; font-weight: 600; color: #111827; font-size: 15px;">1. Create your account</p>
          <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">
            <a href="${appUrl}/auth" style="color: #111827; text-decoration: underline;">Sign up now →</a>
          </p>
        </div>
        <div style="margin-bottom: 12px;">
          <p style="margin: 0; font-weight: 600; color: #111827; font-size: 15px;">2. Set up your team</p>
          <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">Add team members and assign roles</p>
        </div>
        <div style="margin-bottom: 12px;">
          <p style="margin: 0; font-weight: 600; color: #111827; font-size: 15px;">3. Import your leads</p>
          <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">Get started tracking your sales pipeline</p>
        </div>
        <div style="margin-bottom: 24px;">
          <p style="margin: 0; font-weight: 600; color: #111827; font-size: 15px;">4. Invite your colleagues</p>
          <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">You have 5 invite codes to share</p>
        </div>

        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 6px; margin-bottom: 24px;">
          <h3 style="color: #111827; font-size: 16px; margin: 0 0 12px 0;">Need help?</h3>
          <p style="margin: 0; font-size: 14px; color: #4b5563;">Our team is here to help you get started:</p>
          <ul style="font-size: 14px; color: #4b5563; margin: 8px 0 0 0; padding-left: 20px;">
            <li>📧 Email: hello@eiteone.org</li>
            <li>💬 WhatsApp: +265 99 655 4837</li>
            <li>📞 Phone: +265 99 655 4837</li>
          </ul>
        </div>

        <p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Welcome to the team! 🚀</p>
        <p style="font-size: 14px; color: #6b7280; margin: 0;">Best regards,<br>The Alo—Sales Team</p>
      </section>

      <footer style="margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
        <p style="margin: 0;">
          This email was sent by Alo—Sales.
        </p>
      </footer>
    </div>
  `;

  // Log notification
  await supabase.from("notifications").insert({
    type: "instant_access",
    recipient_email: data.email,
    title: "🎊 Welcome to Alo—Sales! You're In!",
    message: `Congratulations! You've earned instant access with ${data.referral_count} referrals.`,
    metadata: data,
    sent_at: new Date().toISOString(),
  });

  // Send via Resend API
  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: `${fromName} <${fromEmail}>`,
      to: [data.email],
      subject: "🎊 Welcome to Alo—Sales! You're In!",
      html: emailHtml,
    }),
  });

  if (!resendResponse.ok) {
    const errorText = await resendResponse.text();
    throw new Error(`Resend API error: ${resendResponse.status} - ${errorText}`);
  }

  const resendData = await resendResponse.json();
  return { success: true, message: "Email sent via Resend", emailId: resendData.id };
}

// Send position update email
async function sendPositionUpdate(data, resendApiKey, fromEmail, fromName, appUrl, supabase) {
  const referralUrl = `${appUrl}?ref=${data.referral_code}`;
  
  const emailHtml = `
    <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; color: #1f2937; border: 1px solid #e5e7eb; border-radius: 8px;">
      <header style="border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px;">
        <h1 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 24px; margin: 0;">
          Alo—Sales
        </h1>
      </header>

      <section>
        <p style="font-size: 16px; margin-bottom: 16px;">
          You're moving up! ⬆️
        </p>

        <div style="background-color: #f9fafb; border-left: 4px solid #111827; padding: 20px; border-radius: 6px; margin-bottom: 24px;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">Your new position</p>
          <h2 style="margin: 0; font-size: 42px; font-weight: bold; color: #111827;">#${data.position}</h2>
          <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280;">${data.referral_count} referrals</p>
        </div>

        <p style="font-size: 15px; color: #4b5563; margin-bottom: 12px;">
          Keep sharing your referral link to move up even faster!
        </p>
        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
          <a href="${referralUrl}" style="color: #111827; word-break: break-all; font-size: 13px; text-decoration: underline;">${referralUrl}</a>
        </div>

        <p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Best regards,</p>
        <p style="font-size: 14px; color: #6b7280; margin: 0;">The Alo—Sales Team</p>
      </section>

      <footer style="margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
        <p style="margin: 0;">
          This email was sent by Alo—Sales.
        </p>
      </footer>
    </div>
  `;

  // Log notification
  await supabase.from("notifications").insert({
    type: "position_update",
    recipient_email: data.email,
    title: `You're now #${data.position}!`,
    message: `Your position improved to #${data.position} with ${data.referral_count} referrals.`,
    metadata: data,
    sent_at: new Date().toISOString(),
  });

  // Send via Resend API
  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: `${fromName} <${fromEmail}>`,
      to: [data.email],
      subject: `You're climbing! Now #${data.position} ⬆️`,
      html: emailHtml,
    }),
  });

  if (!resendResponse.ok) {
    const errorText = await resendResponse.text();
    throw new Error(`Resend API error: ${resendResponse.status} - ${errorText}`);
  }

  const resendData = await resendResponse.json();
  return { success: true, message: "Email sent via Resend", emailId: resendData.id };
}

serve(handler);
