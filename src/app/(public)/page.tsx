import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
    return (
        <div className="text-center space-y-6 max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold font-headline tracking-tighter">
                Focus. Organize. Succeed.
            </h1>
            <p className="text-lg text-muted-foreground">
                Academiq is your all-in-one productivity partner, intelligently designed to help you conquer your academic goals.
            </p>
            <div className="flex justify-center gap-4">
                <Button asChild size="lg">
                    <Link href="/join">Get Started for Free</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                    <Link href="/login">Sign In</Link>
                </Button>
            </div>
            <div className="relative w-full max-w-xl aspect-[4/3] mx-auto mt-12 rounded-2xl border-8 border-gray-300 dark:border-gray-700 overflow-hidden shadow-2xl">
                <Image
                    src="https://picsum.photos/seed/dashboard-ui/800/600"
                    alt="Academiq App Screenshot"
                    fill
                    className="object-cover"
                    data-ai-hint="app screenshot"
                />
            </div>
        </div>
    );
}
