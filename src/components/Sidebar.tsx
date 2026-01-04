import { useState, useRef, useCallback } from 'react';
import { Folder, Snippet } from '../types';
import { Plus, Trash2, Folder as FolderIcon, FileCode, ChevronDown, ChevronRight, Moon, Sun, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface SidebarProps {
  folders: Folder[];
  rootSnippets: Snippet[];
  allSnippets: Snippet[];
  selectedFolderId: string | null;
  selectedSnippetId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onSelectSnippet: (snippet: Snippet | null) => void;
  onCreateFolder: (name: string) => void;
  onCreateSnippet: (folderId: string | null) => void;
  onDeleteFolder: (folderId: string) => void;
  onDeleteSnippet: (snippetId: string) => void;
  onMoveSnippet: (snippetId: string, folderId: string | null) => void;
}

export default function Sidebar({
  folders,
  rootSnippets,
  allSnippets,
  selectedFolderId,
  selectedSnippetId,
  onSelectFolder,
  onSelectSnippet,
  onCreateFolder,
  onCreateSnippet,
  onDeleteFolder,
  onDeleteSnippet,
  onMoveSnippet,
}: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [draggedSnippetId, setDraggedSnippetId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const dragTimeoutRef = useRef<number | null>(null);

  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(folderId)) {
        newExpanded.delete(folderId);
      } else {
        newExpanded.add(folderId);
      }
      return newExpanded;
    });
  }, []);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreatingFolder(false);
    }
  };

  const handleDeleteFolder = (e: React.MouseEvent, folderId: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (window.confirm('Delete this folder and all its snippets?')) {
      onDeleteFolder(folderId);
    }
  };

  const handleDeleteSnippet = (e: React.MouseEvent, snippetId: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (window.confirm('Delete this snippet?')) {
      onDeleteSnippet(snippetId);
    }
  };

  const handleDragStart = (e: React.DragEvent, snippetId: string) => {
    setDraggedSnippetId(snippetId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', snippetId);
  };

  const handleDragOver = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverFolderId(folderId);
    
    // Auto-expand folder after hovering for 500ms
    if (folderId && !expandedFolders.has(folderId)) {
      if (dragTimeoutRef.current) {
        window.clearTimeout(dragTimeoutRef.current);
      }
      dragTimeoutRef.current = window.setTimeout(() => {
        setExpandedFolders(prev => new Set([...prev, folderId]));
      }, 500);
    }
  };

  const handleDragLeave = () => {
    if (dragTimeoutRef.current) {
      window.clearTimeout(dragTimeoutRef.current);
    }
    setDragOverFolderId(null);
  };

  const handleDrop = (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (dragTimeoutRef.current) {
      window.clearTimeout(dragTimeoutRef.current);
    }
    
    if (draggedSnippetId) {
      const snippet = allSnippets.find(s => s.id === draggedSnippetId);
      if (snippet && snippet.folderId !== targetFolderId) {
        onMoveSnippet(draggedSnippetId, targetFolderId);
      }
    }
    
    setDraggedSnippetId(null);
    setDragOverFolderId(null);
  };

  const handleDragEnd = () => {
    if (dragTimeoutRef.current) {
      window.clearTimeout(dragTimeoutRef.current);
    }
    setDraggedSnippetId(null);
    setDragOverFolderId(null);
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full transition-colors shadow-sm">
      {/* Header */}
      <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            SnipLockr
          </h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun size={20} className="text-yellow-500" />
            ) : (
              <Moon size={20} className="text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>
        
        {/* New Snippet Button */}
        <button
          onClick={() => {
            onCreateSnippet(null);
            onSelectFolder(null);
          }}
          className="w-full px-4 py-3 text-sm bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transition-all duration-200 ease-out flex items-center justify-center gap-2 font-semibold shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 transform hover:scale-[1.01] active:scale-[0.99]"
        >
          <Plus size={18} />
          New Snippet
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Root Snippets */}
        {rootSnippets.length > 0 && (
          <div>
            <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-2">
              Snippets
            </div>
            <div className="space-y-1">
              {rootSnippets.map((snippet) => (
                <div
                  key={snippet.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, snippet.id)}
                  onDragEnd={handleDragEnd}
                  className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ease-out ${
                    selectedSnippetId === snippet.id
                      ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 shadow-md border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 border border-transparent'
                  } ${draggedSnippetId === snippet.id ? 'opacity-40 scale-95' : 'animate-fade-in'}`}
                  onClick={() => {
                    onSelectSnippet(snippet);
                    onSelectFolder(null);
                  }}
                >
                  <FileCode size={16} className={`flex-shrink-0 ${selectedSnippetId === snippet.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
                  <span className="flex-1 text-sm font-medium truncate">{snippet.filename}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleDeleteSnippet(e, snippet.id);
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-opacity duration-200 ease-out"
                    title="Delete snippet"
                  >
                    <Trash2 size={14} className="text-red-600 dark:text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Folders */}
        {folders.length > 0 && (
          <div>
            <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-2">
              Folders
            </div>
            <div className="space-y-1">
              {folders.map((folder) => {
                const folderSnippetsList = allSnippets.filter(s => s.folderId === folder.id);
                const isExpanded = expandedFolders.has(folder.id);
                const isSelected = selectedFolderId === folder.id;
                const isDragOver = dragOverFolderId === folder.id;

                return (
                  <div key={folder.id} className="space-y-1">
                    <div
                      onDragOver={(e) => handleDragOver(e, folder.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, folder.id)}
                      className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ease-out ${
                        isSelected 
                          ? 'bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800' 
                          : isDragOver
                          ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-400 dark:border-blue-600 border-dashed'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent'
                      }`}
                      onClick={() => {
                        toggleFolder(folder.id);
                        onSelectFolder(folder.id);
                      }}
                    >
                      {isExpanded ? (
                        <ChevronDown size={16} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight size={16} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      )}
                      <FolderIcon size={16} className={`flex-shrink-0 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                      <span className={`flex-1 text-sm font-medium truncate ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-700 dark:text-gray-300'}`}>
                        {folder.name}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onCreateSnippet(folder.id);
                            if (!isExpanded) toggleFolder(folder.id);
                            onSelectFolder(folder.id);
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="New snippet"
                        >
                          <Plus size={14} className="text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleDeleteFolder(e, folder.id);
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete folder"
                        >
                          <Trash2 size={14} className="text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="ml-6 mt-1 space-y-1 animate-fade-in">
                        {folderSnippetsList.map((snippet) => (
                          <div
                            key={snippet.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, snippet.id)}
                            onDragEnd={handleDragEnd}
                            className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ease-out ${
                              selectedSnippetId === snippet.id
                                ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 shadow-sm border border-blue-200 dark:border-blue-800'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 border border-transparent'
                            } ${draggedSnippetId === snippet.id ? 'opacity-40 scale-95' : 'animate-fade-in'}`}
                            onClick={() => {
                              onSelectSnippet(snippet);
                              onSelectFolder(folder.id);
                            }}
                          >
                            <FileCode size={14} className={`flex-shrink-0 ${selectedSnippetId === snippet.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
                            <span className="flex-1 text-sm font-medium truncate">{snippet.filename}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleDeleteSnippet(e, snippet.id);
                              }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-opacity duration-200 ease-out"
                              title="Delete snippet"
                            >
                              <Trash2 size={13} className="text-red-600 dark:text-red-400" />
                            </button>
                          </div>
                        ))}
                        {folderSnippetsList.length === 0 && (
                          <div className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500 italic text-center">
                            No snippets yet
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Drop zone for root */}
        {draggedSnippetId && (
          <div
            onDragOver={(e) => handleDragOver(e, null)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, null)}
            className={`p-4 rounded-xl border-2 border-dashed transition-all ${
              dragOverFolderId === null
                ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-700 bg-transparent'
            }`}
          >
            <div className="text-xs text-center font-medium text-gray-600 dark:text-gray-400">
              {dragOverFolderId === null ? 'Drop here to move to root' : 'Drag snippet here'}
            </div>
          </div>
        )}

        {/* Create Folder */}
        {isCreatingFolder ? (
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder();
                if (e.key === 'Escape') {
                  setIsCreatingFolder(false);
                  setNewFolderName('');
                }
              }}
              placeholder="Folder name..."
              className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-2"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateFolder}
                className="flex-1 px-3 py-2 text-xs font-semibold bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setIsCreatingFolder(false);
                  setNewFolderName('');
                }}
                className="px-3 py-2 text-xs font-semibold bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsCreatingFolder(true)}
            className="w-full px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={14} />
            New Folder
          </button>
        )}
      </div>
    </div>
  );
}
