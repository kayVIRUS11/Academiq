
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Sparkles, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateFlashcards, GenerateFlashcardsOutput } from '@/ai/flows/generate-flashcards';
import { FileUploader } from '@/app/(app)/ai-tools/file-summarizer/file-uploader';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { useFlashcards } from '@/app/(app)/ai-tools/flashcards/flashcards-context';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

type Flashcard = GenerateFlashcardsOutput['flashcards'][0];

export function FlashcardGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [generatedFlashcards, setGeneratedFlashcards] = useState<Flashcard[] | null>(null);
  const [flashcardSetTitle, setFlashcardSetTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { addFlashcardSet } = useFlashcards();
  const router = useRouter();

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    setGeneratedFlashcards(null);
    if(selectedFile) {
        setFlashcardSetTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === 'text/plain') {
      return file.text();
    } else if (file.type === 'application/pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        text += textContent.items.map(item => 'str' in item ? item.str : '').join(' ');
      }
      return text;
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      let text = '';
      const slidePromises: Promise<string>[] = [];
      zip.folder('ppt/slides')?.forEach((relativePath, file) => {
        if (relativePath.startsWith('slide') && relativePath.endsWith('.xml')) {
          slidePromises.push(file.async('string'));
        }
      });
      const slideXmls = await Promise.all(slidePromises);
      const parser = new DOMParser();
      for (const slideXml of slideXmls) {
        const doc = parser.parseFromString(slideXml, 'application/xml');
        doc.querySelectorAll('a\\:t').forEach(node => {
          if (node.textContent) text += node.textContent + ' ';
        });
      }
      return text;
    }
    throw new Error('Unsupported file type.');
  };

  const handleGenerate = async () => {
    if (!file) {
      toast({ title: 'No file selected', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setGeneratedFlashcards(null);
    try {
      const extractedText = await extractTextFromFile(file);
      if (!extractedText.trim()) {
        throw new Error("Could not extract any text from the document.");
      }
      
      const result = await generateFlashcards({
        notes: extractedText,
        title: file.name,
      });

      if (result.flashcards.length === 0) {
        toast({
          title: 'No flashcards generated',
          description: 'The AI could not identify key concepts in the document.',
          variant: 'destructive',
        });
      } else {
        setGeneratedFlashcards(result.flashcards);
        toast({
          title: 'Flashcards Generated!',
          description: `Created ${result.flashcards.length} flashcards. Review and save them below.`,
        });
      }
    } catch (error: any) {
      console.error('Error generating flashcards:', error);
      toast({
        title: 'Generation Failed',
        description: error.message || 'Could not process the file.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSet = async () => {
    if (!generatedFlashcards || !flashcardSetTitle.trim()) {
        toast({ title: 'Cannot save', description: 'No flashcards or title available.', variant: 'destructive'});
        return;
    }

    try {
        const newSet = await addFlashcardSet(flashcardSetTitle, generatedFlashcards);
        toast({
            title: 'Set Saved!',
            description: `The flashcard set "${flashcardSetTitle}" has been added to your library.`
        });
        router.push(`/ai-tools/flashcards/${newSet.id}`);
    } catch(e) {
        toast({ title: 'Save failed', description: 'Could not save the flashcard set.', variant: 'destructive'});
    }
  };

  return (
    <div className="space-y-6">
      <FileUploader onFileSelect={handleFileSelect} disabled={isLoading} />
      
      <Button onClick={handleGenerate} disabled={!file || isLoading} className="w-full sm:w-auto">
        <Sparkles className="mr-2" />
        {isLoading ? 'Generating...' : 'Generate Flashcards'}
      </Button>

      {isLoading && (
        <div className="mt-8 flex justify-center items-center gap-4 text-primary">
          <Loader2 className="animate-spin h-8 w-8" />
          <p className="font-semibold text-lg">AI is thinking...</p>
        </div>
      )}

      {generatedFlashcards && (
        <div className="mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <h3 className="text-2xl font-bold font-headline">Generated Flashcards ({generatedFlashcards.length})</h3>
            <div className="flex gap-2 items-center">
                <Input 
                    placeholder="Enter set title..." 
                    value={flashcardSetTitle}
                    onChange={(e) => setFlashcardSetTitle(e.target.value)}
                    className="w-full sm:w-auto"
                />
                <Button onClick={handleSaveSet} disabled={!flashcardSetTitle.trim()}>
                    <Save className="mr-2" />
                    Save Set
                </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedFlashcards.map((card, index) => (
              <Card key={index}>
                <CardContent className="p-4 space-y-2">
                    <div>
                        <p className="text-xs text-muted-foreground font-semibold">Q:</p>
                        <p className="text-sm">{card.question}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-semibold">A:</p>
                        <p className="text-sm">{card.answer}</p>
                    </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
