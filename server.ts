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

  // Increase payload limit for base64 images
  app.use(express.json({ limit: '50mb' }));

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

  // API Route to save all build mode content
  app.post('/api/build-mode/save-all', async (req, res) => {
    try {
      const { slides, feedItems } = req.body;
      
      // Process Hero Slides
      const heroDir = path.join(process.cwd(), 'public', 'hero');
      if (!fs.existsSync(heroDir)) fs.mkdirSync(heroDir, { recursive: true });

      const processedSlides = (slides || []).map((slide: any, index: number) => {
        if (slide.image && slide.image.startsWith('data:image')) {
          const base64Data = slide.image.replace(/^data:image\/\w+;base64,/, '');
          const extension = slide.image.split(';')[0].split('/')[1] || 'jpg';
          const fileName = `hero-${index + 1}-${Date.now()}.${extension}`;
          const filePath = path.join(heroDir, fileName);
          fs.writeFileSync(filePath, base64Data, 'base64');
          return { ...slide, image: `/hero/${fileName}` };
        }
        return slide;
      });

      // Process Feed Items
      const feedDir = path.join(process.cwd(), 'public', 'feed');
      if (!fs.existsSync(feedDir)) fs.mkdirSync(feedDir, { recursive: true });

      const processedFeedItems = (feedItems || []).map((item: any, index: number) => {
        if (item.image && item.image.startsWith('data:image')) {
          const base64Data = item.image.replace(/^data:image\/\w+;base64,/, '');
          const extension = item.image.split(';')[0].split('/')[1] || 'jpg';
          const fileName = `feed-${index + 1}-${Date.now()}.${extension}`;
          const filePath = path.join(feedDir, fileName);
          fs.writeFileSync(filePath, base64Data, 'base64');
          return { ...item, image: `/feed/${fileName}` };
        }
        return item;
      });

      // Write to data files
      const heroContentFile = path.join(process.cwd(), 'src', 'data', 'heroContent.ts');
      fs.writeFileSync(heroContentFile, `import { HeroSlide } from '@/types/buildMode';\n\nexport const heroContent: HeroSlide[] = ${JSON.stringify(processedSlides, null, 2)};\n`);

      const feedContentFile = path.join(process.cwd(), 'src', 'data', 'feedContent.ts');
      fs.writeFileSync(feedContentFile, `import { FeedItem } from '@/types/buildMode';\n\nexport const feedContent: FeedItem[] = ${JSON.stringify(processedFeedItems, null, 2)};\n`);

      res.json({ success: true, slides: processedSlides, feedItems: processedFeedItems });
    } catch (error) {
      console.error('Error saving all content:', error);
      res.status(500).json({ error: 'Failed to save content' });
    }
  });

  // API Route to save hero content (legacy support)
  app.post('/api/build-mode/save-hero', async (req, res) => {
    try {
      const { slides } = req.body;
      
      if (!slides || !Array.isArray(slides)) {
        return res.status(400).json({ error: 'Invalid slides data' });
      }

      const heroDir = path.join(process.cwd(), 'public', 'hero');
      if (!fs.existsSync(heroDir)) {
        fs.mkdirSync(heroDir, { recursive: true });
      }

      // Process images and update paths
      const processedSlides = slides.map((slide: any, index: number) => {
        if (slide.image && slide.image.startsWith('data:image')) {
          const base64Data = slide.image.replace(/^data:image\/\w+;base64,/, '');
          const extension = slide.image.split(';')[0].split('/')[1];
          const fileName = `hero-${index + 1}-${Date.now()}.${extension}`;
          const filePath = path.join(heroDir, fileName);
          
          fs.writeFileSync(filePath, base64Data, 'base64');
          return { ...slide, image: `/hero/${fileName}` };
        }
        return slide;
      });

      // Write to src/data/heroContent.ts
      const contentFile = path.join(process.cwd(), 'src', 'data', 'heroContent.ts');
      const fileContent = `import { HeroSlide } from '@/types/buildMode';\n\nexport const heroContent: HeroSlide[] = ${JSON.stringify(processedSlides, null, 2)};\n`;
      
      fs.writeFileSync(contentFile, fileContent);

      res.json({ success: true, slides: processedSlides });
    } catch (error) {
      console.error('Error saving hero content:', error);
      res.status(500).json({ error: 'Failed to save hero content' });
    }
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
