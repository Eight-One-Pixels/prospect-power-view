
import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'MAD' },
  { code: 'TND', name: 'Tunisian Dinar', symbol: 'TND' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SR' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'QR' },
  { code: 'MWK', name: 'Malawi Kwacha', symbol: 'MK' }
];

const Settings = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [preferredCurrency, setPreferredCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserPreferences();
    }
  }, [user]);

  const loadUserPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('preferred_currency')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Ignore "not found" errors
        throw error;
      }

      if (data?.preferred_currency) {
        setPreferredCurrency(data.preferred_currency);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const savePreferredCurrency = async (currency: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          preferred_currency: currency
        });

      if (error) throw error;

      setPreferredCurrency(currency);
      toast.success("Currency preference saved!");
    } catch (error) {
      console.error('Error saving currency preference:', error);
      toast.error("Failed to save currency preference");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <p className="text-sm text-gray-500 cursor-pointer" onClick={() => navigate("/") }>&larr; Back to Dashboard</p><br />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <p className="text-lg text-gray-600">
            Configure your application preferences
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Currency Preferences</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="preferredCurrency">Preferred Currency</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Set your preferred currency for viewing amounts. All amounts will be converted from their original currency to your preferred currency using current exchange rates.
                </p>
                <Select 
                  value={preferredCurrency} 
                  onValueChange={savePreferredCurrency}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select preferred currency" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg max-h-60">
                    {currencies.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code}>
                        {curr.symbol} {curr.code} - {curr.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {loading && (
                  <p className="text-sm text-gray-500">Saving...</p>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications" className="text-sm font-medium">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-gray-500">
                    Receive email updates about your goals and performance
                  </p>
                </div>
                <Switch id="emailNotifications" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="pushNotifications" className="text-sm font-medium">
                    Push Notifications
                  </Label>
                  <p className="text-sm text-gray-500">
                    Get notified about important updates
                  </p>
                </div>
                <Switch id="pushNotifications" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weeklyReports" className="text-sm font-medium">
                    Weekly Reports
                  </Label>
                  <p className="text-sm text-gray-500">
                    Receive weekly performance summaries
                  </p>
                </div>
                <Switch id="weeklyReports" defaultChecked />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Preferences</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="america/new_york">
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg">
                    <SelectItem value="america/new_york">Eastern Time (EST)</SelectItem>
                    <SelectItem value="america/chicago">Central Time (CST)</SelectItem>
                    <SelectItem value="america/denver">Mountain Time (MST)</SelectItem>
                    <SelectItem value="america/los_angeles">Pacific Time (PST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select defaultValue="mm/dd/yyyy">
                  <SelectTrigger>
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg">
                    <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select defaultValue="light">
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg">
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Account</h3>
            <div className="space-y-4">
              <Button 
                variant="destructive" 
                onClick={handleSignOut}
                className="w-full"
              >
                Sign Out
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
