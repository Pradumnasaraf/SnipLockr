import { AppData, Folder, Snippet } from './types';

const STORAGE_KEY = 'sniplockr-data';

export const storage = {
  getData(): AppData {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Migrate old data structure if needed
      if (parsed.courses && !parsed.folders) {
        parsed.folders = (
          parsed.courses as Array<{ id: string; name: string; createdAt: number }>
        ).map((c) => ({
          id: c.id,
          name: c.name,
          createdAt: c.createdAt,
        }));
        parsed.snippets = (
          parsed.snippets as Array<
            { courseId?: string; title?: string; filename?: string } & Snippet
          >
        ).map((s) => ({
          ...s,
          folderId: s.courseId || null,
          filename: s.title || s.filename || 'untitled.txt',
        }));
        delete parsed.courses;
      }
      return parsed;
    }
    return { folders: [], snippets: [] };
  },

  saveData(data: AppData): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  addFolder(folder: Folder): void {
    const data = this.getData();
    data.folders.push(folder);
    this.saveData(data);
  },

  updateFolder(folderId: string, updates: Partial<Folder>): void {
    const data = this.getData();
    const folder = data.folders.find((f) => f.id === folderId);
    if (folder) {
      Object.assign(folder, updates);
      this.saveData(data);
    }
  },

  deleteFolder(folderId: string): void {
    const data = this.getData();
    data.folders = data.folders.filter((f) => f.id !== folderId);
    data.snippets = data.snippets.filter((s) => s.folderId !== folderId);
    this.saveData(data);
  },

  addSnippet(snippet: Snippet): void {
    const data = this.getData();
    data.snippets.push(snippet);
    this.saveData(data);
  },

  updateSnippet(snippetId: string, updates: Partial<Snippet>): void {
    const data = this.getData();
    const snippet = data.snippets.find((s) => s.id === snippetId);
    if (snippet) {
      Object.assign(snippet, updates);
      snippet.updatedAt = Date.now();
      this.saveData(data);
    }
  },

  deleteSnippet(snippetId: string): void {
    const data = this.getData();
    data.snippets = data.snippets.filter((s) => s.id !== snippetId);
    this.saveData(data);
  },
};
