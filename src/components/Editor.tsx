import { useState, useEffect, useRef } from 'react';
import type React from 'react';
import MonacoEditor from '@monaco-editor/react';
import { Copy, Download, Save, Edit2, X, Check } from 'lucide-react';
import { Snippet } from '../types';
import { copyToClipboard, downloadFile, detectLanguageFromFilename } from '../utils';
import { useTheme } from '../contexts/ThemeContext';

// Type for Monaco editor instance
type MonacoEditorInstance = Parameters<
  NonNullable<React.ComponentProps<typeof MonacoEditor>['onMount']>
>[0];

interface EditorProps {
  snippet: Snippet;
  onUpdate: (snippetId: string, updates: Partial<Snippet>) => void;
  onUnsavedChangesChange?: (snippetId: string, hasChanges: boolean) => void;
}

const languageMap: Record<string, string> = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  csharp: 'csharp',
  go: 'go',
  rust: 'rust',
  php: 'php',
  ruby: 'ruby',
  swift: 'swift',
  kotlin: 'kotlin',
  html: 'html',
  css: 'css',
  scss: 'scss',
  json: 'json',
  xml: 'xml',
  yaml: 'yaml',
  markdown: 'markdown',
  sql: 'sql',
  shell: 'shell',
  bash: 'bash',
  powershell: 'powershell',
  plaintext: 'plaintext',
};

