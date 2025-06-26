
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Bell, Mail, MessageSquare, Target, Calendar } from "lucide-react";

export const NotificationSettings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [leadNotifications, setLeadNotifications] = useState(true);
  const [goalReminders, setGoalReminders] = useState(true);
  const [visitReminders, setVisitReminders] = useState(true);
  const [followUpReminders, setFollowUpReminders] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [reminderTime, setReminderTime] = useState("09:00");
  const [digestFrequency, setDigestFrequency] = useState("daily");

  const handleSave = () => {
    // Here you would typically save to backend
    console.log('Saving notification settings...');
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white/70 backdrop-blur-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5" />
          General Notifications
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-gray-600">Receive notifications via email</p>
            </div>
            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-gray-600">Receive browser push notifications</p>
            </div>
            <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Default Reminder Time</Label>
            <Select value={reminderTime} onValueChange={setReminderTime}>
              <SelectTrigger className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="08:00">8:00 AM</SelectItem>
                <SelectItem value="09:00">9:00 AM</SelectItem>
                <SelectItem value="10:00">10:00 AM</SelectItem>
                <SelectItem value="11:00">11:00 AM</SelectItem>
                <SelectItem value="12:00">12:00 PM</SelectItem>
                <SelectItem value="13:00">1:00 PM</SelectItem>
                <SelectItem value="14:00">2:00 PM</SelectItem>
                <SelectItem value="15:00">3:00 PM</SelectItem>
                <SelectItem value="16:00">4:00 PM</SelectItem>
                <SelectItem value="17:00">5:00 PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-white/70 backdrop-blur-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Sales Activities
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>New Lead Notifications</Label>
              <p className="text-sm text-gray-600">Get notified when new leads are assigned</p>
            </div>
            <Switch checked={leadNotifications} onCheckedChange={setLeadNotifications} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Goal Progress Reminders</Label>
              <p className="text-sm text-gray-600">Weekly reminders about goal progress</p>
            </div>
            <Switch checked={goalReminders} onCheckedChange={setGoalReminders} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Visit Reminders</Label>
              <p className="text-sm text-gray-600">Reminders for scheduled client visits</p>
            </div>
            <Switch checked={visitReminders} onCheckedChange={setVisitReminders} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Follow-up Reminders</Label>
              <p className="text-sm text-gray-600">Reminders for lead follow-ups</p>
            </div>
            <Switch checked={followUpReminders} onCheckedChange={setFollowUpReminders} />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-white/70 backdrop-blur-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Reports & Digests
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Daily Activity Digest</Label>
              <p className="text-sm text-gray-600">Summary of daily activities and performance</p>
            </div>
            <Switch checked={dailyDigest} onCheckedChange={setDailyDigest} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Performance Report</Label>
              <p className="text-sm text-gray-600">Weekly summary of goals and achievements</p>
            </div>
            <Switch checked={weeklyReport} onCheckedChange={setWeeklyReport} />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Digest Frequency</Label>
            <Select value={digestFrequency} onValueChange={setDigestFrequency}>
              <SelectTrigger className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          Save Notification Settings
        </Button>
      </div>
    </div>
  );
};
