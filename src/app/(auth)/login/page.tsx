'use client';

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const GoogleIcon = () => <svg className="size-5" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1H12.18V13.83H18.69C18.36 17.64 15.19 19.27 12.19 19.27C8.36 19.27 5.27 16.18 5.27 12.35C5.27 8.52 8.36 5.43 12.19 5.43C13.81 5.43 15.22 5.95 16.34 6.96L18.6 4.71C16.83 3.09 14.7 2.18 12.19 2.18C7.03 2.18 3 6.3 3 12.35C3 18.4 7.03 22.52 12.19 22.52C17.63 22.52 21.72 18.63 21.72 12.59C21.72 11.93 21.58 11.5 21.35 11.1Z"></path></svg>;


export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { signInWithEmail, signInWithGoogle, user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const verificationMessage = searchParams.get('verified');


    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await signInWithGoogle();
            router.push('/dashboard');
            toast({ title: "Signed in successfully!" });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    const handleEmailSignIn = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const result = await signInWithEmail(email, password);
            if (!result.user.emailVerified) {
                setError("Please verify your email before logging in. Check your inbox for a verification link.");
                setIsLoading(false);
                return;
            }
            router.push('/dashboard');
            toast({ title: "Signed in successfully!" });
        } catch (err: any) {
            let errorMessage = "An unknown error occurred.";
            if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === 'auth/invalid-credential') {
                errorMessage = "Invalid email or password. Please try again.";
            } else if (err.code === "auth/too-many-requests") {
                errorMessage = "Too many failed login attempts. Please try again later.";
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    if (user) {
        router.push('/dashboard');
        return null;
    }

    return (
        <>
            <CardHeader>
                <CardTitle>Sign in to Academiq</CardTitle>
                <CardDescription>Enter your credentials to access your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 {verificationMessage && (
                     <Alert variant="default" className="bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700">
                         <AlertDescription className="text-green-800 dark:text-green-300">
                             Your email has been verified! You can now log in.
                         </AlertDescription>
                     </Alert>
                 )}
                 {error && (
                    <Alert variant="destructive">
                        <AlertDescription>
                            {error}
                        </AlertDescription>
                    </Alert>
                 )}
                 <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : <><GoogleIcon /> Continue with Google</>}
                </Button>

                <div className="flex items-center gap-4">
                    <Separator className="flex-1"/>
                    <span className="text-xs text-muted-foreground">OR</span>
                    <Separator className="flex-1"/>
                </div>
                
                <form onSubmit={handleEmailSignIn} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} required disabled={isLoading} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading} />
                    </div>
                    <Button className="w-full" type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="animate-spin mr-2" />}
                        Sign In
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <p className="text-sm text-center">
                    Don't have an account?{' '}
                    <Link href="/join" className="font-semibold underline hover:text-primary">
                        Sign up
                    </Link>
                </p>
            </CardFooter>
        </>
    )
}
