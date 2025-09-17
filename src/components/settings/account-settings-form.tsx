
'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const accountSettingsSchema = z.object({
  full_name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
});

type AccountSettingsFormValues = z.infer<typeof accountSettingsSchema>;

export function AccountSettingsForm() {
  const { user, updateUserSettings } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AccountSettingsFormValues>({
    resolver: zodResolver(accountSettingsSchema),
    defaultValues: {
      full_name: user?.user_metadata.full_name || '',
    },
  });

  useEffect(() => {
    if (user?.user_metadata.full_name) {
      form.reset({ full_name: user.user_metadata.full_name });
    }
  }, [user, form]);


  const onSubmit = async (values: AccountSettingsFormValues) => {
    setIsLoading(true);
    try {
      await updateUserSettings(values);
      toast({
        title: 'Profile Updated',
        description: 'Your display name has been changed.',
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
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Manage your public profile information.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                        <Input placeholder="Your name" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 animate-spin" />}
                    Save Changes
                </Button>
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}
