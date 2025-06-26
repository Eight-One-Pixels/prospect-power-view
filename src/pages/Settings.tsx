
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { DeductionsSettings } from "@/components/settings/DeductionsSettings";
import { useAuth } from "@/hooks/useAuth";

const Settings = () => {
  const { user, userRole } = useAuth();
  const isAdminOrDirector = userRole === 'admin' || userRole === 'director';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
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
            <Card className="p-6 bg-white/70 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-4">General Settings</h3>
              <p className="text-gray-600">General application settings will be available here.</p>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <Card className="p-6 bg-white/70 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
              <p className="text-gray-600">Profile configuration options will be available here.</p>
            </Card>
          </TabsContent>

          {isAdminOrDirector && (
            <TabsContent value="deductions" className="space-y-4">
              <DeductionsSettings />
            </TabsContent>
          )}

          <TabsContent value="notifications" className="space-y-4">
            <Card className="p-6 bg-white/70 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
              <p className="text-gray-600">Notification preferences will be available here.</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
