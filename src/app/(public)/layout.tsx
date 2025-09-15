
'use client';

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const isLegalPage = pathname === '/privacy' || pathname === '/terms';

    return (
        <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <Link href="/">
                        <Logo />
                    </Link>
                    {isLegalPage && (
                         <Button variant="ghost" onClick={() => router.back()}>
                            <ArrowLeft className="mr-2" />
                            Back
                        </Button>
                    )}
                </div>
            </header>
            <div className="flex-1">
                {children}
            </div>
        </div>
    )
}
