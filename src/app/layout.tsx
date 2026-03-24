import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/context/auth-context';
import { SupabaseProvider } from '@/supabase';

export const metadata: Metadata = {
  title: 'Academiq',
  description: 'Your academic success partner.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8BC34A" />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <SupabaseProvider>
                <AuthProvider>
                    {children}
                    <Toaster />
                </AuthProvider>
            </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
