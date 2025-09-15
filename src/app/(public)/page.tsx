import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Check, BrainCircuit, ListTodo, Target, Calendar, Timer, CalendarCheck, Twitter, Linkedin, Facebook } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const features = [
    {
        icon: BrainCircuit,
        title: "AI-Powered Tools",
        description: "Leverage AI to generate study plans, summarize notes, and create flashcards in seconds."
    },
    {
        icon: ListTodo,
        title: "Integrated Task Management",
        description: "Keep track of all your assignments, projects, and deadlines in one organized place."
    },
    {
        icon: Target,
        title: "Goal Tracking",
        description: "Set and monitor your semester and yearly goals to stay motivated and on track for success."
    },
    {
        icon: Calendar,
        title: "Timetable Management",
        description: "Organize your class schedule with a clear, visual timetable to keep track of where you need to be."
    },
    {
        icon: Timer,
        title: "Pomodoro Timer",
        description: "Boost your productivity and avoid burnout with a built-in Pomodoro timer for focused study sessions."
    },
    {
        icon: CalendarCheck,
        title: "Weekly Study Planning",
        description: "Get an intelligent, AI-generated weekly study plan based on your course load and schedule."
    }
]

export default function LandingPage() {
    const heroImage = PlaceHolderImages.find(img => img.id === 'dashboard-banner');
    return (
        <div className="w-full">
            <section className="text-center py-20 md:py-32">
                <h1 className="text-5xl md:text-6xl font-bold font-headline tracking-tighter">
                    Focus. Organize. Succeed.
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
                    Academiq is your all-in-one productivity partner, intelligently designed to help you conquer your academic goals.
                </p>
                <div className="flex justify-center gap-4 mt-8">
                    <Button asChild size="lg">
                        <Link href="/join">Get Started for Free</Link>
                    </Button>
                </div>
            </section>

            <section className="relative w-full max-w-4xl aspect-video mx-auto rounded-2xl border-8 border-gray-300 dark:border-gray-700 overflow-hidden shadow-2xl">
                 {heroImage && (
                    <Image
                        src={heroImage.imageUrl}
                        alt="Academiq App Screenshot"
                        fill
                        className="object-cover"
                        data-ai-hint="app screenshot"
                    />
                 )}
            </section>

            <section className="py-20 md:py-32">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-4xl font-bold font-headline">Everything You Need to Excel</h2>
                    <p className="text-muted-foreground mt-4 text-lg">
                        From smart planning to deep focus, Academiq provides the ultimate toolkit for academic excellence.
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-12">
                    {features.map((feature, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                                    <feature.icon className="w-6 h-6 text-primary"/>
                                </div>
                                <CardTitle>{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            <footer className="py-12 border-t bg-secondary/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Academiq</h3>
                        <p className="text-muted-foreground">Focus. Organize. Succeed.</p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-semibold">Quick Links</h4>
                        <ul className="space-y-1">
                            <li><Link href="/join" className="text-muted-foreground hover:text-primary">Get Started</Link></li>
                            <li><Link href="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
                        </ul>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-semibold">Contact Us</h4>
                        <p className="text-muted-foreground">yohanemeka15@gmail.com</p>
                        <p className="text-muted-foreground">07018889761</p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-semibold">Follow Us</h4>
                        <div className="flex space-x-4">
                            <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter /></Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook /></Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary"><Linkedin /></Link>
                        </div>
                    </div>
                </div>
                <div className="text-center mt-8 pt-8 border-t">
                    <p className="text-muted-foreground">&copy; {new Date().getFullYear()} Academiq. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}