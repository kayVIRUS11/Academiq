import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, BookOpen, BrainCircuit, Check, FileText, UploadCloud, Twitter, Linkedin, Facebook } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const howItWorks = [
    {
        icon: UploadCloud,
        title: "Upload Your Content",
        description: "Upload PDFs, lecture slides, or any text-based document."
    },
    {
        icon: BrainCircuit,
        title: "Let AI Process",
        description: "Our AI analyzes the content to understand key concepts."
    },
    {
        icon: BookOpen,
        title: "Get Study Materials",
        description: "Receive notes, flashcards, and quizzes automatically."
    },
    {
        icon: Check,
        title: "Study & Succeed",
        description: "Use your new materials to study smarter and ace your exams."
    }
]

const features = [
    {
        title: "Turn anything into an editable note",
        description: "Import from anywhere, then edit your notes by highlighting, adding comments, and more.",
    },
    {
        title: "Study smarter, not harder",
        description: "Academiq helps students learn more efficiently. Research, brainstorm, practice, and more with your notes.",
    },
    {
        title: "Live collaboration",
        description: "Seamlessly switch between your devices – our web app works on desktop and mobile."
    },
    {
        title: "All your devices. Always synced.",
        description: "Seamlessly switch between your devices – our web app works on desktop and mobile."
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
                        <p className="text-sm text-muted-foreground mt-4">Trusted by students at leading institutions</p>
                        <div className="flex justify-center md:justify-start items-center gap-6 text-muted-foreground">
                            <span>Stanford</span>
                            <span className="font-bold text-lg">Duke</span>
                            <span>Deloitte</span>
                            <span>MIT</span>
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

            {/* How It Works Section */}
            <section className="py-20 md:py-32 bg-secondary/30">
                <div className="text-center max-w-3xl mx-auto container">
                    <h2 className="text-4xl font-bold font-headline">How It Works - It's Simple.</h2>
                    <p className="text-muted-foreground mt-4 text-lg">
                        Transform any PDF, lecture slide, or document into beautiful notes and ready-to-use study tools in four simple steps.
                    </p>
                </div>
                <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto mt-16 container">
                    {howItWorks.map((step, i) => (
                        <div key={i} className="text-center flex flex-col items-center">
                            <div className="bg-primary/10 p-4 rounded-full w-fit mb-4 border border-primary/20">
                                <step.icon className="w-8 h-8 text-primary"/>
                            </div>
                            <h3 className="font-semibold text-lg">{step.title}</h3>
                            <p className="text-muted-foreground mt-2">{step.description}</p>
                        </div>
                    ))}
                </div>
            </section>
            
            {/* Features Section */}
            <section className="py-20 md:py-32 container mx-auto">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-4xl font-bold font-headline">The last notetaker you'll ever need</h2>
                </div>
                <div className="mt-16 max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
                    {features.map((feature) => (
                        <Card key={feature.title} className="p-6 bg-secondary/30 border-border/50">
                            <h3 className="text-lg font-bold text-primary">{feature.title}</h3>
                            <p className="mt-2 text-muted-foreground">{feature.description}</p>
                        </Card>
                    ))}
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
