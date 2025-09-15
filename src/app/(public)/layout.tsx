import { Logo } from "@/components/logo";
import Link from "next/link";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <Link href="/">
                        <Logo />
                    </Link>
                </div>
            </header>
            <main className="flex-1">
                {children}
            </main>
        </div>
    )
}