export default function Editor({ snippet, onUpdate, onUnsavedChangesChange }: EditorProps) {
  const { theme } = useTheme();
  const [filename, setFilename] = useState(snippet.filename);
  const [code, setCode] = useState(snippet.code);
  const [language, setLanguage] = useState(snippet.language);
  const [copied, setCopied] = useState(false);
  const [isEditingFilename, setIsEditingFilename] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const filenameInputRef = useRef<HTMLInputElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);
  const editorRef = useRef<MonacoEditorInstance | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Track if there are unsaved changes
  const hasUnsavedChanges =
    code !== snippet.code || filename !== snippet.filename || language !== snippet.language;

  // Notify parent about unsaved changes
  useEffect(() => {
    if (onUnsavedChangesChange) {
      onUnsavedChangesChange(snippet.id, hasUnsavedChanges);
    }
  }, [hasUnsavedChanges, snippet.id, onUnsavedChangesChange]);

  useEffect(() => {
    setFilename(snippet.filename);
    setCode(snippet.code);
    setLanguage(snippet.language);
  }, [snippet.id]);

  // Focus editor when snippet changes
  useEffect(() => {
    if (editorRef.current) {
      setTimeout(() => {
        editorRef.current?.focus();
        // Move cursor to end of content
        const lineCount = editorRef.current?.getModel()?.getLineCount() || 1;
        const lastLine = editorRef.current?.getModel()?.getLineContent(lineCount) || '';
        editorRef.current?.setPosition({
          lineNumber: lineCount,
          column: lastLine.length + 1,
        });
      }, 100);
    }
  }, [snippet.id]);

  // Auto-detect language when filename changes
  useEffect(() => {
    const detectedLanguage = detectLanguageFromFilename(filename);
    if (detectedLanguage !== language && filename !== snippet.filename) {
      setLanguage(detectedLanguage);
    }
  }, [filename, language, snippet.filename]);

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    if (showControls) {
      if (controlsTimeoutRef.current) {
        window.clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => {
      if (controlsTimeoutRef.current) {
        window.clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, code, filename]);

  const handleSave = () => {
    if (!hasUnsavedChanges) return; // Don't save if there are no changes
    const detectedLanguage = detectLanguageFromFilename(filename);
    onUpdate(snippet.id, { filename, code, language: detectedLanguage });
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    downloadFile(code, filename);
  };

  const handleFilenameChange = (newFilename: string) => {
    setFilename(newFilename);
    const detectedLanguage = detectLanguageFromFilename(newFilename);
    setLanguage(detectedLanguage);
  };

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || '');
    setShowControls(true);
  };

  const handleFilenameEdit = () => {
    setIsEditingFilename(true);
    setShowControls(true);
    setTimeout(() => {
      filenameInputRef.current?.focus();
      filenameInputRef.current?.select();
    }, 0);
  };

  const handleFilenameSave = () => {
    setIsEditingFilename(false);
    handleSave();
  };

  const handleFilenameCancel = () => {
    setIsEditingFilename(false);
    setFilename(snippet.filename);
  };

  const handleEditorClick = () => {
    // Focus editor when clicking on container
    setTimeout(() => {
      editorRef.current?.focus();
    }, 0);
  };

  const monacoLanguage = languageMap[language] || 'plaintext';

  return (
    <div
      className="flex-1 flex flex-col h-full w-full bg-white dark:bg-gray-900 transition-colors relative"
      style={{ minHeight: 0 }}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => {
        if (!isEditingFilename) {
          setShowControls(false);
        }
      }}
    >
      {/* Floating Controls */}
      <div
        className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-20 transition-all duration-300 ease-out ${
          showControls
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
        style={{ pointerEvents: showControls ? 'auto' : 'none' }}
      >
        <div className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm animate-slide-in">
          {/* Filename */}
          {isEditingFilename ? (
            <div className="flex items-center gap-2">
              <input
                ref={filenameInputRef}
                type="text"
                value={filename}
                onChange={(e) => handleFilenameChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFilenameSave();
                  if (e.key === 'Escape') handleFilenameCancel();
                }}
                onBlur={handleFilenameSave}
                className="px-3 py-1.5 text-sm font-semibold border-2 border-blue-500 dark:border-blue-400 rounded-lg focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 min-w-[200px]"
                placeholder="filename.ext"
              />
              <button
                onClick={handleFilenameSave}
                className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                title="Save filename"
              >
                <Check size={16} className="text-green-600 dark:text-green-400" />
              </button>
              <button
                onClick={handleFilenameCancel}
                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                title="Cancel"
              >
                <X size={16} className="text-red-600 dark:text-red-400" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleFilenameEdit}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
              title="Click to edit filename"
            >
              <span className="max-w-[200px] truncate flex items-center gap-1.5">
                {filename}
                {hasUnsavedChanges && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-orange-500 dark:bg-orange-400 flex-shrink-0"
                    title="Unsaved changes"
                  />
                )}
              </span>
              <Edit2
                size={14}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 dark:text-gray-400"
              />
            </button>
          )}

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

          {/* Action Buttons */}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ease-out text-sm font-medium ${
              copied
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            title="Copy code"
          >
            <Copy size={16} />
            {copied ? 'Copied!' : 'Copy'}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 ease-out text-sm font-medium"
            title="Download file"
          >
            <Download size={16} />
            Download
          </button>

          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ease-out text-sm font-semibold ${
              hasUnsavedChanges
                ? 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 shadow-lg shadow-blue-500/30 cursor-pointer'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed opacity-60'
            }`}
            title={hasUnsavedChanges ? 'Save changes' : 'No changes to save'}
          >
            <Save size={16} />
            Save
          </button>
        </div>
      </div>

      {/* Full Screen Editor */}
      <div
        ref={editorContainerRef}
        className="flex-1 overflow-hidden w-full relative"
        style={{
          minHeight: 0,
          cursor: 'text',
          height: '100%',
        }}
        onClick={handleEditorClick}
      >
        <MonacoEditor
          height="100%"
          width="100%"
          language={monacoLanguage}
          value={code || ''}
          onChange={handleEditorChange}
          loading={
            <div className="flex items-center justify-center h-full text-gray-400">
              Loading editor...
            </div>
          }
          onMount={(editor: MonacoEditorInstance) => {
            editorRef.current = editor;

            // Configure editor to be fully editable
            editor.updateOptions({
              readOnly: false,
              cursorBlinking: 'blink',
              cursorSmoothCaretAnimation: 'on',
              cursorStyle: 'line',
              cursorWidth: 2,
            });

            // Force layout update
            setTimeout(() => {
              editor.layout();
            }, 0);

            // Focus the editor immediately
            setTimeout(() => {
              editor.focus();
              // Move cursor to end if there's content
              const model = editor.getModel();
              if (model) {
                const lineCount = model.getLineCount();
                const lastLine = model.getLineContent(lineCount);
                editor.setPosition({
                  lineNumber: lineCount,
                  column: lastLine.length + 1,
                });
                // Reveal cursor position
                editor.revealLineInCenter(lineCount);
              } else {
                editor.setPosition({ lineNumber: 1, column: 1 });
              }
            }, 200);

            // Auto-save when editor loses focus
            const editorElement = editor.getDomNode();
            if (editorElement) {
              const handleBlur = () => {
                handleSave();
              };
              editorElement.addEventListener('blur', handleBlur);
            }
          }}
          theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
          options={{
            readOnly: false,
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'Monaco, Menlo, "Courier New", monospace',
            lineNumbers: 'on',
            lineNumbersMinChars: 3,
            lineDecorationsWidth: 10,
            glyphMargin: false,
            lineHeight: 20,
            folding: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on',
            padding: { top: 20, bottom: 20 },
            cursorBlinking: 'blink',
            cursorSmoothCaretAnimation: 'on',
            cursorStyle: 'line',
            cursorWidth: 2,
            renderLineHighlight: 'line',
            renderWhitespace: 'selection',
            selectOnLineNumbers: true,
            mouseWheelZoom: false,
            quickSuggestions: true,
            contextmenu: true,
            mouseWheelScrollSensitivity: 1,
            fastScrollSensitivity: 5,
            acceptSuggestionOnEnter: 'on',
            acceptSuggestionOnCommitCharacter: true,
            snippetSuggestions: 'top',
            suggestOnTriggerCharacters: true,
            tabCompletion: 'on',
            wordBasedSuggestions: 'matchingDocuments',
            formatOnPaste: false,
            formatOnType: false,
            links: true,
            colorDecorators: true,
            bracketPairColorization: {
              enabled: true,
            },
            guides: {
              bracketPairs: true,
              indentation: true,
            },
          }}
        />
      </div>
    </div>
  );
}
