# SnipLockr

A code snippet manager for organizing and managing your code snippets locally in your browser. Built with React and TypeScript.

https://github.com/user-attachments/assets/e3fa6842-fa08-404c-9202-4aa825951b43

## Features

Organize snippets into folders, edit with syntax highlighting, copy to clipboard, download as files, and toggle between light and dark themes. All data is stored locally in your browser.

## Getting Started

You can use SnipLockr in two ways either by using NPM or Docker.

### Using NPM

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open `http://localhost:5173` in your browser

### Using Docker

**Development:**

```bash
docker compose -f compose.dev.yml up
```

The development server will be available at `http://localhost:5173`

**Production:**

```bash
docker compose up --build -d
```

The production server will be available at `http://localhost`
