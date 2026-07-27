import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Proxy Endpoint for safe CORS-bypassing client-side security inspections
  app.post('/api/proxy/execute', async (req, res) => {
    try {
      const { url, method, headers, body } = req.body;

      if (!url) {
        return res.status(400).json({ error: 'Missing target URL' });
      }

      const parsedUrl = new URL(url);
      const isHttps = parsedUrl.protocol === 'https:';

      const fetchHeaders: Record<string, string> = {};
      if (Array.isArray(headers)) {
        headers.forEach((h: { key: string; value: string }) => {
          if (h.key && h.value && h.key.toLowerCase() !== 'host') {
            fetchHeaders[h.key] = h.value;
          }
        });
      }

      const startTime = Date.now();
      const response = await fetch(url, {
        method: method || 'GET',
        headers: fetchHeaders,
        body: ['GET', 'HEAD'].includes(method?.toUpperCase()) ? undefined : body || undefined,
      });
      const responseTimeMs = Date.now() - startTime;

      const responseText = await response.text();
      const responseHeadersArr: { key: string; value: string }[] = [];
      response.headers.forEach((value, key) => {
        responseHeadersArr.push({ key, value });
      });

      return res.json({
        status: response.status,
        statusText: response.statusText,
        timeMs: responseTimeMs,
        sizeBytes: Buffer.byteLength(responseText, 'utf8'),
        headers: responseHeadersArr,
        body: responseText,
      });
    } catch (err: any) {
      return res.status(500).json({
        error: 'Proxy request execution failed',
        message: err.message || String(err),
      });
    }
  });

  // Health Endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', tool: 'Web Security Studio' });
  });

  // Vite development middleware or production static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Web Security Studio server running on http://localhost:${PORT}`);
  });
}

startServer();
