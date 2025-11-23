# Manga Gallery

A simple Node.js + HTML5 application that displays a collection of comics (folders of images) in a responsive grid. Each comic is shown as a card with the first page as the cover. Clicking a card opens a fullscreen viewer with navigation arrows (or keyboard arrows) to flip through pages. The viewer loops back to the first page after the last.

## Features

- **Recursive scanning**: The server scans the configured comics directory recursively, supporting nested folders.
- **Dynamic comics path**: The path can be changed from the web UI. An input field shows the current directory and a *Load Directory* button updates the server configuration.
- **Auto‑open browser**: When the server starts it automatically opens the default browser to `http://localhost:3000`.
- **Executable build**: The app can be compiled into a single Windows `.exe` using `pkg`.

## Prerequisites

- Node.js (v18 or newer recommended)
- npm (comes with Node)

## Installation

```bash
# Clone the repository (or copy the project folder)
cd c:/Users/agust/PhpstormProjects/manga-gallery

# Install dependencies
npm install
```

## Running the development server

```bash
npm start
```

The server will start on **http://localhost:3000** and automatically open your default browser.

### Changing the comics directory

1. In the top bar of the page you will see an input field showing the current comics path.
2. Edit the path to the folder that contains your comic collections (e.g., `F:\\manga`).
3. Click **Load Directory**. The gallery will refresh with the comics from the new location.

## Building a Windows executable

The project uses `pkg` to bundle the Node.js runtime, your source code, and static assets into a single `.exe`.

```bash
# Install pkg globally (if not already installed)
npm install -g pkg

# Build the executable (output will be manga-gallery.exe)
pkg . --output manga-gallery.exe
```

The generated `manga-gallery.exe` can be run on any Windows machine without needing Node.js installed.

## Project structure

```
├─ public/                # Front‑end assets
│   ├─ index.html        # Main page
│   ├─ style.css         # Styles (dark mode, glassmorphism, etc.)
│   └─ script.js         # UI logic (fetch comics, viewer, settings)
├─ comics/                # Default comics folder (can be changed at runtime)
├─ server.js              # Express server with recursive scanning
├─ package.json           # npm metadata and pkg configuration
└─ README.md              # This file
```

## License

MIT – feel free to modify and redistribute.
