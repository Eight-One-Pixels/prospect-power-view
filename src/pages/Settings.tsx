
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { DeductionsSettings } from "@/components/settings/DeductionsSettings";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";

const Settings = () => {
  const { user, userRole } = useAuth();
  const isAdminOrDirector = userRole === 'admin' || userRole === 'director';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navigation />
      
      <div className="p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <PageHeader 
            title="Settings" 
            description="Configure your application preferences and system settings"
          />

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="bg-white/70 backdrop-blur-sm">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              {isAdminOrDirector && (
                <TabsTrigger value="deductions">Tax & Deductions</TabsTrigger>
              )}
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <GeneralSettings />
            </TabsContent>

            <TabsContent value="profile" className="space-y-4">
              <ProfileSettings />
            </TabsContent>

            {isAdminOrDirector && (
              <TabsContent value="deductions" className="space-y-4">
                <DeductionsSettings />
              </TabsContent>
            )}

            <TabsContent value="notifications" className="space-y-4">
              <NotificationSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;
