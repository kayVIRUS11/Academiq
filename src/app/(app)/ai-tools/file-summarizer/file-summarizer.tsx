'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { summarizeUploadedFile } from '@/ai/flows/summarize-uploaded-file';
import { FileUploader } from './file-uploader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function FileSummarizer() {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    setSummary(''); // Reset summary when a new file is selected
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

    if (file.type !== 'text/plain') {
        toast({
            title: 'Invalid File Type',
            description: 'Please upload a .txt file.',
            variant: 'destructive',
        });
        return;
    }

    setIsLoading(true);
    setSummary('');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileContent = e.target?.result as string;
        
        try {
            const result = await summarizeUploadedFile({
                fileContent,
                fileType: 'txt',
              });
              setSummary(result.summary);
              toast({
                title: 'Success!',
                description: 'Your file has been summarized.',
              });
        } catch (error) {
            console.error('Error summarizing file:', error);
            toast({
                title: 'Summarization Failed',
                description: 'Could not generate summary. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
      };
      reader.onerror = () => {
        toast({
            title: 'File Read Error',
            description: 'There was an error reading the file.',
            variant: 'destructive',
          });
        setIsLoading(false);
      }
      reader.readAsText(file);
    } catch (error) {
      console.error('Error setting up file reader:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Supported File Types</AlertTitle>
        <AlertDescription>
          Currently, only <strong>.txt</strong> files are supported for summarization. Support for PDF and other formats is coming soon.
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
          <h3 className="text-2xl font-bold mb-4 font-headline">Summary</h3>
          <Card>
            <CardContent className="p-6">
              <p className="whitespace-pre-wrap">{summary}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
