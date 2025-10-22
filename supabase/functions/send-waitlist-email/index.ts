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
    const appUrl = Deno.env.get("APP_URL") || "https://alo-sales.eiteone.org";

    const supabase = createClient(supabaseUrl, supabaseKey);

    let emailResult;

    // Route to appropriate email handler based on event
    switch (event) {
      case "waitlist_joined":
        emailResult = await sendWaitlistConfirmation(data, resendApiKey, appUrl, supabase);
        break;
      case "referral_success":
        emailResult = await sendReferralSuccess(data, resendApiKey, appUrl, supabase);
        break;
      case "instant_access":
        emailResult = await sendInstantAccess(data, resendApiKey, appUrl, supabase);
        break;
      case "position_update":
        emailResult = await sendPositionUpdate(data, resendApiKey, appUrl, supabase);
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
async function sendWaitlistConfirmation(data, resendApiKey, appUrl, supabase) {
  const referralUrl = `${appUrl}?ref=${data.referral_code}`;

  const emailHtml = `
    <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; color: #1f2937;">
      <header style="text-align: center; padding-bottom: 24px;">
        <h1 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 28px; margin: 0;">
          Alo—Sales
        </h1>
      </header>

      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 12px; text-align: center; margin-bottom: 32px;">
        <h2 style="margin: 0 0 16px 0; font-size: 24px;">You're on the list! 🎉</h2>
        <div style="background: rgba(255, 255, 255, 0.2); padding: 24px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">Your position</p>
          <h1 style="margin: 10px 0; font-size: 56px; font-weight: bold;">#${data.position}</h1>
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">Estimated wait: 2-3 weeks</p>
        </div>
      </div>

      <section style="margin-bottom: 32px;">
        <h2 style="color: #111827; font-size: 20px; margin-bottom: 16px;">⚡ Skip the Line!</h2>
        <p style="font-size: 15px; color: #4b5563; margin-bottom: 16px;">
          Share your referral link and move up faster:
        </p>
        <ul style="font-size: 15px; color: #4b5563; line-height: 1.8;">
          <li><strong>Each referral</strong> = Move up 10 positions</li>
          <li><strong>3 referrals</strong> = Priority support when you join</li>
          <li><strong style="color: #10b981;">5 referrals</strong> = <strong style="color: #10b981;">Instant Access! ⚡</strong></li>
          <li><strong style="color: #7c3aed;">10 referrals</strong> = <strong style="color: #7c3aed;">Lifetime 20% discount + extras!</strong></li>
        </ul>
      </section>

      <section style="background-color: #f9fafb; border: 2px solid #e5e7eb; padding: 20px; border-radius: 8px; margin-bottom: 32px;">
        <p style="font-weight: 600; margin: 0 0 12px 0; color: #111827;">Your referral link:</p>
        <a href="${referralUrl}" style="color: #667eea; word-break: break-all; font-size: 14px;">${referralUrl}</a>
        
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="font-weight: 600; margin: 0 0 12px 0; color: #111827;">Share via:</p>
          <div style="display: flex; gap: 12px;">
            <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(`Just joined the Alo—Sales waitlist! 🚀 Transform your sales process. Join me: ${referralUrl}`)}" style="display: inline-block; padding: 10px 16px; background-color: #1DA1F2; color: white; text-decoration: none; border-radius: 6px; font-size: 14px;">Twitter</a>
            <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}" style="display: inline-block; padding: 10px 16px; background-color: #0A66C2; color: white; text-decoration: none; border-radius: 6px; font-size: 14px;">LinkedIn</a>
            <a href="https://wa.me/?text=${encodeURIComponent(`Check out Alo—Sales! ${referralUrl}`)}" style="display: inline-block; padding: 10px 16px; background-color: #25D366; color: white; text-decoration: none; border-radius: 6px; font-size: 14px;">WhatsApp</a>
          </div>
        </div>
      </section>

      <section style="margin-bottom: 32px;">
        <h3 style="color: #111827; font-size: 18px; margin-bottom: 16px;">What happens next?</h3>
        <div style="display: flex; gap: 16px; margin-bottom: 16px;">
          <div style="flex-shrink: 0; width: 32px; height: 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">1</div>
          <div>
            <p style="margin: 0; font-weight: 600; color: #111827;">Share your link</p>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">Every friend who joins moves you up 10 positions</p>
          </div>
        </div>
        <div style="display: flex; gap: 16px; margin-bottom: 16px;">
          <div style="flex-shrink: 0; width: 32px; height: 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">2</div>
          <div>
            <p style="margin: 0; font-weight: 600; color: #111827;">Watch your position climb</p>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">We'll email you when you move up</p>
          </div>
        </div>
        <div style="display: flex; gap: 16px;">
          <div style="flex-shrink: 0; width: 32px; height: 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">⚡</div>
          <div>
            <p style="margin: 0; font-weight: 600; color: #10b981;">Get instant access at 5 referrals!</p>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">Or wait for your turn to be invited</p>
          </div>
        </div>
      </section>

      <footer style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;">
          Questions? Reply to this email or contact us:
        </p>
        <p style="font-size: 14px; color: #667eea; margin: 0;">
          📧 hello@eiteone.org | 💬 WhatsApp: +265 99 655 4837
        </p>
        <p style="font-size: 12px; color: #9ca3af; margin: 16px 0 0 0;">
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

  // Send email via Resend
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Alo—Sales <onboarding@resend.dev>",
      to: data.email,
      subject: `You're #${data.position} on the Alo—Sales Waitlist! 🎉`,
      html: emailHtml,
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    console.error("Resend email failed:", result);
    throw new Error("Email sending failed");
  }

  return result;
}

