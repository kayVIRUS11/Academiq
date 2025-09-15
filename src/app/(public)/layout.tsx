import { Logo } from "@/components/logo";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <header className="absolute top-0 left-0 right-0 p-4">
                <Logo />
            </header>
            <main className="min-h-screen flex items-center justify-center">
                {children}
            </main>
        </>
    )
}
