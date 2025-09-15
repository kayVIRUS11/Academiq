'use client';

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SignupPage() {
    const [agreed, setAgreed] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const { signUpWithEmail, user } = useAuth();
    const router = useRouter();

    const handleSignup = async (e: FormEvent) => {
        e.preventDefault();
        if (!agreed) {
            setError("You must agree to the terms and policies to create an account.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            await signUpWithEmail(email, password, name);
            setSuccess(true);
        } catch (err: any) {
            if (err.code === 'auth/email-already-in-use') {
                setError('An account with this email address already exists.');
            } else if (err.code === 'auth/weak-password') {
                setError('The password is too weak. Please choose a stronger password.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (user) {
        router.push('/dashboard');
        return null;
    }

    if (success) {
        return (
            <>
                <CardHeader className="text-center">
                    <CardTitle>Check your inbox</CardTitle>
                    <CardDescription>We've sent a verification link to <span className="font-bold">{email}</span>. Please click the link to activate your account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full">
                        <Link href="/login">Back to Sign In</Link>
                    </Button>
                </CardContent>
            </>
        )
    }


    return (
        <>
            <CardHeader>
                <CardTitle>Create your account</CardTitle>
                <CardDescription>Enter your information to get started.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 {error && (
                    <Alert variant="destructive">
                        <AlertDescription>
                            {error}
                        </AlertDescription>
                    </Alert>
                 )}
                 <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} required disabled={isLoading} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} required disabled={isLoading} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading} />
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                        <Checkbox id="terms" checked={agreed} onCheckedChange={(checked) => setAgreed(checked as boolean)} disabled={isLoading}/>
                        <label
                            htmlFor="terms"
                            className="text-sm text-muted-foreground"
                        >
                            I agree to the <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link> and acknowledge the <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
                        </label>
                    </div>
                    <Button className="w-full" disabled={!agreed || isLoading} type="submit">
                         {isLoading && <Loader2 className="animate-spin mr-2" />}
                        Create Account
                    </Button>
                 </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                 <p className="text-sm text-center">
                    Already have an account?{' '}
                    <Link href="/login" className="font-semibold underline hover:text-primary">
                        Sign in
                    </Link>
                </p>
            </CardFooter>
        </>
    )
}
