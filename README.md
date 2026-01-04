# SnipLockr

A code snippet manager for organizing and managing your code snippets locally in your browser. Built with React and TypeScript.

https://github.com/user-attachments/assets/e3fa6842-fa08-404c-9202-4aa825951b43

## Features

Organize snippets into folders, edit with syntax highlighting, copy to clipboard, download as files, and toggle between light and dark themes. All data is stored locally in your browser.

## Getting Started

You can use SnipLockr in two ways either by using NPM or Docker.

### Using NPM

To use the NPM, run the following command to install dependencies and start the application:

```bash
npm install && npm run start
```

The application will be available at `http://localhost:5173`

### Using Docker

To use the Docker, build and start the production container by running the following command:

```bash
docker compose -f compose.yml up --build -d
```

The production application will be available at `http://localhost`

## Development

To use the development container, run the following command:

```bash
docker compose -f compose.dev.yml up
```

The development application will be available at `http://localhost:5173`

To stop the development container, run the following command:

```bash
docker compose -f compose.dev.yml down
```

## License

**SnipLockr** is licensed under the Apache-2.0 License - see the [LICENSE](/LICENSE) file for details.

## Security

If you discover a security vulnerability within this project, please check the [SECURITY](SECURITY.md) file for more information.
