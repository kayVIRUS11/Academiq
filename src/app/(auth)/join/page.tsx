'use client';

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function JoinPage() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            router.push('/dashboard');
        }
    }, [user, router]);

    if (user) {
        return null; // Or a loading spinner
    }

    return (
        <>
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Join Academiq today</CardTitle>
                <CardDescription>Focus. Organize. Succeed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button asChild className="w-full">
                    <Link href="/signup">Create account with Email</Link>
                </Button>
                <p className="text-xs text-muted-foreground text-center px-4">
                    By signing up, you agree to the <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
                </p>

            </CardContent>
            <CardFooter className="flex-col items-start gap-4 pt-4 border-t">
                <p className="text-sm w-full text-center">
                    Already have an account?{' '}
                    <Link href="/login" className="font-semibold underline hover:text-primary">
                        Sign in
                    </Link>
                </p>
            </CardFooter>
        </>
    )
}
