
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, BookOpen, BrainCircuit, Check, FileText, UploadCloud, Twitter, Linkedin, Facebook, CalendarDays, Target, Blocks } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const features = [
    {
        icon: FileText,
        title: "AI File Summarizer",
        description: "Upload PDFs, lecture slides, or any text document and get a concise, AI-generated summary in seconds."
    },
    {
        icon: Blocks,
        title: "AI Flashcard Generator",
        description: "Automatically create flashcards from your notes, helping you memorize key concepts faster."
    },
    {
        icon: CalendarDays,
        title: "AI Daily Planner",
        description: "Let AI build a detailed, hour-by-hour schedule based on your tasks, classes, and personal goals."
    },
    {
        icon: Target,
        title: "Goal & Task Tracking",
        description: "Set semester and yearly goals, manage tasks with priorities, and visualize your progress."
    }
]

const faqs = [
    {
        question: "What is Academiq?",
        answer: "Academiq is an AI-powered study platform that transforms your course materials into interactive notes, flashcards, and quizzes to help you study more effectively."
    },
    {
        question: "What file types are supported?",
        answer: "You can upload PDFs, PowerPoint presentations (.pptx), and plain text files (.txt). We are working on supporting more formats soon."
    },
    {
        question: "Is Academiq free?",
        answer: "Yes, Academiq offers a generous free tier with access to all the core features. We may introduce premium features in the future."
    },
    {
        question: "How does the AI work?",
        answer: "Our platform uses advanced large language models to analyze the content of your documents, identify key concepts, and generate relevant study materials based on that understanding."
    }
]

export default function LandingPage() {
    return (
        <div className="w-full bg-background text-foreground">
            {/* Hero Section */}
            <section className="text-center md:text-left py-20 md:py-32 container mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h1 className="text-5xl md:text-6xl font-bold font-headline tracking-tighter">
                            Meet Academiq
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-lg mx-auto md:mx-0">
                            Turn anything into notes, flashcards, quizzes, and more.
                        </p>
                        <div className="flex justify-center md:justify-start gap-4 mt-8">
                            <Button asChild size="lg">
                                <Link href="/join">Get Started <ArrowRight className="ml-2" /></Link>
                            </Button>
                        </div>
                    </div>
                    <div className="hidden md:block bg-primary/10 p-6 rounded-2xl border border-primary/20 shadow-2xl shadow-primary/10">
                        <Card className="bg-background/80">
                           <CardHeader>
                                <CardTitle>Cellular Biology</CardTitle>
                                <CardDescription>Week 4 - Mitosis</CardDescription>
                           </CardHeader>
                           <CardContent className="space-y-4">
                                <div className="flex justify-around">
                                    <Button variant="secondary" size="sm">Notes</Button>
                                    <Button variant="outline" size="sm">Flashcards</Button>
                                    <Button variant="outline" size="sm">Quizzes</Button>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg text-sm space-y-2">
                                    <p><strong className="text-primary">Term:</strong> Anaphase</p>
                                    <p><strong className="text-primary">Definition:</strong> The stage of mitosis where replicated chromosomes are split and the newly-copied chromosomes are moved to opposite poles of the cell.</p>
                                </div>
                           </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 md:py-32 bg-secondary/30">
                <div className="text-center max-w-3xl mx-auto container">
                    <h2 className="text-4xl font-bold font-headline">A Smarter Way to Study</h2>
                    <p className="text-muted-foreground mt-4 text-lg">
                        Academiq is packed with AI-powered tools designed to help you learn faster and stay organized.
                    </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto mt-16 container">
                    {features.map((feature, i) => (
                        <div key={i} className="text-center flex flex-col items-center p-4">
                            <div className="bg-primary/10 p-4 rounded-full w-fit mb-4 border border-primary/20">
                                <feature.icon className="w-8 h-8 text-primary"/>
                            </div>
                            <h3 className="font-semibold text-lg">{feature.title}</h3>
                            <p className="text-muted-foreground mt-2 text-sm">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>
            
            {/* Benefits Section */}
            <section className="py-20 md:py-32 container mx-auto">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-4xl font-bold font-headline">Everything You Need to Succeed</h2>
                </div>
                <div className="mt-16 max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
                    <Card className="p-6 bg-secondary/30 border-border/50">
                        <h3 className="text-lg font-bold text-primary">Centralize Your Knowledge</h3>
                        <p className="mt-2 text-muted-foreground">Bring all your study materials—documents, lecture notes, and web content—into one organized place.</p>
                    </Card>
                    <Card className="p-6 bg-secondary/30 border-border/50">
                        <h3 className="text-lg font-bold text-primary">Automate Your Study Prep</h3>
                        <p className="mt-2 text-muted-foreground">Let AI handle the heavy lifting. Automatically generate summaries, flashcards, and quizzes from your content.</p>
                    </Card>
                    <Card className="p-6 bg-secondary/30 border-border/50">
                        <h3 className="text-lg font-bold text-primary">Structure Your Success</h3>
                        <p className="mt-2 text-muted-foreground">Use AI to create tailored study plans and daily schedules that align with your courses and personal goals.</p>
                    </Card>
                    <Card className="p-6 bg-secondary/30 border-border/50">
                        <h3 className="text-lg font-bold text-primary">Learn Anywhere, Anytime</h3>
                        <p className="mt-2 text-muted-foreground">Seamlessly switch between your devices. Our web app works on desktop and mobile, keeping you in sync.</p>
                    </Card>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 md:py-32 container mx-auto">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-4xl font-bold font-headline">Frequently Asked Questions</h2>
                </div>
                <div className="mt-12 max-w-3xl mx-auto">
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, i) => (
                             <AccordionItem value={`item-${i}`} key={i}>
                                <AccordionTrigger>{faq.question}</AccordionTrigger>
                                <AccordionContent>
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t bg-secondary/30">
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
                <div className="text-center mt-8 pt-8 border-t border-border/50">
                    <p className="text-muted-foreground">&copy; {new Date().getFullYear()} Academiq. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
