
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
import { marked } from 'marked';
import { ToastAction } from '@/components/ui/toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Required by pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

type ContentPart = { text: string } | { media: { url: string } };

const MAX_IMAGES_TO_PROCESS = 5;


export function FileSummarizer() {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { addNote } = useNotes();
  const router = useRouter();

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    setSummary(''); // Reset summary when a new file is selected
  };

  const extractPptxContent = async (file: File): Promise<ContentPart[]> => {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    const contentParts: ContentPart[] = [];
  
    // Extract text from slides
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
  
    // Extract images
    const imagePromises: Promise<{ name: string; data: string; type: string }>[] = [];
    let imageCount = 0;
    zip.folder('ppt/media')?.forEach((relativePath, file) => {
        if (imageCount < MAX_IMAGES_TO_PROCESS) {
            const extension = relativePath.split('.').pop()?.toLowerCase();
            if (['jpeg', 'jpg', 'png', 'gif'].includes(extension || '')) {
                imagePromises.push(
                file.async('base64').then(data => ({
                    name: relativePath,
                    data,
                    type: `image/${extension}`,
                }))
                );
                imageCount++;
            }
        }
    });

    if (imageCount >= MAX_IMAGES_TO_PROCESS) {
        toast({
            title: 'Image Limit Reached',
            description: `Only the first ${MAX_IMAGES_TO_PROCESS} images will be processed to ensure performance.`,
        });
    }
  
    const images = await Promise.all(imagePromises);
    for (const image of images) {
      contentParts.push({
        media: { url: `data:${image.type};base64,${image.data}` },
      });
    }
  
    return contentParts;
  };
  

  const extractPdfContent = async (file: File): Promise<ContentPart[]> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const contentParts: ContentPart[] = [];
    let imageCount = 0;

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => 'str' in item ? item.str : '').join(' ');
        
        if (pageText.trim()) {
            contentParts.push({ text: `Page ${i} Content: ${pageText}\n` });
        }

        if (imageCount < MAX_IMAGES_TO_PROCESS) {
            const opList = await page.getOperatorList();
            for (let j = 0; j < opList.fnArray.length; j++) {
                if (opList.fnArray[j] === pdfjsLib.OPS.paintImageXObject) {
                    if (imageCount >= MAX_IMAGES_TO_PROCESS) break;

                    try {
                        const objId = opList.argsArray[j][0];
                        const img = await page.objs.get(objId);
                        
                        if (img && img.data) {
                            const imageBytes = new Uint8Array(img.data.length);
                            for (let k = 0; k < img.data.length; k++) {
                                imageBytes[k] = img.data[k];
                            }

                            // Convert to Base64
                            let binary = '';
                            const len = imageBytes.byteLength;
                            for (let k = 0; k < len; k++) {
                                binary += String.fromCharCode(imageBytes[k]);
                            }
                            const base64 = btoa(binary);
                            
                            const mimeType = img.kind === pdfjsLib.ImageKind.JPEG ? 'image/jpeg' : 'image/png';
                            contentParts.push({ media: { url: `data:${mimeType};base64,${base64}` } });
                            imageCount++;
                        }
                    } catch (e) {
                        console.warn("Could not process an image in the PDF.", e);
                    }
                }
            }
        }
    }
    
    if (imageCount >= MAX_IMAGES_TO_PROCESS && pdf.numPages > 1) {
        toast({
            title: 'Image Limit Reached',
            description: `Only the first ${MAX_IMAGES_TO_PROCESS} images from the document will be analyzed.`,
        });
    }

    return contentParts;
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
        let parts: ContentPart[] = [];
        let fileType = file.name.split('.').pop() || '';
        
        if (file.type === 'text/plain' || fileType === 'txt') {
            const fileContent = await file.text();
            parts = [{ text: fileContent }];
            fileType = 'txt';
        } else if (file.type === 'application/pdf' || fileType === 'pdf') {
          parts = await extractPdfContent(file);
          fileType = 'pdf';
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || fileType === 'pptx') {
            parts = await extractPptxContent(file);
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

        if (parts.length === 0 || parts.every(p => 'text' in p && !p.text.trim())) {
          toast({
            title: 'Empty Document',
            description: 'The file appears to be empty or text could not be extracted.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        const result = await summarizeUploadedFile({
            parts,
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

  const handleAddToNotes = async () => {
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

  const getRenderedSummary = () => {
    if (!summary) return null;
    const rawMarkup = marked.parse(summary);
    return { __html: rawMarkup as string };
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Multimodal Summarization</AlertTitle>
        <AlertDescription>
          You can upload <strong>.txt</strong>, <strong>.pdf</strong>, and <strong>.pptx</strong> files. This tool now analyzes both text and images (like charts and diagrams) to create a more comprehensive summary.
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
              <div className="prose max-w-none prose-sm" dangerouslySetInnerHTML={getRenderedSummary()!} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
