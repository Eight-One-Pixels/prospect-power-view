import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Twitter, Linkedin, MessageCircle, Mail, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WaitlistSuccessProps {
  position: number;
  referralCode: string;
  email: string;
  fullName: string;
}

export const WaitlistSuccess = ({
  position,
  referralCode,
  email,
  fullName,
}: WaitlistSuccessProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const referralUrl = `${window.location.origin}?ref=${referralCode}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const getReferralTier = (pos: number) => {
    if (pos <= 50) return { name: "Top 50", color: "text-purple-600", icon: "👑" };
    if (pos <= 100) return { name: "Top 100", color: "text-indigo-600", icon: "⭐" };
    if (pos <= 250) return { name: "Top 250", color: "text-blue-600", icon: "🚀" };
    return { name: "Waitlist", color: "text-gray-600", icon: "🎯" };
  };

  const tier = getReferralTier(position);

  const shareText = encodeURIComponent(
    `Just joined the Alo—Sales waitlist! 🚀 Transform your sales process with AI-powered insights. Join me:`
  );

  const shareViaTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(referralUrl)}`,
      "_blank"
    );
  };

  const shareViaLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`,
      "_blank"
    );
  };

  const shareViaWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${shareText}%20${encodeURIComponent(referralUrl)}`,
      "_blank"
    );
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent("Join me on the Alo—Sales waitlist!");
    const body = encodeURIComponent(
      `Hey!\n\nI just joined the waitlist for Alo—Sales, an amazing sales management platform.\n\nJoin me and we can both skip the line: ${referralUrl}\n\nLet's revolutionize our sales process together!\n\nBest,\n${fullName}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Success Header */}
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">{tier.icon}</div>
        <h3 className="text-3xl font-bold text-gray-900 mb-2">
          You're on the list!
        </h3>
        <p className="text-gray-600">
          We've sent a confirmation to <strong>{email}</strong>
        </p>
      </div>

      {/* Position Card */}
      <Card className="p-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Your position</p>
          <div className={`text-6xl font-bold ${tier.color} mb-2`}>
            #{position}
          </div>
          <p className={`text-lg font-semibold ${tier.color} mb-4`}>
            {tier.name}
          </p>
          <div className="inline-block px-4 py-2 bg-white rounded-full shadow-sm">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">{Math.max(0, position - 1)}</span> people ahead of you
            </p>
          </div>
        </div>
      </Card>

      {/* Referral Boost Card */}
      <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
        <div className="flex items-start gap-3 mb-4">
          <Sparkles className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-gray-900 mb-1">Skip the Line! ⚡</h4>
            <p className="text-sm text-gray-700 mb-2">
              Share your referral link and move up faster:
            </p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>Each referral</strong> = Move up 10 positions</li>
              <li>• <strong>3 referrals</strong> = Priority support when you join</li>
              <li className="text-green-700 font-semibold">• <strong>5 referrals</strong> = Instant Access! 🎉</li>
              <li className="text-purple-700 font-semibold">• <strong>10 referrals</strong> = Lifetime 20% discount + extras!</li>
            </ul>
          </div>
        </div>

        {/* Referral Link */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700">Your referral link:</p>
          <div className="flex gap-2">
            <Input
              value={referralUrl}
              readOnly
              className="bg-white font-mono text-sm"
              onClick={(e) => e.currentTarget.select()}
            />
            <Button onClick={copyToClipboard} variant="outline" size="icon">
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Social Share Buttons */}
          <div className="pt-2">
            <p className="text-sm font-semibold text-gray-700 mb-2">Share via:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button
                onClick={shareViaTwitter}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              <Button
                onClick={shareViaLinkedIn}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
              <Button
                onClick={shareViaWhatsApp}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                onClick={shareViaEmail}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* What's Next Card */}
      <Card className="p-6 bg-gray-50">
        <h4 className="font-semibold text-gray-900 mb-3">What happens next?</h4>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-600">
              1
            </div>
            <div>
              <p className="font-medium text-gray-900">Check your email</p>
              <p className="text-sm text-gray-600">
                We've sent you a confirmation with your referral link
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-600">
              2
            </div>
            <div>
              <p className="font-medium text-gray-900">Share your link</p>
              <p className="text-sm text-gray-600">
                Every friend who joins moves you up 10 positions
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-600">
              3
            </div>
            <div>
              <p className="font-medium text-gray-900">Get your invite</p>
              <p className="text-sm text-gray-600">
                We'll email you when it's your turn to join
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-semibold text-green-600">
              ⚡
            </div>
            <div>
              <p className="font-medium text-gray-900">Or skip the wait!</p>
              <p className="text-sm text-gray-600">
                Get 5 referrals for instant access
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500">
        <p>
          Questions? Reach us at{" "}
          <a href="mailto:hello@eiteone.org" className="text-indigo-600 hover:underline">
            hello@eiteone.org
          </a>
        </p>
      </div>
    </div>
  );
};
