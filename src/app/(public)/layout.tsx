
'use client';

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ArrowRight, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isLegalPage = pathname === '/privacy' || pathname === '/terms';

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border/50">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <Link href="/">
                        <Logo />
                    </Link>
                    <div className="hidden md:flex items-center gap-4">
                        <Button variant="ghost" asChild>
                            <Link href="/login">Sign In</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/join">Get Started <ArrowRight className="ml-2"/></Link>
                        </Button>
                    </div>
                     <div className="md:hidden">
                        <Button size="icon" variant="outline">
                            <Menu/>
                        </Button>
                    </div>
                </div>
            </header>
            <div className="flex-1">
                {children}
            </div>
        </div>
    )
}
