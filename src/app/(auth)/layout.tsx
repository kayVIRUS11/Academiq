import { Logo } from "@/components/logo";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
            <div className="absolute top-8">
                <Link href="/">
                    <Logo />
                </Link>
            </div>
            <Card className="w-full max-w-md">
                {children}
            </Card>
        </div>
    )
}
