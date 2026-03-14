
'use client';

// Force dynamic rendering due to client-side interactivity
export const dynamic = 'force-dynamic'

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { AlertTriangle, KeyRound } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";

const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
  confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "New passwords do not match.",
  path: ["confirmNewPassword"],
});


export default function SettingsPage() {
  const { toast } = useToast();
  const [isPasswordPending, startPasswordTransition] = useTransition();

  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [newInquiryAlerts, setNewInquiryAlerts] = React.useState(true);
  const [listingStatusAlerts, setListingStatusAlerts] = React.useState(true);


  const passwordForm = useForm<z.infer<typeof PasswordChangeSchema>>({
    resolver: zodResolver(PasswordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onPasswordSubmit = (values: z.infer<typeof PasswordChangeSchema>) => {
    startPasswordTransition(async () => {
      console.log("Password change values:", values);
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (values.currentPassword === "wrongpassword") { 
        passwordForm.setError("currentPassword", { type: "manual", message: "Incorrect current password."});
        toast({ variant: "destructive", title: "Error", description: "Failed to change password. Incorrect current password." });
      } else {
        toast({ title: "Password Changed", description: "Your password has been successfully updated." });
        passwordForm.reset();
      }
    });
  };

  const handleNotificationPreferenceSave = () => {
    console.log("Notification preferences saved:", { emailNotifications, newInquiryAlerts, listingStatusAlerts });
    toast({ title: "Preferences Saved", description: "Your notification preferences have been updated."});
  }


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight text-brand-dark-blue">Account Settings</h1>

      <Card className="shadow-md bg-brand-white">
        <CardHeader>
          <CardTitle className="text-brand-dark-blue">Notification Preferences</CardTitle>
          <CardDescription>Manage how you receive notifications from Nobridge.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border border-brand-light-gray rounded-lg">
            <div>
              <Label htmlFor="email-notifications-general" className="font-medium text-brand-dark-blue">General Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive important account updates, system announcements, and newsletters.</p>
            </div>
            <Switch 
              id="email-notifications-general" 
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
              aria-label="Toggle general email notifications" 
            />
          </div>
          <div className="flex items-center justify-between p-4 border border-brand-light-gray rounded-lg">
            <div>
              <Label htmlFor="email-new-inquiry" className="font-medium text-brand-dark-blue">New Inquiry Emails</Label>
              <p className="text-sm text-muted-foreground">Receive an email when a buyer makes an inquiry on one of your listings (for sellers) or when a seller engages (for buyers).</p>
            </div>
            <Switch 
              id="email-new-inquiry" 
              checked={newInquiryAlerts}
              onCheckedChange={setNewInquiryAlerts}
              aria-label="Toggle new inquiry email notifications" 
            />
          </div>
          <div className="flex items-center justify-between p-4 border border-brand-light-gray rounded-lg">
            <div>
              <Label htmlFor="email-listing-updates" className="font-medium text-brand-dark-blue">Listing &amp; Verification Status Emails</Label>
              <p className="text-sm text-muted-foreground">Get notified via email about changes to your listing status or verification progress.</p>
            </div>
            <Switch 
              id="email-listing-updates" 
              checked={listingStatusAlerts}
              onCheckedChange={setListingStatusAlerts}
              aria-label="Toggle listing status email notifications" 
            />
          </div>
           <Button onClick={handleNotificationPreferenceSave} className="bg-brand-dark-blue text-brand-white hover:bg-brand-dark-blue/90">Save Notification Preferences</Button>
        </CardContent>
      </Card>

      <Separator/>

      <Card className="shadow-md bg-brand-white">
        <CardHeader>
          <CardTitle className="text-brand-dark-blue flex items-center"><KeyRound className="mr-2 h-5 w-5"/>Change Password</CardTitle>
          <CardDescription>Update your account password.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="currentPassword">Current Password</FormLabel>
                    <FormControl><Input id="currentPassword" {...field} type="password" disabled={isPasswordPending} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="newPassword">New Password</FormLabel>
                    <FormControl><Input id="newPassword" {...field} type="password" disabled={isPasswordPending} /></FormControl>
                    <FormDescription className="text-xs">Must be at least 8 characters.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmNewPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="confirmNewPassword">Confirm New Password</FormLabel>
                    <FormControl><Input id="confirmNewPassword" {...field} type="password" disabled={isPasswordPending} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPasswordPending} className="bg-brand-dark-blue text-brand-white hover:bg-brand-dark-blue/90">
                {isPasswordPending ? "Changing..." : "Change Password"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Separator/>

      <Card className="shadow-md border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-6 w-6" /> Danger Zone
            </CardTitle>
            <CardDescription className="text-destructive/80">Manage sensitive account actions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
                <h3 className="font-medium text-brand-dark-blue">Deactivate Account</h3>
                <p className="text-sm text-muted-foreground mb-2">
                    Deactivating your account will temporarily hide your profile and listings. You can reactivate it later.
                </p>
                <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
                    Deactivate My Account
                </Button>
            </div>
             <div>
                <h3 className="font-medium text-brand-dark-blue">Delete Account</h3>
                <p className="text-sm text-muted-foreground mb-2">
                    Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Button variant="destructive" className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete My Account
                </Button>
            </div>
            </CardContent>
        </Card>
      </div>
    );
  }
