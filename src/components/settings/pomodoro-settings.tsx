
'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Loader2, Timer } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

const sounds = [
    { id: 'birds', name: 'Birds Chirping', path: '/birds.mp3' },
    { id: 'alarm', name: 'Digital Alarm', path: '/alarm.mp3' },
];

const pomodoroSettingsSchema = z.object({
  alarmSound: z.string(),
});

type PomodoroSettingsFormValues = z.infer<typeof pomodoroSettingsSchema>;

export function PomodoroSettings() {
  const { user, updateUserSettings } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PomodoroSettingsFormValues>({
    resolver: zodResolver(pomodoroSettingsSchema),
    defaultValues: {
      alarmSound: user?.user_metadata.pomodoro_alarm_sound || 'birds',
    },
  });

  useEffect(() => {
    if (user?.user_metadata.pomodoro_alarm_sound) {
      form.reset({ alarmSound: user.user_metadata.pomodoro_alarm_sound });
    }
  }, [user, form]);


  const onSubmit = async (values: PomodoroSettingsFormValues) => {
    setIsLoading(true);
    try {
      await updateUserSettings({ pomodoro_alarm_sound: values.alarmSound });
      toast({
        title: 'Settings Saved',
        description: 'Your Pomodoro alarm sound has been updated.',
      });
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Timer /> Pomodoro Timer</CardTitle>
            <CardDescription>Manage settings for the Pomodoro timer.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="alarmSound"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Alarm Sound</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          {sounds.map((sound) => (
                             <FormItem key={sound.id} className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value={sound.id} />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {sound.name}
                                </FormLabel>
                              </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 animate-spin" />}
                    Save Preferences
                </Button>
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}
