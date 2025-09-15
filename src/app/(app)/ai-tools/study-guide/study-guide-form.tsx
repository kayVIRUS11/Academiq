'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Sparkles, FilePlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FileUploader } from '@/app/(app)/ai-tools/file-summarizer/file-uploader'; // Reusing the uploader
import { generateStudyGuide } from '@/ai/flows/generate-study-guide';
import { useNotes } from '@/app/(app)/notes/notes-context';
import { marked } from 'marked';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Course } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';

export function StudyGuideForm() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [studyGuide, setStudyGuide] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { addNote } = useNotes();
  const { user } = useAuth();
  
  const coursesQuery = user ? query(collection(db, 'courses'), where('uid', '==', user.uid)) : null;
  const [coursesSnapshot, coursesLoading] = useCollection(coursesQuery);
  const courses = coursesSnapshot?.docs.map(d => ({id: d.id, ...d.data()})) as Course[] || [];

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    setStudyGuide(''); // Reset on new file
  };

  const handleCourseSelect = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    setSelectedCourse(course || null);
  };

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleGenerate = async () => {
    if (!file || !selectedCourse) {
      toast({
        title: 'Missing Information',
        description: 'Please select a course and upload a syllabus file.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setStudyGuide('');

    try {
      const dataUri = await fileToDataUri(file);

      const result = await generateStudyGuide({
        courseName: selectedCourse.name,
        schemeOfWorkDataUri: dataUri,
      });

      setStudyGuide(result.studyGuide);
      toast({
        title: 'Success!',
        description: `Your study guide for ${selectedCourse.name} is ready.`,
      });

    } catch (error: any) {
      console.error('Error generating study guide:', error);
      toast({
        title: 'Generation Failed',
        description: error.message || 'Could not generate the study guide. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToNotes = async () => {
    if (!studyGuide || !selectedCourse) return;

    await addNote({
      title: `Study Guide: ${selectedCourse.name}`,
      content: studyGuide,
      courseId: selectedCourse.id,
    });

    toast({
      title: 'Added to Notes!',
      description: 'The study guide has been saved as a new note.'
    });
  };
  
  const getRenderedStudyGuide = () => {
    if (!studyGuide) return null;
    const rawMarkup = marked.parse(studyGuide);
    return { __html: rawMarkup as string };
  };

  return (
    <div className="space-y-6">
      {coursesLoading ? <Skeleton className="h-32 w-full" /> : (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Select a Course</Label>
                    <Select onValueChange={handleCourseSelect}>
                        <SelectTrigger>
                            <SelectValue placeholder="Which course is this for?" />
                        </SelectTrigger>
                        <SelectContent>
                        {courses.map(course => (
                            <SelectItem key={course.id} value={course.id}>
                                {course.name}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            
            <FileUploader onFileSelect={handleFileSelect} />
            
            <Button onClick={handleGenerate} disabled={!file || !selectedCourse || isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                <>
                    <Loader2 className="mr-2 animate-spin" />
                    Generating Guide...
                </>
                ) : (
                <>
                    <Sparkles className="mr-2" />
                    Generate Study Guide
                </>
                )}
            </Button>
        </>
      )}

      {studyGuide && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold font-headline">Your Study Guide for {selectedCourse?.name}</h3>
            <Button variant="outline" onClick={handleAddToNotes}>
              <FilePlus className="mr-2" />
              Add to Notes
            </Button>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="prose max-w-none prose-sm" dangerouslySetInnerHTML={getRenderedStudyGuide()!} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
