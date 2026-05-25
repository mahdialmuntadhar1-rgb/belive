import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  const distPath = path.join(process.cwd(), 'dist');
  const publicPath = path.join(process.cwd(), 'public');

  // 1. Explicitly serve manifest with correct headers to avoid 401
  // Move to top to ensure it's not intercepted
  app.get(['/manifest.json', '/manifest.webmanifest'], (req, res) => {
    const manifestPath = path.join(distPath, 'manifest.json');
    const fallbackPath = path.join(publicPath, 'manifest.json');
    const finalPath = fs.existsSync(manifestPath) ? manifestPath : fallbackPath;

    if (fs.existsSync(finalPath)) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.sendFile(finalPath);
    }
    res.status(404).send('Not found');
  });

  // 2. Explicitly serve hero images to avoid any path issues
  app.get('/hero/:filename', (req, res) => {
    const filename = req.params.filename;
    const distHeroPath = path.join(distPath, 'hero', filename);
    const publicHeroPath = path.join(publicPath, 'hero', filename);
    const finalPath = fs.existsSync(distHeroPath) ? distHeroPath : publicHeroPath;

    if (fs.existsSync(finalPath)) {
      res.setHeader('Content-Type', 'image/jpeg'); // Default to jpeg
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.sendFile(finalPath);
    }
    res.status(404).send('Not found');
  });

  // 3. Explicitly serve feed images
  app.get('/feed/:filename', (req, res) => {
    const filename = req.params.filename;
    const distFeedPath = path.join(distPath, 'feed', filename);
    const publicFeedPath = path.join(publicPath, 'feed', filename);
    const finalPath = fs.existsSync(distFeedPath) ? distFeedPath : publicFeedPath;

    if (fs.existsSync(finalPath)) {
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.sendFile(finalPath);
    }
    res.status(404).send('Not found');
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath, {
      setHeaders: (res, path) => {
        if (path.endsWith('.webmanifest')) {
          res.setHeader('Content-Type', 'application/manifest+json');
        }
        res.setHeader('Access-Control-Allow-Origin', '*');
      }
    }));

    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
