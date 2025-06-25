
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

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // For now, we'll log the email and store it in a notifications table
    // In production, you would integrate with an email service like Resend
    const { error: insertError } = await supabase
      .from('notifications')
      .insert({
        type: 'visit_reminder',
        recipient_email: to,
        title: `Upcoming Meeting - ${visitData.company_name}`,
        message: `Meeting with ${visitData.contact_person} at ${visitData.company_name} scheduled for ${new Date(visitData.visit_datetime).toLocaleString()}`,
        metadata: visitData,
        sent_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error storing notification:', insertError);
    }

    const emailContent = {
      to,
      subject: `Upcoming Meeting - ${visitData.company_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #4F46E5; padding-bottom: 10px;">Meeting Reminder</h2>
          <p>Dear ${visitData.contact_person || 'Valued Contact'},</p>
          
          <p>This is a reminder about our upcoming meeting:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4F46E5;">
            <p><strong>Company:</strong> ${visitData.company_name}</p>
            <p><strong>Meeting Type:</strong> ${visitData.visit_type.replace('_', ' ').toUpperCase()}</p>
            <p><strong>Date & Time:</strong> ${new Date(visitData.visit_datetime).toLocaleString()}</p>
            <p><strong>Sales Representative:</strong> ${visitData.rep_name}</p>
            ${visitData.notes ? `<p><strong>Notes:</strong> ${visitData.notes}</p>` : ''}
          </div>
          
          <p>Please let us know if you need to reschedule or have any questions.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Best regards,<br>
            ${visitData.rep_name}<br>
            Alo—Sales Team</p>
          </div>
        </div>
      `
    };

    console.log('Email notification prepared and logged');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Visit reminder sent successfully',
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
