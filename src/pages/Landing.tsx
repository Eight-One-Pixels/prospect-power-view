import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Shield, 
  Clock, 
  Globe,
  CheckCircle2,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Sparkles
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import icon from '@/assets/icon.png';
import { useState } from "react";
import { WaitlistForm } from "@/components/forms/WaitlistForm";
import { WaitlistSuccess } from "@/components/forms/WaitlistSuccess";

const Landing = () => {
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState<{
    position: number;
    referralCode: string;
    email: string;
    fullName: string;
  } | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img src={icon} alt="Alo—Sales icon" className="h-8 w-8" />
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Alo—Sales
              </span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
                Pricing
              </a>
              <a href="#waitlist" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
                Join Waitlist
              </a>
              <a href="#contact" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
                Contact
              </a>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
              onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Join Waitlist
            </Button>
            <Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  Contact Us
                </Button>
              </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Request Access</DialogTitle>
                    <DialogDescription>
                      Contact us to get your demo credentials and see the platform in action
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <a
                      href="mailto:hello@eiteone.org"
                      className="flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                    >
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Mail className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">Email Us</h3>
                        <p className="text-sm text-gray-600">hello@eiteone.org</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    </a>

                    <a
                      href="https://wa.me/265996554837"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all group"
                    >
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MessageCircle className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">WhatsApp</h3>
                        <p className="text-sm text-gray-600">+265 99 655 4837</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                    </a>

                    <a
                      href="tel:+265996554837"
                      className="flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Phone className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">Call Us</h3>
                        <p className="text-sm text-gray-600">+265 99 655 4837</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </a>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 lg:px-8 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Track Sales. Drive Growth. Win More.
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A lightweight, secure, and efficient sales lead tracking system designed to help sales teams track, manage, and report their daily activities with ease.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-lg px-8"
              onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Join the Waitlist
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Built for modern sales teams who need powerful features without the complexity
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature Cards */}
          <Card className="p-6 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm border-0">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-Time Analytics</h3>
            <p className="text-gray-600">
              Track your sales performance with live dashboards and actionable insights that help you make data-driven decisions.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm border-0">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Team Management</h3>
            <p className="text-gray-600">
              Manage your entire sales team, assign territories, track individual performance, and boost collaboration.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm border-0">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Lead Tracking</h3>
            <p className="text-gray-600">
              Never lose a lead again. Track every interaction, follow-up, and conversion opportunity in one place.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm border-0">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
            <p className="text-gray-600">
              Enterprise-grade security with role-based access control. Your data is encrypted and always protected.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm border-0">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Activity Logging</h3>
            <p className="text-gray-600">
              Log client visits, calls, and meetings with timestamps and location tracking for complete visibility.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm border-0">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center mb-4">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Mobile Ready</h3>
            <p className="text-gray-600">
              Access your dashboard anywhere, anytime. Optimized for mobile devices to keep your team productive on-the-go.
            </p>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 lg:px-8 py-20 bg-white/50">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600">
            Choose the plan that fits your team size and needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Starter Plan */}
          <Card className="p-8 bg-white border-2 hover:border-indigo-500 transition-all hover:shadow-xl">
            <h3 className="text-2xl font-bold mb-2">Starter</h3>
            <p className="text-gray-600 mb-6">Perfect for small teams</p>
            <div className="mb-6">
              <span className="text-4xl font-bold">$29</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Up to 5 users</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Basic analytics</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Email support</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Mobile app access</span>
              </li>
            </ul>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Join Waitlist
            </Button>
          </Card>

          {/* Professional Plan */}
          <Card className="p-8 bg-gradient-to-br from-indigo-500 to-purple-500 text-white border-0 shadow-2xl transform scale-105">
            <div className="bg-white text-indigo-600 text-sm font-semibold py-1 px-3 rounded-full inline-block mb-4">
              MOST POPULAR
            </div>
            <h3 className="text-2xl font-bold mb-2">Professional</h3>
            <p className="text-indigo-100 mb-6">For growing teams</p>
            <div className="mb-6">
              <span className="text-4xl font-bold">$79</span>
              <span className="text-indigo-100">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-white" />
                <span>Up to 20 users</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-white" />
                <span>Advanced analytics</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-white" />
                <span>Priority support</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-white" />
                <span>Custom reports</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-white" />
                <span>API access</span>
              </li>
            </ul>
            <Button 
              className="w-full bg-white text-indigo-600 hover:bg-indigo-50"
              onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Join Waitlist
            </Button>
          </Card>

          {/* Enterprise Plan */}
          <Card className="p-8 bg-white border-2 hover:border-indigo-500 transition-all hover:shadow-xl">
            <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
            <p className="text-gray-600 mb-6">For large organizations</p>
            <div className="mb-6">
              <span className="text-4xl font-bold">Custom</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Unlimited users</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Custom integrations</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Dedicated support</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>On-premise deployment</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Custom training</span>
              </li>
            </ul>
            <Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" variant="outline">
                  Contact Sales
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Contact Sales</DialogTitle>
                  <DialogDescription>
                    Get in touch to discuss enterprise solutions and custom pricing
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <a
                    href="mailto:hello@eiteone.org"
                    className="flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                  >
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Email Us</h3>
                      <p className="text-sm text-gray-600">hello@eiteone.org</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </a>

                  <a
                    href="https://wa.me/265996554837"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all group"
                  >
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">WhatsApp</h3>
                      <p className="text-sm text-gray-600">+265 99 655 4837</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                  </a>

                  <a
                    href="tel:+265996554837"
                    className="flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Call Us</h3>
                      <p className="text-sm text-gray-600">+265 99 655 4837</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </a>
                </div>
              </DialogContent>
            </Dialog>
          </Card>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="waitlist" className="container mx-auto px-4 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 lg:p-12 bg-gradient-to-br from-indigo-50 to-purple-50 border-0 shadow-xl">
            <div className="text-center mb-8">
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full mb-4">
                <span className="font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Limited Access Beta
                </span>
              </div>
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Join the Exclusive Waitlist
              </h2>
              <p className="text-xl text-gray-600">
                Get early access and help shape the future of sales management
              </p>
            </div>

            {/* Show form or success based on submission */}
            {waitlistSuccess ? (
              <WaitlistSuccess
                position={waitlistSuccess.position}
                referralCode={waitlistSuccess.referralCode}
                email={waitlistSuccess.email}
                fullName={waitlistSuccess.fullName}
              />
            ) : (
              <>
                {/* Waitlist Form */}
                <WaitlistForm onSuccess={setWaitlistSuccess} />

                {/* Already have credentials */}
                <div className="text-center mt-6">
                  <p className="text-sm text-gray-600">
                    Already have access?{" "}
                    <Link to="/auth" className="text-indigo-600 hover:underline font-semibold">
                      Sign In
                    </Link>
                  </p>
                </div>

                {/* Benefits */}
                <div className="grid md:grid-cols-3 gap-6 mt-12 pt-8 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-4xl mb-3">⚡</div>
                    <h3 className="font-semibold mb-2">Skip the Line</h3>
                    <p className="text-sm text-gray-600">
                      Each referral moves you up 10 positions
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-3">🎁</div>
                    <h3 className="font-semibold mb-2">Instant Access</h3>
                    <p className="text-sm text-gray-600">
                      5 referrals = immediate access
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-3">👥</div>
                    <h3 className="font-semibold mb-2">Invite Your Team</h3>
                    <p className="text-sm text-gray-600">
                      Get invite codes to bring colleagues
                    </p>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="container mx-auto px-4 lg:px-8 py-20 bg-white/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Get in Touch
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Have questions? We'd love to hear from you.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <a
              href="mailto:hello@eiteone.org"
              className="block"
            >
              <Card className="p-6 bg-white border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer hover:scale-105 transform transition-transform">
                <Mail className="h-8 w-8 text-indigo-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-indigo-600 hover:underline">
                  hello@eiteone.org
                </p>
              </Card>
            </a>

            <a
              href="https://wa.me/265996554837"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Card className="p-6 bg-white border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer hover:scale-105 transform transition-transform">
                <MessageCircle className="h-8 w-8 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">WhatsApp</h3>
                <p className="text-green-600 hover:underline">
                  +265 99 655 4837
                </p>
              </Card>
            </a>

            <a
              href="tel:+265996554837"
              className="block"
            >
              <Card className="p-6 bg-white border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer hover:scale-105 transform transition-transform">
                <Phone className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Call Us</h3>
                <p className="text-blue-600 hover:underline">
                  +265 99 655 4837
                </p>
              </Card>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img src={icon} alt="Alo—Sales icon" className="h-6 w-6" />
              <span className="font-semibold text-gray-800">Alo—Sales Dashboard</span>
            </div>
            <p className="text-sm text-gray-600">
              © 2025 eiteone. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm text-gray-600">
              <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
              <a href="#contact" className="hover:text-indigo-600 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
