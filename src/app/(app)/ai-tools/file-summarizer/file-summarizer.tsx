'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Sparkles, AlertCircle, FilePlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { summarizeUploadedFile } from '@/ai/flows/summarize-uploaded-file';
import { FileUploader } from './file-uploader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { useNotes } from '@/app/(app)/notes/notes-context';

// Required by pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;


export function FileSummarizer() {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { addNote } = useNotes();

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    setSummary(''); // Reset summary when a new file is selected
  };

  const extractTextFromPptx = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    try {
      const zip = await JSZip.loadAsync(arrayBuffer);
      const slidePromises: Promise<string>[] = [];
      zip.folder('ppt/slides')?.forEach((relativePath, file) => {
        if (relativePath.endsWith('.xml') && !relativePath.includes('_rels')) {
          slidePromises.push(file.async('string'));
        }
      });
  
      const slideXmls = await Promise.all(slidePromises);
      const parser = new DOMParser();
      let fullText = '';
  
      for (const slideXml of slideXmls) {
        const doc = parser.parseFromString(slideXml, 'application/xml');
        const textNodes = doc.querySelectorAll('a\\:t');
        textNodes.forEach(node => {
          if (node.textContent) {
            fullText += node.textContent + ' ';
          }
        });
        fullText += '\n';
      }
      return fullText;
    } catch (e) {
      console.error("Error parsing PPTX", e);
      throw new Error("Could not extract text from PowerPoint file. It may be corrupted or in an unsupported format.");
    }
  };

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    try {
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map(item => ('str' in item ? item.str : '')).join(' ') + '\n';
      }
      return fullText;
    } catch (e) {
      console.error("Error parsing PDF", e);
      throw new Error("Could not extract text from PDF. It may be an image-based PDF, encrypted, or corrupted.");
    }
  };


  const handleSummarize = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to summarize.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setSummary('');

    try {
        let fileContent = '';
        let fileType = file.name.split('.').pop() || '';
        
        if (file.type === 'text/plain' || fileType === 'txt') {
            fileContent = await file.text();
            fileType = 'txt';
        } else if (file.type === 'application/pdf' || fileType === 'pdf') {
          fileContent = await extractTextFromPdf(file);
          fileType = 'pdf';
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || fileType === 'pptx') {
            fileContent = await extractTextFromPptx(file);
            fileType = 'pptx';
        } else {
            toast({
                title: 'Unsupported File Type',
                description: 'Please upload a .txt, .pdf, or .pptx file.',
                variant: 'destructive',
            });
            setIsLoading(false);
            return;
        }

        if (!fileContent.trim()) {
          toast({
            title: 'Empty Document',
            description: 'The file appears to be empty or text could not be extracted.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        const result = await summarizeUploadedFile({
            fileContent,
            fileType,
          });
        setSummary(result.summary);
        toast({
            title: 'Success!',
            description: 'Your file has been summarized.',
        });

    } catch (error: any) {
      console.error('Error summarizing file:', error);
      toast({
        title: 'Summarization Failed',
        description: error.message || 'Could not extract text or generate summary. The file might be corrupted or in an unsupported format.',
        variant: 'destructive',
      });
    } finally {
        setIsLoading(false);
    }
  };

  const handleAddToNotes = () => {
    if (!summary || !file) return;

    addNote({
        title: `Study Guide: ${file.name}`,
        content: summary,
    });

    toast({
        title: 'Added to Notes!',
        description: 'A new note has been created with the study guide.'
    });
  }

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Supported File Types</AlertTitle>
        <AlertDescription>
          You can upload <strong>.txt</strong>, <strong>.pdf</strong>, and <strong>.pptx</strong> files for summarization. Note: Image-based or encrypted PDFs are not supported.
        </AlertDescription>
      </Alert>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <FileUploader onFileSelect={handleFileSelect} />
        <Button onClick={handleSummarize} disabled={!file || isLoading} className="w-full sm:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 animate-spin" />
              Summarizing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2" />
              Summarize File
            </>
          )}
        </Button>
      </div>

      {summary && (
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
              <div className="prose prose-sm max-w-none">{summary}</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
