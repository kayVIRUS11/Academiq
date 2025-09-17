
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Download, Upload, Palette, AppWindow, Bell, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserDataSummary } from "@/components/settings/user-data-summary";
import { LogoutButton } from "@/components/settings/logout-button";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { useAuth } from "@/context/auth-context";
import { AccountSettingsForm } from "@/components/settings/account-settings-form";
import { useInstallPrompt } from "@/context/install-prompt-context";

export default function SettingsPage() {
  const { user } = useAuth();
  const { installPromptEvent, triggerInstallPrompt } = useInstallPrompt();
  
  return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
                    <User className="w-8 h-8"/>
                    Account & Settings
                </h1>
                {user && (
                    <p className="text-muted-foreground mt-1">
                        {user.user_metadata.full_name} &middot; {user.email}
                    </p>
                )}
            </div>
        </div>
        
        <AccountSettingsForm />
        
        <UserDataSummary />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Palette /> Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent>
            <ThemeToggle />
        </CardContent>
      </Card>>
      
      {installPromptEvent && (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><AppWindow /> Install App</CardTitle>
                <CardDescription>Install Academiq on your device for a native-like experience, including offline access.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={triggerInstallPrompt}>
                    <Download className="mr-2" />
                    Install Academiq
                </Button>
            </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Export your data for backup or import it to another device. (Feature coming soon)</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
            <Button disabled>
                <Download className="mr-2"/>
                Export Data
            </Button>
            <Button variant="secondary" disabled>
                <Upload className="mr-2" />
                Import Data
            </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Manage your account settings.</CardDescription>
        </CardHeader>
        <CardContent>
            <LogoutButton />
        </CardContent>
      </Card>
    </div>
  );
}
