import { Card } from "@/components/ui/card";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md bg-card/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-800">
                {children}
            </Card>
        </div>
    )
}
