import express, { Request, Response } from 'express';

const router = express.Router();

/**
 * GET /api/proxy/youtube?q=free+anime+movie&maxResults=12
 * Proxies YouTube Data API v3 search requests server-side so the API key is never sent to the browser.
 * Filters for long videos with Creative Commons license to prefer re-usable uploads.
 */
router.get('/youtube', async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) return res.status(400).json({ error: 'missing query parameter q' });

    const maxResults = Math.min(Number(req.query.maxResults || 12), 50);
    const key = process.env.YT_API_KEY;
    if (!key) return res.status(500).json({ error: 'YT_API_KEY not configured on server' });

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoDuration=long&videoLicense=creativeCommon&q=${encodeURIComponent(
      q,
    )}&key=${encodeURIComponent(key)}&maxResults=${maxResults}`;

    const upstream = await fetch(url);
    if (!upstream.ok) {
      const text = await upstream.text();
      return res.status(upstream.status).send(text);
    }
    const data = await upstream.json();
    // Minimal sanitization: only return items and pageInfo to the client
    const safe = {
      pageInfo: data.pageInfo,
      items: (data.items || []).map((it: any) => ({
        id: it.id,
        snippet: it.snippet,
      })),
    };
    return res.json(safe);
  } catch (err: any) {
    console.error('youtube-proxy error', err);
    return res.status(500).json({ error: 'youtube proxy error' });
  }
});

export default router;
