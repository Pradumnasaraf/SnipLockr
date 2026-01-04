# SnipLockr

A local-first code snippet manager built with React and TypeScript. Organize your code snippets into courses, with syntax highlighting, easy copying, and download functionality.

## Features

- 📁 **Course Organization**: Organize snippets into courses (categories)
- 💾 **Local Storage**: All data is stored locally in your browser
- 🎨 **Syntax Highlighting**: Beautiful syntax highlighting for 25+ languages
- 📋 **Easy Copy**: One-click copy to clipboard
- ⬇️ **Download**: Download snippets as files with proper extensions
- 🎯 **Simple UI**: Clean, modern interface with sidebar navigation

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

1. **Create a Course**: Click "New Course" in the sidebar and enter a course name
2. **Add Snippets**: Click the "+" button next to a course to add a new snippet
3. **Edit Code**: Type or paste your code in the editor
4. **Select Language**: Choose the programming language from the dropdown
5. **Copy**: Click the "Copy" button to copy code to clipboard
6. **Download**: Click "Download" to save the snippet as a file with the correct extension

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


