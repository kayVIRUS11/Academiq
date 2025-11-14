'use client';

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { signInWithEmail, user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        if (user) {
            router.push('/dashboard');
        }
    }, [user, router]);

    const handleEmailSignIn = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        const { error } = await signInWithEmail(email, password);
        if (error) {
            setError(error.message);
        } else {
            toast({ title: "Signed in successfully!" });
            router.push('/dashboard');
        }
        setIsLoading(false);
    }

    if (user) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <>
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription>Sign in to continue to Academiq.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 {error && (
                    <Alert variant="destructive">
                        <AlertDescription>
                            {error}
                        </AlertDescription>
                    </Alert>
                 )}
                
                <form onSubmit={handleEmailSignIn} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} required disabled={isLoading} />
                    </div>
                    <div className="space-y-2">
                         <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Link href="#" className="text-sm font-medium text-primary hover:underline">
                                Forgot your password?
                            </Link>
                         </div>
                        <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading} />
                    </div>
                    <Button className="w-full" type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="animate-spin mr-2" />}
                        Login
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex-col items-center gap-4 text-center">
                 <p className="text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link href="/signup" className="font-semibold text-primary hover:underline">
                        Sign up
                    </Link>
                </p>
                 <p className="text-xs text-muted-foreground px-4">
                    By logging in, you agree to the <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
                </p>
            </CardFooter>
        </>
    )
}
