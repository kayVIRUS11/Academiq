'use client';
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { useEffect, useState } from "react";

const motivationalQuotes = [
    "The secret of getting ahead is getting started.",
    "Believe you can and you're halfway there.",
    "The expert in anything was once a beginner.",
    "The only way to do great work is to love what you do.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts."
];

export function WelcomeBanner() {
    const bannerImage = PlaceHolderImages.find(img => img.id === 'dashboard-banner');
    const [quote, setQuote] = useState('');

    useEffect(() => {
        setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    }, []);

    return (
        <div className="relative col-span-1 md:col-span-2 rounded-lg overflow-hidden h-48 md:h-64 flex items-center justify-center p-6 text-center shadow-lg">
            {bannerImage && (
                <Image
                    src={bannerImage.imageUrl}
                    alt={bannerImage.description}
                    fill
                    className="object-cover"
                    data-ai-hint={bannerImage.imageHint}
                />
            )}
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10 text-white max-w-2xl">
                <h1 className="text-3xl md:text-4xl font-bold font-headline">Welcome back!</h1>
                <p className="mt-2 text-lg md:text-xl italic opacity-90">{quote}</p>
            </div>
        </div>
    );
}
