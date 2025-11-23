const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = 3000;
let COMICS_DIR = path.resolve(__dirname, 'comics'); // Configurable directory for comics

app.use(cors());
app.use(express.json()); // Enable JSON body parsing
app.use(express.static('public'));
app.use('/comics', (req, res, next) => {
    // Dynamic static serving based on current COMICS_DIR
    express.static(COMICS_DIR)(req, res, next);
});

// ... (findComics function remains the same)

// API to get current settings
app.get('/api/settings', (req, res) => {
    res.json({ path: COMICS_DIR });
});

// API to update settings
app.post('/api/settings', (req, res) => {
    const newPath = req.body.path;
    if (newPath && fs.existsSync(newPath)) {
        COMICS_DIR = newPath;
        console.log(`Comics directory updated to: ${COMICS_DIR}`);
        res.json({ success: true, path: COMICS_DIR });
    } else {
        res.status(400).json({ error: 'Invalid directory path' });
    }
});

// ... (API endpoints for comics remain the same, they use the global COMICS_DIR variable)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    // Auto-open browser
    const url = `http://localhost:${PORT}`;
    const start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
    exec(`${start} ${url}`);
});


// Recursive function to find comics
function findComics(dir, relativePath = '') {
    let results = [];
    let items;
    try {
        items = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
        console.error(`Could not read directory ${dir}:`, e);
        return [];
    }

    // Check for images in current directory
    const images = items.filter(item => !item.isDirectory() && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(item.name));
    if (images.length > 0) {
        images.sort();
        // Use forward slashes for URLs
        const urlPath = relativePath.split(path.sep).join('/');
        results.push({
            name: path.basename(dir), // Display name is just the folder name
            path: urlPath, // Full relative path for API calls
            cover: `/comics/${urlPath ? urlPath + '/' : ''}${images[0].name}`
        });
    }

    // Recurse into subdirectories
    const subdirs = items.filter(item => item.isDirectory());
    for (const subdir of subdirs) {
        const subDirFullPath = path.join(dir, subdir.name);
        const subRelativePath = relativePath ? path.join(relativePath, subdir.name) : subdir.name;
        results = results.concat(findComics(subDirFullPath, subRelativePath));
    }

    return results;
}

// API to list all comics (recursively)
app.get('/api/comics', (req, res) => {
    try {
        const comics = findComics(COMICS_DIR);
        res.json(comics);
    } catch (error) {
        console.error('Error scanning comics:', error);
        res.status(500).json({ error: 'Failed to list comics' });
    }
});

// API to list images in a specific comic (via query param)
app.get('/api/comic', (req, res) => {
    const comicPathRelative = req.query.path || '';
    // Prevent directory traversal attacks
    if (comicPathRelative.includes('..')) {
        return res.status(400).json({ error: 'Invalid path' });
    }

    const comicPath = path.join(COMICS_DIR, comicPathRelative);

    if (!fs.existsSync(comicPath)) {
        return res.status(404).json({ error: 'Comic not found' });
    }

    try {
        const files = fs.readdirSync(comicPath).filter(file => {
            return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file);
        });
        files.sort(); // Sort files alphabetically

        const urlPath = comicPathRelative.split(path.sep).join('/');
        const images = files.map(file => `/comics/${urlPath ? urlPath + '/' : ''}${file}`);
        res.json({ name: path.basename(comicPath), images });
    } catch (error) {
        console.error('Error reading comic directory:', error);
        res.status(500).json({ error: 'Failed to get comic details' });
    }
});


