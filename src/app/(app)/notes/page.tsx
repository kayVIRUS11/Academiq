'use client';

import { useState } from 'react';
import { Note } from '@/lib/types';
import { NoteList } from '@/components/notes/note-list';
import { NoteEditor } from '@/components/notes/note-editor';
import { Plus, NotebookText, Trash2, FilePlus, BrainCircuit, Sparkles, ArrowLeft, Blocks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { summarizeNotes } from '@/ai/flows/summarize-notes';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { mockCourses } from '@/lib/mock-data';
import { useNotes } from './notes-context';
import { useFlashcards } from '../ai-tools/flashcards/flashcards-context';
import { generateFlashcards } from '@/ai/flows/generate-flashcards';
import { useRouter } from 'next/navigation';

export default function NotesPage() {
    const { 
        notes, 
        setNotes, 
        selectedNoteId, 
        setSelectedNoteId, 
        addNote 
    } = useNotes();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const router = useRouter();
  const { addFlashcardSet } = useFlashcards();

  const selectedNote = notes.find(note => note.id === selectedNoteId) || null;

  const handleSelectNote = (id: string) => {
    setSelectedNoteId(id);
  };

  const handleAddNote = () => {
    const newNote = addNote({
        title: 'New Note',
        content: '',
    });
    setSelectedNoteId(newNote.id);
  };

  const handleUpdateNote = (updatedNote: Partial<Note>) => {
    if (!selectedNoteId) return;
    setNotes(prev =>
      prev.map(note =>
        note.id === selectedNoteId ? { ...note, ...updatedNote } : note
      )
    );
  };

  const handleDeleteNote = () => {
    if (!selectedNoteId) return;
    const noteIndex = notes.findIndex(n => n.id === selectedNoteId);
    setNotes(prev => prev.filter(note => note.id !== selectedNoteId));
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
      
      const summaryNote = addNote({
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
        addFlashcardSet(selectedNote.title, result.flashcards);
        toast({
            title: 'Flashcards Generated!',
            description: `A new set with ${result.flashcards.length} cards has been saved.`
        });
        router.push('/ai-tools/flashcards');
    } catch(e) {
        toast({ title: 'Generation Failed', description: 'Could not generate flashcards. Please try again.', variant: 'destructive' });
    } finally {
        setIsGeneratingFlashcards(false);
    }
  }

  const editorPanel = (
      <div className={cn(
        "flex flex-col flex-1",
        isMobile ? (selectedNoteId ? "flex" : "hidden") : "flex"
      )}>
        {selectedNote ? (
          <>
            <div className="flex items-center justify-end gap-2 mb-4 p-4 border-b flex-wrap">
              {isMobile && (
                <Button variant="ghost" size="icon" className="mr-auto" onClick={() => setSelectedNoteId(null)}>
                  <ArrowLeft />
                  <span className="sr-only">Back to list</span>
                </Button>
              )}
              <div className="flex-1" />
              <Button onClick={handleSummarize} disabled={isSummarizing || isGeneratingFlashcards} variant="outline">
                {isSummarizing ? (
                  <Sparkles className="mr-2 animate-spin" />
                ) : (
                  <BrainCircuit className="mr-2" />
                )}
                {isSummarizing ? 'Summarizing...' : 'AI Summary'}
              </Button>
              <Button onClick={handleGenerateFlashcards} disabled={isSummarizing || isGeneratingFlashcards} variant="outline">
                {isGeneratingFlashcards ? (
                  <Sparkles className="mr-2 animate-spin" />
                ) : (
                  <Blocks className="mr-2" />
                )}
                {isGeneratingFlashcards ? 'Generating...' : 'Flashcards'}
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => setIsDeleting(true)}
              >
                <Trash2 className="h-5 w-5" />
                <span className="sr-only">Delete Note</span>
              </Button>
            </div>
            <div className="flex-1 p-4">
              <NoteEditor note={selectedNote} onUpdate={handleUpdateNote} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <Card className="w-full h-full flex items-center justify-center">
                <CardContent className="text-center p-6">
                <NotebookText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 text-xl font-semibold">No note selected</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Select a note from the list, or create a new one.
                </p>
                <Button className="mt-6" onClick={handleAddNote}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create a New Note
                </Button>
                </CardContent>
            </Card>
          </div>
        )}
      </div>
  );

  return (
    <div className="flex h-[calc(100vh-theme(space.20))]">
      {/* Left Panel: Note List */}
      <aside className={cn(
        "border-r flex flex-col",
        isMobile ? (selectedNoteId ? "hidden" : "w-full") : "w-1/3"
      )}>
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-bold font-headline flex items-center gap-2">
            <NotebookText className="w-6 h-6" />
            Notes & Journal
          </h1>
          <Button size="icon" variant="ghost" onClick={handleAddNote}>
            <FilePlus className="h-5 w-5" />
            <span className="sr-only">Add Note</span>
          </Button>
        </div>
        <div className="overflow-y-auto flex-1">
          <NoteList
            notes={notes}
            selectedNoteId={selectedNoteId}
            onSelectNote={handleSelectNote}
            courses={mockCourses}
          />
        </div>
      </aside>

      {/* Right Panel: Note Editor/Viewer */}
      <main className={cn(
        "flex flex-col",
         isMobile ? (selectedNoteId ? "w-full" : "hidden") : "w-2/3"
      )}>
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
