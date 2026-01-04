export interface Snippet {
  id: string;
  filename: string;
  code: string;
  language: string;
  folderId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: number;
}

export interface AppData {
  folders: Folder[];
  snippets: Snippet[];
}