// Send notification when someone uses their referral link
async function sendReferralSuccess(data, resendApiKey, appUrl, supabase) {
  const referralUrl = `${appUrl}?ref=${data.referral_code}`;
  const remainingForInstant = Math.max(0, 5 - data.referral_count);

  const emailHtml = `
    <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; color: #1f2937;">
      <header style="text-align: center; padding-bottom: 24px;">
        <h1 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 28px; margin: 0;">
          Alo—Sales
        </h1>
      </header>

      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px; border-radius: 12px; text-align: center; margin-bottom: 32px;">
        <h2 style="margin: 0 0 8px 0; font-size: 32px;">🎉</h2>
        <h2 style="margin: 0 0 16px 0; font-size: 24px;">Your referral just joined!</h2>
        <div style="background: rgba(255, 255, 255, 0.2); padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0; font-size: 14px; opacity: 0.9;">New Position</p>
          <p style="margin: 0; font-size: 36px; font-weight: bold;">#${data.position} <span style="font-size: 24px;">↑10</span></p>
        </div>
        <div style="background: rgba(255, 255, 255, 0.2); padding: 16px; border-radius: 8px;">
          <p style="margin: 0; font-size: 16px;"><strong>${data.referral_count} of 5</strong> referrals for instant access</p>
        </div>
      </div>

      ${data.referral_count >= 5 ? `
        <section style="background-color: #fef3c7; border: 2px solid #fbbf24; padding: 24px; border-radius: 8px; margin-bottom: 32px;">
          <h3 style="color: #92400e; font-size: 20px; margin: 0 0 8px 0;">⚡ You've Unlocked Instant Access!</h3>
          <p style="color: #78350f; margin: 0; font-size: 15px;">
            Congratulations! You've earned instant access to Alo—Sales. Check your email for your invite code coming shortly.
          </p>
        </section>
      ` : `
        <section style="background-color: #f0fdf4; border: 2px solid #10b981; padding: 24px; border-radius: 8px; margin-bottom: 32px;">
          <h3 style="color: #065f46; font-size: 20px; margin: 0 0 8px 0;">Almost there!</h3>
          <p style="color: #047857; margin: 0; font-size: 15px;">
            Just <strong>${remainingForInstant} more referral${remainingForInstant !== 1 ? 's' : ''}</strong> for instant access!
          </p>
        </section>
      `}

      <section style="margin-bottom: 32px;">
        <h3 style="color: #111827; font-size: 18px; margin-bottom: 16px;">Keep the momentum going!</h3>
        <p style="font-size: 15px; color: #4b5563; margin-bottom: 16px;">
          Share your link with more friends and colleagues:
        </p>
        <div style="background-color: #f9fafb; border: 2px solid #e5e7eb; padding: 16px; border-radius: 8px;">
          <a href="${referralUrl}" style="color: #667eea; word-break: break-all; font-size: 14px;">${referralUrl}</a>
        </div>
      </section>

      <footer style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="font-size: 14px; color: #6b7280; margin: 0;">
          Best regards,<br>The Alo—Sales Team
        </p>
        <p style="font-size: 12px; color: #9ca3af; margin: 16px 0 0 0;">
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

  // Send email
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Alo—Sales <onboarding@resend.dev>",
      to: data.email,
      subject: "🎉 Your referral just joined the waitlist!",
      html: emailHtml,
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error("Email sending failed");
  }

  return result;
}

// Send instant access email when user reaches 5 referrals
async function sendInstantAccess(data, resendApiKey, appUrl, supabase) {
  const emailHtml = `
    <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; color: #1f2937;">
      <header style="text-align: center; padding-bottom: 24px;">
        <h1 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 28px; margin: 0;">
          Alo—Sales
        </h1>
      </header>

      <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px; border-radius: 12px; text-align: center; margin-bottom: 32px;">
        <h2 style="margin: 0 0 8px 0; font-size: 48px;">🎊</h2>
        <h2 style="margin: 0 0 16px 0; font-size: 28px;">Welcome to Alo—Sales!</h2>
        <p style="margin: 0; font-size: 18px; opacity: 0.95;">You're officially in! 🚀</p>
      </div>

      <section style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 32px; border-radius: 12px; text-align: center; margin-bottom: 32px;">
        <h3 style="margin: 0 0 16px 0; font-size: 22px;">🏆 Gold Tier Unlocked</h3>
        <p style="margin: 0; font-size: 16px; opacity: 0.95;">
          You brought <strong>${data.referral_count} people</strong> to Alo—Sales!
        </p>
        <div style="background: rgba(255, 255, 255, 0.2); padding: 16px; border-radius: 8px; margin-top: 20px;">
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">Your rewards:</p>
          <ul style="list-style: none; padding: 0; margin: 12px 0 0 0; font-size: 15px;">
            <li>✓ Instant Access</li>
            <li>✓ 5 Bonus Invite Codes</li>
            <li>✓ Priority Onboarding</li>
            ${data.referral_count >= 10 ? '<li>✓ 20% Lifetime Discount</li>' : ''}
          </ul>
        </div>
      </section>

      <section style="margin-bottom: 32px;">
        <h3 style="color: #111827; font-size: 20px; margin-bottom: 16px;">What's Next?</h3>
        <div style="margin-bottom: 16px;">
          <div style="display: flex; gap: 16px; margin-bottom: 16px;">
            <div style="flex-shrink: 0; width: 32px; height: 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">1</div>
            <div>
              <p style="margin: 0; font-weight: 600; color: #111827;">Create your account</p>
              <a href="${appUrl}/auth" style="color: #667eea; text-decoration: none; font-size: 14px;">Sign up now →</a>
            </div>
          </div>
          <div style="display: flex; gap: 16px; margin-bottom: 16px;">
            <div style="flex-shrink: 0; width: 32px; height: 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">2</div>
            <div>
              <p style="margin: 0; font-weight: 600; color: #111827;">Set up your team</p>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">Add team members and assign roles</p>
            </div>
          </div>
          <div style="display: flex; gap: 16px; margin-bottom: 16px;">
            <div style="flex-shrink: 0; width: 32px; height: 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">3</div>
            <div>
              <p style="margin: 0; font-weight: 600; color: #111827;">Import your leads</p>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">Get started tracking your sales pipeline</p>
            </div>
          </div>
          <div style="display: flex; gap: 16px;">
            <div style="flex-shrink: 0; width: 32px; height: 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">4</div>
            <div>
              <p style="margin: 0; font-weight: 600; color: #10b981;">Invite your colleagues</p>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">You have 5 invite codes to share</p>
            </div>
          </div>
        </div>
      </section>

      <section style="background-color: #f9fafb; border: 2px solid #e5e7eb; padding: 24px; border-radius: 8px; margin-bottom: 32px;">
        <h3 style="color: #111827; font-size: 18px; margin: 0 0 12px 0;">Need help?</h3>
        <p style="margin: 0; font-size: 15px; color: #4b5563;">Our team is here to help you get started:</p>
        <ul style="font-size: 15px; color: #4b5563; margin: 12px 0 0 0; padding-left: 24px;">
          <li>📧 Email: hello@eiteone.org</li>
          <li>💬 WhatsApp: +265 99 655 4837</li>
          <li>📞 Phone: +265 99 655 4837</li>
        </ul>
      </section>

      <footer style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="font-size: 16px; color: #111827; margin: 0 0 8px 0; font-weight: 600;">
          Welcome to the team! 🚀
        </p>
        <p style="font-size: 14px; color: #6b7280; margin: 0;">
          Best regards,<br>The Alo—Sales Team
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

  // Send email
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Alo—Sales <onboarding@resend.dev>",
      to: data.email,
      subject: "🎊 Welcome to Alo—Sales! You're In!",
      html: emailHtml,
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error("Email sending failed");
  }

  return result;
}

