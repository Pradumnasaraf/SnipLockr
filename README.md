# SnipLockr

A local-first code snippet manager built with React and TypeScript. Organize your code snippets with optional folders, syntax highlighting, easy copying, and download functionality.

## Features

- 📁 **Optional Folder Organization**: Organize snippets into folders (optional)
- 💾 **Local Storage**: All data is stored locally in your browser
- 🎨 **Syntax Highlighting**: Beautiful syntax highlighting with Monaco Editor for 25+ languages
- 📋 **Easy Copy**: One-click copy to clipboard
- ⬇️ **Download**: Download snippets as files with proper extensions
- 🎯 **Clean UI**: Modern, distraction-free full-screen editor with floating controls
- 🌙 **Dark Mode**: Toggle between light and dark themes
- 🔄 **Drag & Drop**: Easily move snippets between folders

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

## Usage

1. **Create a Snippet**: Click "New Snippet" in the sidebar to create a new code snippet
2. **Create a Folder (Optional)**: Click "New Folder" to organize snippets into folders
3. **Edit Filename**: Click on the filename in the floating controls to edit it (language is auto-detected from extension)
4. **Edit Code**: Type or paste your code in the full-screen Monaco editor
5. **Copy**: Click the "Copy" button in the floating controls to copy code to clipboard
6. **Download**: Click "Download" to save the snippet as a file with the correct extension
7. **Save**: Changes are auto-saved, or click "Save" to manually save
8. **Drag & Drop**: Drag snippets to move them between folders or to root

## Supported Languages

JavaScript, TypeScript, Python, Java, C++, C, C#, Go, Rust, PHP, Ruby, Swift, Kotlin, HTML, CSS, SCSS, JSON, XML, YAML, Markdown, SQL, Shell, Bash, PowerShell, and more.

## Build

```bash
npm run build
```

The built files will be in the `dist` directory.

## Docker

### Production Build

The production Docker image uses a multi-stage build with `node:22-alpine` for building and `nginx:alpine` for serving.

Build and run with Docker:

```bash
# Build and run with docker-compose
docker-compose up --build -d

# Or build and run manually
docker build -t sniplockr .
docker run -d -p 80:80 sniplockr
```

The application will be available at `http://localhost`

### Development with Docker

Run the development server in Docker:

```bash
docker-compose -f docker-compose.dev.yml up
```

The development server will be available at `http://localhost:5173`

### Docker Commands

```bash
# Build production image
docker build -t sniplockr .

# Run production container
docker run -d -p 80:80 --name sniplockr sniplockr

# Stop container
docker stop sniplockr

# Remove container
docker rm sniplockr

# View logs
docker logs sniplockr
```
