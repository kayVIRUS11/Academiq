
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Sparkles, AlertCircle, FilePlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { summarizeUploadedFile, SummarizeUploadedFileInput } from '@/ai/flows/summarize-uploaded-file';
import { generateChunkedSummaryStream } from '@/ai/flows/generate-chunked-summary-stream';
import { FileUploader } from './file-uploader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { useNotes } from '@/app/(app)/notes/notes-context';
import { ToastAction } from '@/components/ui/toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { marked } from 'marked';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

type ContentPart = { text: string } | { media: { url: string } };
type SummaryType = 'quick' | 'standard' | 'deep';

const LARGE_FILE_THRESHOLD = 1024 * 1024; // 1MB

const quickLoadingMessages = [
    "Analyzing document...",
    "Extracting key points...",
    "Finalizing quick summary...",
];

const standardLoadingMessages = [
    "Performing detailed analysis...",
    "Structuring the summary with headings...",
    "Highlighting key concepts...",
    "Compiling the standard summary...",
];

export function FileSummarizer() {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [summaryType, setSummaryType] = useState<SummaryType>('standard');
  const { toast } = useToast();
  const { addNote } = useNotes();
  const router = useRouter();

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    setSummary(''); 
  };

  const runLoadingMessages = (messages: string[]) => {
    const totalDuration = 8000; // 8 seconds total for indeterminate loaders
    const messageInterval = totalDuration / messages.length;
    messages.forEach((msg, index) => {
        setTimeout(() => {
            if (isLoading) setLoadingMessage(msg);
        }, index * messageInterval);
    });
    const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
            if (prev >= 95) {
                clearInterval(progressInterval);
                return 95;
            }
            return prev + 5;
        });
    }, 400);

    return () => clearInterval(progressInterval);
  }

  const extractPptxContent = async (file: File): Promise<ContentPart[]> => {
    // ... (existing implementation)
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    const contentParts: ContentPart[] = [];
  
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
      const textNodes = doc.querySelectorAll('a\\:t');
      let slideText = '';
      textNodes.forEach(node => {
        if (node.textContent) {
          slideText += node.textContent + ' ';
        }
      });
      if (slideText.trim()) {
        contentParts.push({ text: `Slide Content: ${slideText}\n` });
      }
    }
  
    const imagePromises: Promise<{ name: string; data: string; type: string } | null>[] = [];
    zip.folder('ppt/media')?.forEach((relativePath, file) => {
        const extension = relativePath.split('.').pop()?.toLowerCase();
        if (['jpeg', 'jpg', 'png', 'gif'].includes(extension || '')) {
            imagePromises.push(
              file.async('base64').then(data => ({
                name: relativePath,
                data,
                type: `image/${extension}`,
              })).catch(e => {
                console.warn(`Could not process image ${relativePath} in pptx:`, e);
                return null;
              })
            );
        }
    });
  
    const images = await Promise.all(imagePromises);
    for (const image of images) {
      if (image) {
        contentParts.push({
          media: { url: `data:${image.type};base64,${image.data}` },
        });
      }
    }
  
    return contentParts;
  };
  

  const extractPdfContent = async (file: File): Promise<ContentPart[]> => {
    // ... (existing implementation)
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const contentParts: ContentPart[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        try {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => 'str' in item ? item.str : '').join(' ');
            
            if (pageText.trim()) {
                contentParts.push({ text: `Page ${i} Content: ${pageText}\n` });
            }

            const opList = await page.getOperatorList();
            for (let j = 0; j < opList.fnArray.length; j++) {
                if (opList.fnArray[j] === pdfjsLib.OPS.paintImageXObject) {
                    try {
                        const objId = opList.argsArray[j][0];
                        const img = await page.objs.get(objId);
                        
                        if (img && img.data) {
                            const base64 = btoa(new Uint8Array(img.data).reduce((data, byte) => data + String.fromCharCode(byte), ''));
                            
                            const mimeType = img.kind === pdfjsLib.ImageKind.JPEG ? 'image/jpeg' : 'image/png';
                            contentParts.push({ media: { url: `data:${mimeType};base64,${base64}` } });
                        }
                    } catch (e) {
                        console.warn(`Could not process an image on page ${i} of the PDF.`, e);
                    }
                }
            }
        } catch (pageError) {
            console.error(`Error processing page ${i}:`, pageError);
            toast({
                title: `Could not process page ${i}`,
                description: 'The summarization will continue with the content extracted so far.',
                variant: 'destructive',
            });
        }
    }

    return contentParts;
  };


  const handleSummarize = async () => {
    if (!file) {
      toast({ title: 'No file selected', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setSummary('');
    setLoadingProgress(0);

    try {
        let parts: ContentPart[] = [];
        let fileType = file.name.split('.').pop() || '';
        
        setLoadingMessage("Extracting content from file...");
        if (file.type === 'text/plain' || fileType === 'txt') {
            parts = [{ text: await file.text() }];
            fileType = 'txt';
        } else if (file.type === 'application/pdf' || fileType === 'pdf') {
            parts = await extractPdfContent(file);
            fileType = 'pdf';
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || fileType === 'pptx') {
            parts = await extractPptxContent(file);
            fileType = 'pptx';
        } else {
            throw new Error('Unsupported file type. Please upload a .txt, .pdf, or .pptx file.');
        }

        if (parts.length === 0 || parts.every(p => 'text' in p && !p.text.trim())) {
            throw new Error('The file appears to be empty or text could not be extracted.');
        }

        const useChunking = (summaryType === 'deep' || summaryType === 'standard') && file.size > LARGE_FILE_THRESHOLD;

        if (useChunking) {
            setLoadingMessage('Starting deep summarization stream...');
            const stream = await generateChunkedSummaryStream({ parts, fileType });
            let finalSummary = '';

            for await (const chunk of stream) {
              if (chunk.type === 'progress') {
                setLoadingProgress(chunk.data.percent);
                setLoadingMessage(chunk.data.message);
              } else if (chunk.type === 'result') {
                finalSummary = chunk.data.summary;
              }
            }
            setSummary(marked.parse(finalSummary) as string);

        } else {
            // Indeterminate progress for single-shot summaries
            const stopMessages = runLoadingMessages(summaryType === 'quick' ? quickLoadingMessages : standardLoadingMessages);

            const result = await summarizeUploadedFile({
                parts,
                fileType,
                summaryType
            });
            stopMessages();
            setSummary(marked.parse(result.summary) as string);
        }
        
        setLoadingProgress(100);
        toast({
            title: 'Success!',
            description: 'Your file has been summarized.',
        });

    } catch (error: any) {
      console.error('Error summarizing file:', error);
      toast({
        title: 'Summarization Failed',
        description: error.message || 'Could not process the file.',
        variant: 'destructive',
      });
    } finally {
        setIsLoading(false);
    }
  };

  const handleAddToNotes = async () => {
    // ... (existing implementation)
    if (!summary || !file) return;

    const newNote = await addNote({
        title: `Study Guide: ${file.name}`,
        content: summary,
    });

    toast({
        title: 'Added to Notes!',
        description: 'A new note has been created with the study guide.',
        action: <ToastAction altText="View Note" onClick={() => router.push(`/notes?noteId=${newNote.id}`)}>View Note</ToastAction>
    });
  }

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Multimodal Summarization</AlertTitle>
        <AlertDescription>
          You can upload <strong>.txt</strong>, <strong>.pdf</strong>, and <strong>.pptx</strong> files. This tool now analyzes both text and images (like charts and diagrams) to create a more comprehensive summary.
        </AlertDescription>
      </Alert>

      <FileUploader onFileSelect={handleFileSelect} disabled={isLoading} />

      <div className="space-y-4">
        <Label>Summary Type</Label>
        <RadioGroup value={summaryType} onValueChange={(value: SummaryType) => setSummaryType(value)} className="flex flex-col sm:flex-row gap-4" disabled={isLoading}>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="quick" id="quick"/>
                <Label htmlFor="quick" className="font-normal cursor-pointer">
                    <p className="font-medium">Quick Summary</p>
                    <p className="text-muted-foreground text-xs">Key points only. Fastest.</p>
                </Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="standard" id="standard"/>
                <Label htmlFor="standard" className="font-normal cursor-pointer">
                    <p className="font-medium">Standard Summary</p>
                    <p className="text-muted-foreground text-xs">Detailed summary for articles/chapters.</p>
                </Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="deep" id="deep"/>
                <Label htmlFor="deep" className="font-normal cursor-pointer">
                    <p className="font-medium">Deep Summary</p>
                    <p className="text-muted-foreground text-xs">Comprehensive analysis for large files. Slowest.</p>
                </Label>
            </div>
        </RadioGroup>
      </div>

       <Button onClick={handleSummarize} disabled={!file || isLoading} className="w-full sm:w-auto">
          <Sparkles className="mr-2" />
          Summarize File
        </Button>
      
      {isLoading && (
        <div className="mt-8 space-y-4">
            <div className="flex items-center gap-4 text-primary">
                <Loader2 className="animate-spin" />
                <p className="font-semibold">{loadingMessage}</p>
            </div>
            <Progress value={loadingProgress} />
        </div>
      )}

      {summary && !isLoading && (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold font-headline">Study Guide</h3>
                <Button variant="outline" onClick={handleAddToNotes}>
                    <FilePlus className="mr-2" />
                    Add to Notes
                </Button>
            </div>
          <Card>
            <CardContent className="p-6">
              <div className="prose max-w-none prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: summary }} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
