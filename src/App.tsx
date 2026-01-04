import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const data = storage.getData();
    setFolders(data.folders);
    setSnippets(data.snippets);
  }, []);

  const handleCreateFolder = (name: string) => {
    const newFolder: Folder = {
      id: generateId(),
      name,
      createdAt: Date.now(),
    };
    storage.addFolder(newFolder);
    setFolders([...folders, newFolder]);
  };

  const handleCreateSnippet = (folderId: string | null = null) => {
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
    const updatedSnippets = [...snippets, newSnippet];
    setSnippets(updatedSnippets);
    setSelectedSnippet(newSnippet);
    // Only set selectedFolderId if we're creating in a folder
    if (folderId) {
      setSelectedFolderId(folderId);
    }
  };

  const handleUpdateSnippet = (snippetId: string, updates: Partial<Snippet>) => {
    storage.updateSnippet(snippetId, updates);
    const updatedSnippets = snippets.map(s => s.id === snippetId ? { ...s, ...updates } : s);
    setSnippets(updatedSnippets);
    if (selectedSnippet?.id === snippetId) {
      setSelectedSnippet({ ...selectedSnippet, ...updates });
    }
  };

  const handleDeleteSnippet = (snippetId: string) => {
    storage.deleteSnippet(snippetId);
    const updatedSnippets = snippets.filter(s => s.id !== snippetId);
    setSnippets(updatedSnippets);
    if (selectedSnippet?.id === snippetId) {
      setSelectedSnippet(null);
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    storage.deleteFolder(folderId);
    setFolders(folders.filter(f => f.id !== folderId));
    const updatedSnippets = snippets.filter(s => s.folderId !== folderId);
    setSnippets(updatedSnippets);
    if (selectedFolderId === folderId) {
      setSelectedFolderId(null);
      setSelectedSnippet(null);
    }
  };

  const handleMoveSnippet = (snippetId: string, targetFolderId: string | null) => {
    storage.updateSnippet(snippetId, { folderId: targetFolderId });
    const updatedSnippets = snippets.map(s => 
      s.id === snippetId ? { ...s, folderId: targetFolderId } : s
    );
    setSnippets(updatedSnippets);
    if (selectedSnippet?.id === snippetId) {
      setSelectedSnippet({ ...selectedSnippet, folderId: targetFolderId });
    }
  };

  const rootSnippets = snippets.filter(s => s.folderId === null);
  const allSnippets = snippets;

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-white dark:bg-gray-900 transition-colors">
        <Sidebar
          folders={folders}
          rootSnippets={rootSnippets}
          allSnippets={allSnippets}
          selectedFolderId={selectedFolderId}
          selectedSnippetId={selectedSnippet?.id || null}
          onSelectFolder={setSelectedFolderId}
          onSelectSnippet={setSelectedSnippet}
          onCreateFolder={handleCreateFolder}
          onCreateSnippet={handleCreateSnippet}
          onDeleteFolder={handleDeleteFolder}
          onDeleteSnippet={handleDeleteSnippet}
          onMoveSnippet={handleMoveSnippet}
        />
        <div className="flex-1 flex flex-col">
          {selectedSnippet ? (
            <Editor
              snippet={selectedSnippet}
              onUpdate={handleUpdateSnippet}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500">
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
