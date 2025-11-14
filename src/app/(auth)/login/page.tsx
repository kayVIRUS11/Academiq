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
        return null; // Or a loading spinner
    }

    return (
        <>
            <CardHeader>
                <CardTitle>Sign in to Academiq</CardTitle>
                <CardDescription>Enter your credentials to access your account.</CardDescription>
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
