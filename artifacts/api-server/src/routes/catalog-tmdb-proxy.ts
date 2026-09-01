import express, { Request, Response } from 'express';

const router = express.Router();
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_KEY = process.env.TMDB_API_KEY;

if (!TMDB_KEY) {
  console.warn('TMDB_API_KEY not set — catalog proxy will fail at runtime');
}

/**
 * GET /api/tmdb/search?q=...&page=1
 * Proxies TMDB multi search (movies + tv + people) and strips unnecessary fields.
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) return res.status(400).json({ error: 'missing q' });

    const page = Number(req.query.page || 1);
    if (!TMDB_KEY) return res.status(500).json({ error: 'TMDB_API_KEY not configured' });

    const url = `${TMDB_BASE}/search/multi?api_key=${encodeURIComponent(
      TMDB_KEY,
    )}&query=${encodeURIComponent(q)}&page=${page}&include_adult=false`;

    const upstream = await fetch(url);
    if (!upstream.ok) return res.status(upstream.status).send(await upstream.text());
    const data = await upstream.json();

    // basic sanitization: return only what frontend needs
    const safeResults = (data.results || []).map((r: any) => ({
      id: r.id,
      media_type: r.media_type,
      title: r.title || r.name,
      overview: r.overview,
      poster_path: r.poster_path,
      backdrop_path: r.backdrop_path,
      release_date: r.release_date || r.first_air_date,
      popularity: r.popularity,
    }));

    return res.json({ page: data.page, total_results: data.total_results, results: safeResults });
  } catch (err: any) {
    console.error('tmdb search proxy error', err);
    return res.status(500).json({ error: 'tmdb proxy error' });
  }
});

/**
 * GET /api/tmdb/details/:mediaType(movie|tv)/:id
 * fetches details and appends videos (trailers) so frontend can embed trailers safely from YouTube ids.
 */
router.get('/details/:mediaType/:id', async (req: Request, res: Response) => {
  try {
    const { mediaType, id } = req.params;
    if (!['movie', 'tv'].includes(mediaType)) return res.status(400).json({ error: 'invalid media type' });
    if (!TMDB_KEY) return res.status(500).json({ error: 'TMDB_API_KEY not configured' });

    const url = `${TMDB_BASE}/${mediaType}/${encodeURIComponent(id)}?api_key=${encodeURIComponent(
      TMDB_KEY,
    )}&append_to_response=videos,images,credits`;

    const upstream = await fetch(url);
    if (!upstream.ok) return res.status(upstream.status).send(await upstream.text());
    const data = await upstream.json();

    // pick only necessary fields
    const safe = {
      id: data.id,
      title: data.title || data.name,
      overview: data.overview,
      videos: data.videos?.results || [],
      credits: data.credits || {},
      images: data.images || {},
    };

    return res.json(safe);
  } catch (err: any) {
    console.error('tmdb details proxy error', err);
    return res.status(500).json({ error: 'tmdb details error' });
  }
});

export default router;
