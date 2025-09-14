'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type FileUploaderProps = {
  onFileSelect: (file: File | null) => void;
};

export function FileUploader({ onFileSelect }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    onFileSelect(selectedFile);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setFile(null);
    onFileSelect(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files?.[0] || null;
    if (droppedFile) {
        setFile(droppedFile);
        onFileSelect(droppedFile);
    }
  };


  if (file) {
    return (
      <div className="w-full p-4 border rounded-lg flex items-center justify-between bg-muted/50">
        <div className="flex items-center gap-3">
          <FileIcon className="text-muted-foreground" />
          <div className="flex flex-col">
            <span className="font-medium text-sm">{file.name}</span>
            <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleRemoveFile}>
          <X className="h-5 w-5" />
          <span className="sr-only">Remove file</span>
        </Button>
      </div>
    );
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        "flex-1 w-full border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center transition-colors",
        isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
      )}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".txt,.pdf,.pptx"
      />
      <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-muted-foreground mb-2">Drag & drop your file here, or</p>
      <Button type="button" variant="outline" onClick={handleButtonClick}>
        Browse Files
      </Button>
    </div>
  );
}
