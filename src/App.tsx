import { useState, useEffect, useMemo, useCallback } from 'react';
import { storage } from './storage';
import { Folder, Snippet } from './types';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import { generateId } from './utils';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [unsavedSnippetIds, setUnsavedSnippetIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const data = storage.getData();
    setFolders(data.folders);
    setSnippets(data.snippets);
  }, []);

  const rootSnippets = useMemo(() => snippets.filter((s) => s.folderId === null), [snippets]);

  const handleCreateFolder = useCallback((name: string) => {
    const newFolder: Folder = {
      id: generateId(),
      name,
      createdAt: Date.now(),
    };
    storage.addFolder(newFolder);
    setFolders((prev) => [...prev, newFolder]);
  }, []);

  const handleCreateSnippet = useCallback((folderId: string | null = null) => {
    const newSnippet: Snippet = {
      id: generateId(),
      filename: 'untitled.txt',
      code: '',
      language: 'plaintext',
      folderId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    storage.addSnippet(newSnippet);
    setSnippets((prev) => [...prev, newSnippet]);
    setSelectedSnippet(newSnippet);
    if (folderId) {
      setSelectedFolderId(folderId);
    }
  }, []);

  const handleUpdateSnippet = useCallback((snippetId: string, updates: Partial<Snippet>) => {
    storage.updateSnippet(snippetId, updates);
    setSnippets((prev) => prev.map((s) => (s.id === snippetId ? { ...s, ...updates } : s)));
    setSelectedSnippet((prev) => (prev?.id === snippetId ? { ...prev, ...updates } : prev));
    // Clear unsaved changes when saved
    setUnsavedSnippetIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(snippetId);
      return newSet;
    });
  }, []);

  const handleUnsavedChangesChange = useCallback((snippetId: string, hasChanges: boolean) => {
    setUnsavedSnippetIds((prev) => {
      const newSet = new Set(prev);
      if (hasChanges) {
        newSet.add(snippetId);
      } else {
        newSet.delete(snippetId);
      }
      return newSet;
    });
  }, []);

  const handleDeleteSnippet = useCallback((snippetId: string) => {
    storage.deleteSnippet(snippetId);
    setSnippets((prev) => prev.filter((s) => s.id !== snippetId));
    setSelectedSnippet((prev) => (prev?.id === snippetId ? null : prev));
  }, []);

  const handleDeleteFolder = useCallback(
    (folderId: string) => {
      storage.deleteFolder(folderId);
      setFolders((prev) => prev.filter((f) => f.id !== folderId));
      setSnippets((prev) => prev.filter((s) => s.folderId !== folderId));
      if (selectedFolderId === folderId) {
        setSelectedFolderId(null);
        setSelectedSnippet(null);
      }
    },
    [selectedFolderId]
  );

  const handleMoveSnippet = useCallback((snippetId: string, targetFolderId: string | null) => {
    storage.updateSnippet(snippetId, { folderId: targetFolderId });
    setSnippets((prev) =>
      prev.map((s) => (s.id === snippetId ? { ...s, folderId: targetFolderId } : s))
    );
    setSelectedSnippet((prev) =>
      prev?.id === snippetId ? { ...prev, folderId: targetFolderId } : prev
    );
  }, []);

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-white dark:bg-gray-900 transition-colors">
        <Sidebar
          folders={folders}
          rootSnippets={rootSnippets}
          allSnippets={snippets}
          selectedFolderId={selectedFolderId}
          selectedSnippetId={selectedSnippet?.id || null}
          unsavedSnippetIds={unsavedSnippetIds}
          onSelectFolder={setSelectedFolderId}
          onSelectSnippet={setSelectedSnippet}
          onCreateFolder={handleCreateFolder}
          onCreateSnippet={handleCreateSnippet}
          onDeleteFolder={handleDeleteFolder}
          onDeleteSnippet={handleDeleteSnippet}
          onMoveSnippet={handleMoveSnippet}
        />
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {selectedSnippet ? (
            <div className="flex-1 h-full w-full animate-fade-in">
              <Editor
                snippet={selectedSnippet}
                onUpdate={handleUpdateSnippet}
                onUnsavedChangesChange={handleUnsavedChangesChange}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500 animate-fade-in">
              <div className="text-center">
                <p className="text-lg mb-1">No snippet selected</p>
                <p className="text-sm">Create or select a snippet to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
