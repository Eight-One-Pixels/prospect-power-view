
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VisitReminderRequest {
  to: string;
  visitData: {
    company_name: string;
    contact_person: string;
    visit_type: string;
    visit_datetime: string;
    rep_name: string;
    notes?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, visitData }: VisitReminderRequest = await req.json();
    
    console.log('Sending visit reminder to:', to);
    console.log('Visit data:', visitData);

    // Here you would integrate with your email service (Resend, SendGrid, etc.)
    // For now, we'll just log the email content
    
    const emailContent = {
      to,
      subject: `Upcoming Meeting - ${visitData.company_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Meeting Reminder</h2>
          <p>Dear ${visitData.contact_person || 'Valued Contact'},</p>
          
          <p>This is a reminder about our upcoming meeting:</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Company:</strong> ${visitData.company_name}</p>
            <p><strong>Meeting Type:</strong> ${visitData.visit_type.replace('_', ' ').toUpperCase()}</p>
            <p><strong>Date & Time:</strong> ${new Date(visitData.visit_datetime).toLocaleString()}</p>
            <p><strong>Sales Representative:</strong> ${visitData.rep_name}</p>
            ${visitData.notes ? `<p><strong>Notes:</strong> ${visitData.notes}</p>` : ''}
          </div>
          
          <p>Please let us know if you need to reschedule or have any questions.</p>
          
          <p>Best regards,<br>
          ${visitData.rep_name}<br>
          SalesTracker Team</p>
        </div>
      `
    };

    console.log('Email content prepared:', emailContent);

    // TODO: Integrate with actual email service
    // Example with Resend:
    // const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    // await resend.emails.send(emailContent);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Visit reminder prepared',
        emailContent 
      }), 
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      }
    );

  } catch (error) {
    console.error('Error in send-visit-reminder function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      }
    );
  }
};

serve(handler);
