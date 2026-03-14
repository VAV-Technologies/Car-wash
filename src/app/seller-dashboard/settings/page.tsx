'use client';

// Force dynamic rendering due to client-side interactivity
export const dynamic = 'force-dynamic'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useUserSettings } from "@/hooks/use-user-settings";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function SellerSettingsPage() {
  const { settings, isLoading, error, updateSettings } = useUserSettings();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleNotificationToggle = async (key: string, value: boolean) => {
    setIsSaving(true);
    try {
      const success = await updateSettings({ [key]: value });
      if (success) {
        toast({
          title: "Settings Updated",
          description: "Your notification preferences have been saved."
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update settings. Please try again."
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update settings. Please try again."
      });
    }
    setIsSaving(false);
  };

  if (error) {
    return (
      <div className="space-y-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-red-600">Error Loading Settings</h1>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-semibold tracking-tight">Seller Account Settings</h1>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight">Seller Account Settings</h1>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Manage how you receive notifications related to your listings and inquiries.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="email-general" className="font-medium">General Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive general updates and announcements from Nobridge.</p>
            </div>
            <Switch
              id="email-general"
              checked={settings?.email_notifications_general ?? true}
              onCheckedChange={(checked) => handleNotificationToggle('email_notifications_general', checked)}
              disabled={isSaving}
              aria-label="Toggle general email notifications"
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="email-new-inquiry" className="font-medium">New Inquiry Emails</Label>
              <p className="text-sm text-muted-foreground">Receive an email when a buyer makes an inquiry on one of your listings.</p>
            </div>
            <Switch
              id="email-new-inquiry"
              checked={settings?.email_notifications_inquiries ?? true}
              onCheckedChange={(checked) => handleNotificationToggle('email_notifications_inquiries', checked)}
              disabled={isSaving}
              aria-label="Toggle new inquiry email notifications"
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="email-listing-updates" className="font-medium">Listing Status Emails</Label>
              <p className="text-sm text-muted-foreground">Get notified via email about changes to your listing status (e.g., verification approved, deactivated).</p>
            </div>
            <Switch
              id="email-listing-updates"
              checked={settings?.email_notifications_listing_updates ?? true}
              onCheckedChange={(checked) => handleNotificationToggle('email_notifications_listing_updates', checked)}
              disabled={isSaving}
              aria-label="Toggle listing status email notifications"
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="email-system" className="font-medium">System & Security Emails</Label>
              <p className="text-sm text-muted-foreground">Important system notifications, security alerts, and policy updates.</p>
            </div>
            <Switch
              id="email-system"
              checked={settings?.email_notifications_system ?? true}
              onCheckedChange={(checked) => handleNotificationToggle('email_notifications_system', checked)}
              disabled={isSaving}
              aria-label="Toggle system email notifications"
            />
          </div>

          {isSaving && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Saving...</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator/>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Profile & Account Management</CardTitle>
          <CardDescription>Links to manage your public profile and account security.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Button variant="outline" asChild>
                <a href="/seller-dashboard/profile">Edit My Seller Profile</a>
            </Button>
            <p className="text-sm text-muted-foreground">
                To change your password, please go to your profile page.
            </p>
        </CardContent>
      </Card>

      <Separator/>

      <Card className="shadow-md border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-6 w-6" /> Danger Zone
            </CardTitle>
            <CardDescription>Manage sensitive account actions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
                <h3 className="font-medium text-foreground">Deactivate Account</h3>
                <p className="text-sm text-muted-foreground mb-2">
                    Deactivating your account will temporarily hide your profile and all your listings. You can reactivate it later by contacting support.
                </p>
                <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
                    Deactivate My Account (Placeholder)
                </Button>
            </div>
             <div>
                <h3 className="font-medium text-foreground">Delete Account</h3>
                <p className="text-sm text-muted-foreground mb-2">
                    Permanently delete your account and all associated data, including your listings and inquiries. This action cannot be undone.
                </p>
                <Button variant="destructive">
                    Delete My Account (Placeholder)
                </Button>
            </div>
          </CardContent>
      </Card>
    </div>
  );
}
