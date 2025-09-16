'use client';

import { useEffect, useState, useCallback } from 'react';
import { Course, Note } from '@/lib/types';
import { NoteList } from '@/components/notes/note-list';
import { NoteEditor } from '@/components/notes/note-editor';
import { Plus, NotebookText, Trash2, FilePlus, BrainCircuit, Sparkles, ArrowLeft, Blocks, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { summarizeNotes } from '@/ai/flows/summarize-notes';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useNotes } from './notes-context';
import { useFlashcards } from '../ai-tools/flashcards/flashcards-context';
import { generateFlashcards } from '@/ai/flows/generate-flashcards';
import { useRouter, useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useCourses } from '@/context/courses-context';

export default function NotesPage() {
    const { 
        notes, 
        loading,
        error,
        selectedNoteId, 
        setSelectedNoteId, 
        addNote,
        updateNote,
        deleteNote
    } = useNotes();
    const { courses, loading: coursesLoading } = useCourses();
	const { toast } = useToast();
    
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  
  const isMobile = useIsMobile();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addFlashcardSet } = useFlashcards();

  const selectedNote = notes.find(note => note.id === selectedNoteId) || null;

  useEffect(() => {
    const noteIdFromUrl = searchParams.get('noteId');
    if (noteIdFromUrl && !selectedNoteId) {
        if(notes.find(n => n.id === noteIdFromUrl)) {
            setSelectedNoteId(noteIdFromUrl);
        }
    }
  }, [searchParams, notes, selectedNoteId, setSelectedNoteId]);


  const handleSelectNote = (id: string) => {
    setSelectedNoteId(id);
  };

  const handleAddNote = async () => {
    const newNote = await addNote({
        title: 'New Note',
        content: '',
    });
    setSelectedNoteId(newNote.id);
  };

  const handleUpdateNote = (updatedNote: Partial<Note>) => {
    if (!selectedNoteId) return;
    updateNote(selectedNoteId, updatedNote);
  };

  const handleDeleteNote = async () => {
    if (!selectedNoteId) return;
    const noteIndex = notes.findIndex(n => n.id === selectedNoteId);
    await deleteNote(selectedNoteId);
    setSelectedNoteId(notes.length > 1 ? (noteIndex > 0 ? notes[noteIndex-1].id : notes[1].id) : null);
    setIsDeleting(false);
  };
  
  const handleSummarize = async () => {
    if (!selectedNote || !selectedNote.content) {
      toast({
        title: 'Cannot Summarize',
        description: 'The note is empty.',
        variant: 'destructive'
      });
      return;
    }
    setIsSummarizing(true);
    try {
      const result = await summarizeNotes({notes: selectedNote.content});
      
      const summaryNote = await addNote({
        title: `Summary: ${selectedNote.title}`,
        content: `**Main Topic:** ${result.mainTopic}\n\n**Summary:**\n${result.summary}`,
        courseId: selectedNote.courseId,
      });
      
      setSelectedNoteId(summaryNote.id);

      toast({
        title: 'Summary Generated!',
        description: 'A new note has been created with the summary.'
      })
    } catch(e) {
      toast({
        title: 'Summarization Failed',
        description: 'Could not generate summary. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSummarizing(false);
    }
  }

  const handleGenerateFlashcards = async () => {
    if (!selectedNote || !selectedNote.content?.trim()) {
        toast({ title: 'Cannot Generate Flashcards', description: 'The note is empty.', variant: 'destructive'});
        return;
    }
    setIsGeneratingFlashcards(true);
    try {
        const result = await generateFlashcards({ notes: selectedNote.content });
        if (result.flashcards.length === 0) {
            toast({
                title: 'No Flashcards Generated',
                description: 'The AI could not identify any key concepts to create flashcards from.',
                variant: 'destructive'
            });
            return;
        }
        const newSet = await addFlashcardSet(selectedNote.title, result.flashcards);
        toast({
            title: 'Flashcards Generated!',
            description: `A new set with ${result.flashcards.length} cards has been saved.`
        });
        router.push(`/ai-tools/flashcards/${newSet.id}`);
    } catch(e) {
        toast({ title: 'Generation Failed', description: 'Could not generate flashcards. Please try again.', variant: 'destructive' });
    } finally {
        setIsGeneratingFlashcards(false);
    }
  }
  
  if (error) return <p className="text-destructive p-4">Error: {error.message}</p>

  const editorPanel = (
    <div className={cn("flex-1 flex flex-col", isMobile && !selectedNoteId ? "hidden" : "flex")}>
      {selectedNote ? (
        <>
          <div className="flex items-center justify-end gap-2 p-4 border-b flex-wrap">
            {isMobile && (
              <Button variant="ghost" size="icon" className="mr-auto" onClick={() => setSelectedNoteId(null)}>
                <ArrowLeft />
                <span className="sr-only">Back to list</span>
              </Button>
            )}
            <div className="flex-1" />
            <Button variant="outline" size="sm" asChild>
                <Link href="/ai-tools/flashcards">
                    <Eye className="mr-2"/>
                    View Sets
                </Link>
            </Button>
            <Button onClick={handleGenerateFlashcards} disabled={isSummarizing || isGeneratingFlashcards} variant="outline" size="sm">
              {isGeneratingFlashcards ? ( <Sparkles className="mr-2 animate-spin" /> ) : ( <Blocks className="mr-2" /> )}
              {isGeneratingFlashcards ? 'Generating...' : 'Generate Flashcards'}
            </Button>
            <Button onClick={handleSummarize} disabled={isSummarizing || isGeneratingFlashcards} variant="outline" size="sm">
              {isSummarizing ? ( <Sparkles className="mr-2 animate-spin" /> ) : ( <BrainCircuit className="mr-2" /> )}
              {isSummarizing ? 'Summarizing...' : 'AI Summary'}
            </Button>
            <Button variant="destructive" size="icon" onClick={() => setIsDeleting(true)}>
              <Trash2 className="h-5 w-5" />
              <span className="sr-only">Delete Note</span>
            </Button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <NoteEditor note={selectedNote} onUpdate={handleUpdateNote} key={selectedNoteId} />
          </div>
        </>
      ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <Card className="w-full h-full flex items-center justify-center border-dashed">
                <CardContent className="text-center p-6">
                <NotebookText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 text-xl font-semibold">No Note Selected</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Select a note from the list, or create a new one.
                </p>
                <Button className="mt-6" onClick={handleAddNote}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Note
                </Button>
                </CardContent>
            </Card>
          </div>
      )}
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-theme(space.20))]">
      <aside className={cn(
        "border-r flex flex-col",
        isMobile ? (selectedNoteId ? "hidden" : "w-full") : "w-80 lg:w-96"
      )}>
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-bold font-headline flex items-center gap-2">
            <NotebookText className="w-6 h-6" />
            My Notes
          </h1>
          <Button size="icon" variant="ghost" onClick={handleAddNote}>
            <FilePlus className="h-5 w-5" />
            <span className="sr-only">Add Note</span>
          </Button>
        </div>
        <div className="overflow-y-auto flex-1">
          {loading || coursesLoading ? (
            <div className="p-4 space-y-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <NoteList
                notes={notes}
                selectedNoteId={selectedNoteId}
                onSelectNote={handleSelectNote}
                courses={courses}
            />
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-muted/30">
        {editorPanel}
      </main>

      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNote} className="bg-destructive hover:bg-destructive/90">
              Yes, delete note
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
