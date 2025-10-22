import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Supabase anon key for edge function calls
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYWVuZWlmYWRtZHRlYnZ4bHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwODA3MDgsImV4cCI6MjA2NTY1NjcwOH0.GcOvWJWQktQhaTUVoWtQ7qXPxVqtnBeAeIj9RhLscdo";

interface WaitlistFormProps {
  onSuccess: (data: { position: number; referralCode: string; email: string; fullName: string }) => void;
}

export const WaitlistForm = ({ onSuccess }: WaitlistFormProps) => {
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    company: "",
    teamSize: "",
    useCase: "",
    referredBy: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Check URL for referral code
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get("ref");
    if (refCode) {
      setFormData(prev => ({ ...prev, referredBy: refCode }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Generate referral code
      const { data: codeData, error: codeError } = await (supabase.rpc as any)(
        "generate_referral_code",
        { user_email: formData.email }
      );

      if (codeError) throw codeError;

      const referralCode = codeData;

      // Insert into waitlist
      const { data: waitlistData, error: waitlistError } = await (supabase.from as any)("waitlist")
        .insert({
          email: formData.email,
          full_name: formData.fullName,
          company_name: formData.company || null,
          team_size: formData.teamSize || null,
          use_case: formData.useCase || null,
          referral_code: referralCode,
        })
        .select()
        .single();

      if (waitlistError) {
        if (waitlistError.code === "23505") {
          // Duplicate email - show message and don't throw error
          setIsSubmitting(false);
          toast({
            title: "Already on waitlist! 👋",
            description: "This email is already registered. Check your inbox for your referral link!",
          });
          return;
        }
        throw waitlistError;
      }

      // Process referral if provided
      let referralResult = null;
      if (formData.referredBy) {
        const { data: referralData } = await (supabase.rpc as any)("process_referral", {
          referrer_code: formData.referredBy,
          referee_id: waitlistData.id,
        });

        if (referralData?.success) {
          console.log("Referral processed:", referralData);
          referralResult = referralData;
          
          // Send email to referrer about their successful referral
          try {
            // Get referrer details from the queue or database
            const { data: emailQueueEntry } = await (supabase.from as any)("waitlist_email_queue")
              .select("*")
              .eq("recipient_email", referralData.referrer_email || "")
              .eq("status", "pending")
              .order("created_at", { ascending: false })
              .limit(1)
              .single();

            if (emailQueueEntry) {
              // Send the queued email
              const emailEvent = referralData.instant_access ? "instant_access" : "referral_success";
              
              const response = await fetch(
                "https://xfaeneifadmdtebvxltq.supabase.co/functions/v1/send-waitlist-email",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                  },
                  body: JSON.stringify({
                    event: emailEvent,
                    data: emailQueueEntry.data,
                  }),
                }
              );

              if (response.ok) {
                // Mark email as sent in queue
                await (supabase.from as any)("waitlist_email_queue")
                  .update({ status: "sent", sent_at: new Date().toISOString() })
                  .eq("id", emailQueueEntry.id);
                console.log(`${emailEvent} email sent to referrer`);
              } else {
                console.error(`${emailEvent} email failed:`, await response.text());
              }
            }
          } catch (emailError) {
            console.error("Error sending referrer email:", emailError);
          }
        }
      }

      // Get updated position
      const { data: positionData } = await (supabase.rpc as any)(
        "calculate_waitlist_position",
        { waitlist_id: waitlistData.id }
      );

      // Get referral count for email
      const { data: waitlistEntry } = await (supabase.from as any)("waitlist")
        .select("referral_count")
        .eq("id", waitlistData.id)
        .single();

      // Send welcome email via edge function
      try {
        const response = await fetch(
          "https://xfaeneifadmdtebvxltq.supabase.co/functions/v1/send-waitlist-email",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              event: "waitlist_joined",
              data: {
                email: waitlistData.email,
                full_name: waitlistData.full_name,
                position: positionData || 1,
                referral_code: waitlistData.referral_code,
                referral_count: waitlistEntry?.referral_count || 0,
              },
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Email sending failed:", errorText);
        } else {
          console.log("Welcome email sent successfully");
        }
      } catch (emailError) {
        // Don't fail the whole process if email fails
        console.error("Email sending error:", emailError);
      }

      onSuccess({
        position: positionData || 1,
        referralCode: waitlistData.referral_code,
        email: waitlistData.email,
        fullName: waitlistData.full_name,
      });

      toast({
        title: "You're on the list! 🎉",
        description: `Position #${positionData || 1}. Check your email for your referral link!`,
      });
    } catch (error: any) {
      console.error("Waitlist submission error:", error);
      toast({
        title: "Error joining waitlist",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email address *</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@company.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Full name *</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="John Doe"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Company name</Label>
        <Input
          id="company"
          type="text"
          placeholder="Acme Inc."
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="teamSize">Team size</Label>
        <Select
          value={formData.teamSize}
          onValueChange={(value) => setFormData({ ...formData, teamSize: value })}
          disabled={isSubmitting}
        >
          <SelectTrigger id="teamSize">
            <SelectValue placeholder="Select team size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1-5">1-5 people</SelectItem>
            <SelectItem value="6-20">6-20 people</SelectItem>
            <SelectItem value="21-50">21-50 people</SelectItem>
            <SelectItem value="51-100">51-100 people</SelectItem>
            <SelectItem value="100+">100+ people</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="useCase">What will you use Alo—Sales for?</Label>
        <Textarea
          id="useCase"
          placeholder="Tell us about your sales process..."
          value={formData.useCase}
          onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
          disabled={isSubmitting}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="referredBy">Referral code (optional)</Label>
        <Input
          id="referredBy"
          type="text"
          placeholder="Enter referral code"
          value={formData.referredBy}
          onChange={(e) => setFormData({ ...formData, referredBy: e.target.value.toUpperCase() })}
          disabled={isSubmitting}
        />
        {formData.referredBy && (
          <p className="text-xs text-green-600">
            ✨ You'll help someone skip the line!
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Joining waitlist...
          </>
        ) : (
          "Join the Waitlist"
        )}
      </Button>

      <p className="text-xs text-center text-gray-500">
        By joining, you'll get updates about Alo—Sales and early access opportunities.
      </p>
    </form>
  );
};