// Send position update email
async function sendPositionUpdate(data, resendApiKey, appUrl, supabase) {
  const referralUrl = `${appUrl}?ref=${data.referral_code}`;
  
  const emailHtml = `
    <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; color: #1f2937;">
      <header style="text-align: center; padding-bottom: 24px;">
        <h1 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 28px; margin: 0;">
          Alo—Sales
        </h1>
      </header>

      <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 40px; border-radius: 12px; text-align: center; margin-bottom: 32px;">
        <h2 style="margin: 0 0 16px 0; font-size: 24px;">You're moving up! ⬆️</h2>
        <div style="background: rgba(255, 255, 255, 0.2); padding: 20px; border-radius: 8px;">
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">Your new position</p>
          <p style="margin: 8px 0; font-size: 48px; font-weight: bold;">#${data.position}</p>
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">${data.referral_count} referrals</p>
        </div>
      </div>

      <section style="margin-bottom: 32px;">
        <p style="font-size: 15px; color: #4b5563;">
          Keep sharing your referral link to move up even faster!
        </p>
        <div style="background-color: #f9fafb; border: 2px solid #e5e7eb; padding: 16px; border-radius: 8px; margin-top: 16px;">
          <a href="${referralUrl}" style="color: #667eea; word-break: break-all; font-size: 14px;">${referralUrl}</a>
        </div>
      </section>

      <footer style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="font-size: 14px; color: #6b7280; margin: 0;">
          Best regards,<br>The Alo—Sales Team
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

  // Send email
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Alo—Sales <onboarding@resend.dev>",
      to: data.email,
      subject: `You're climbing! Now #${data.position} ⬆️`,
      html: emailHtml,
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error("Email sending failed");
  }

  return result;
}

serve(handler);
