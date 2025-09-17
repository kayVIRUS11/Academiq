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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { alarmSounds } from "@/context/pomodoro-context";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function SettingsPage() {
  const { user, updateUserSettings } = useAuth();
  const { installPromptEvent, triggerInstallPrompt } = useInstallPrompt();
  const { toast } = useToast();
  const [selectedSound, setSelectedSound] = useState(user?.user_metadata?.pomodoro_sound || 'alarm');

  const handleSoundChange = async (soundId: string) => {
    setSelectedSound(soundId);
    try {
      await updateUserSettings({ pomodoro_sound: soundId });
      toast({
        title: "Sound Updated",
        description: "Your Pomodoro alarm sound has been changed. The new sound will be used on your next session."
      });
    } catch (error: any) {
      toast({ title: "Update Failed", description: error.message, variant: 'destructive' });
    }
  }
  
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
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Timer /> Pomodoro Settings</CardTitle>
            <CardDescription>Customize your Pomodoro timer.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-2">
                <label className="text-sm font-medium">Alarm Sound</label>
                <Select value={selectedSound} onValueChange={handleSoundChange}>
                    <SelectTrigger className="w-full md:w-1/2">
                        <SelectValue placeholder="Select an alarm sound" />
                    </SelectTrigger>
                    <SelectContent>
                        {alarmSounds.map(sound => (
                            <SelectItem key={sound.id} value={sound.id}>
                                {sound.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>
      
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