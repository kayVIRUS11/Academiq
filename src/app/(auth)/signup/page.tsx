'use client';

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";

export default function SignupPage() {
    const [agreed, setAgreed] = useState(false);

    return (
        <>
            <CardHeader>
                <CardTitle>Create your account</CardTitle>
                <CardDescription>Enter your information to get started.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your Name" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="name@example.com" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" />
                </div>
                <div className="flex items-center space-x-2 pt-2">
                    <Checkbox id="terms" checked={agreed} onCheckedChange={(checked) => setAgreed(checked as boolean)} />
                    <label
                        htmlFor="terms"
                        className="text-sm text-muted-foreground"
                    >
                        I agree to the <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link> and acknowledge the <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
                    </label>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <Button className="w-full" disabled={!agreed}>Create Account</Button>
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
