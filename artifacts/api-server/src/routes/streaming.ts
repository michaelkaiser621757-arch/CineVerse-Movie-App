import { Router } from 'express';
import tmdbService from '../services/tmdbService';
import jikanService from '../services/jikanService';
import anilistService from '../services/anilistService';
import tvmazeService from '../services/tvmazeService';
import liveTvService from '../services/liveTvService';

const router = Router();

// ========== MOVIES ROUTES ==========
router.get('/movies/popular', async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const language = (req.query.language as string) || 'en-US';
    const data = await tmdbService.getPopularMovies(page, language);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch popular movies' });
  }
});

router.get('/movies/trending', async (req, res) => {
  try {
    const timeWindow = (req.query.timeWindow as string) || 'week';
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const data = await tmdbService.getTrendingMovies(timeWindow, page);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trending movies' });
  }
});

router.get('/movies/top-rated', async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const language = (req.query.language as string) || 'en-US';
    const data = await tmdbService.getTopRatedMovies(page, language);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top rated movies' });
  }
});

router.get('/movies/upcoming', async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const language = (req.query.language as string) || 'en-US';
    const data = await tmdbService.getUpcomingMovies(page, language);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch upcoming movies' });
  }
});

router.get('/movies/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: 'Search query required' });
    }
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const language = (req.query.language as string) || 'en-US';
    const data = await tmdbService.searchMovies(query, page, language);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search movies' });
  }
});

router.get('/movies/:id', async (req, res) => {
  try {
    const movieId = parseInt(req.params.id);
    const language = (req.query.language as string) || 'en-US';
    const data = await tmdbService.getMovieDetails(movieId, language);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movie details' });
  }
});

// ========== SERIES ROUTES ==========
router.get('/series/popular', async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const language = (req.query.language as string) || 'en-US';
    const data = await tmdbService.getPopularSeries(page, language);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch popular series' });
  }
});

router.get('/series/trending', async (req, res) => {
  try {
    const timeWindow = (req.query.timeWindow as string) || 'week';
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const data = await tmdbService.getTrendingSeries(timeWindow, page);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trending series' });
  }
});

router.get('/series/top-rated', async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const language = (req.query.language as string) || 'en-US';
    const data = await tmdbService.getTopRatedSeries(page, language);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top rated series' });
  }
});

router.get('/series/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: 'Search query required' });
    }
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const language = (req.query.language as string) || 'en-US';
    const data = await tmdbService.searchSeries(query, page, language);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search series' });
  }
});

router.get('/series/:id', async (req, res) => {
  try {
    const seriesId = parseInt(req.params.id);
    const language = (req.query.language as string) || 'en-US';
    const data = await tmdbService.getSeriesDetails(seriesId, language);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch series details' });
  }
});

// ========== ANIME ROUTES (JIKAN) ==========
router.get('/anime/trending', async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 25;
    const data = await jikanService.getTrendingAnime(page, limit);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trending anime' });
  }
});

router.get('/anime/top-rated', async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 25;
    const data = await jikanService.getTopAnime('airing', page, limit);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top rated anime' });
  }
});

router.get('/anime/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: 'Search query required' });
    }
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 25;
    const data = await jikanService.searchAnime(query, page, limit);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search anime' });
  }
});

router.get('/anime/:id', async (req, res) => {
  try {
    const animeId = parseInt(req.params.id);
    const data = await jikanService.getAnimeDetails(animeId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch anime details' });
  }
});

router.get('/anime/:id/episodes', async (req, res) => {
  try {
    const animeId = parseInt(req.params.id);
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const data = await jikanService.getAnimeEpisodes(animeId, page);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch anime episodes' });
  }
});

// ========== ANILIST ANIME ROUTES ==========
router.get('/anilist/anime/trending', async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const perPage = req.query.perPage ? parseInt(req.query.perPage as string) : 20;
    const data = await anilistService.getTrendingAnime(page, perPage);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trending anime from AniList' });
  }
});

router.get('/anilist/anime/popular', async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const perPage = req.query.perPage ? parseInt(req.query.perPage as string) : 20;
    const data = await anilistService.getPopularAnime(page, perPage);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch popular anime from AniList' });
  }
});

router.get('/anilist/anime/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: 'Search query required' });
    }
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const perPage = req.query.perPage ? parseInt(req.query.perPage as string) : 20;
    const data = await anilistService.searchAnime(query, page, perPage);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search anime on AniList' });
  }
});

// ========== TV SHOWS ROUTES (TVMaze) ==========
router.get('/tv/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: 'Search query required' });
    }
    const data = await tvmazeService.searchShows(query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search TV shows' });
  }
});

router.get('/tv/schedule', async (req, res) => {
  try {
    const country = (req.query.country as string) || 'US';
    const date = req.query.date as string;
    const data = await tvmazeService.getSchedule(country, date);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch TV schedule' });
  }
});

// ========== LIVE TV ROUTES ==========
router.get('/live-tv/channels', async (req, res) => {
  try {
    const channels = await liveTvService.getAllGlobalChannels();
    res.json({
      success: true,
      total: channels.length,
      channels,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch live TV channels' });
  }
});

router.get('/live-tv/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: 'Search query required' });
    }
    const channels = await liveTvService.getAllGlobalChannels();
    const results = await liveTvService.searchChannels(query, channels);
    res.json({
      success: true,
      total: results.length,
      results,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to search live TV channels' });
  }
});

router.get('/live-tv/categories', async (req, res) => {
  try {
    const channels = await liveTvService.getAllGlobalChannels();
    const categories = liveTvService.getCategories(channels);
    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/live-tv/countries', async (req, res) => {
  try {
    const channels = await liveTvService.getAllGlobalChannels();
    const countries = liveTvService.getCountries(channels);
    res.json({
      success: true,
      countries,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
});

router.get('/live-tv/category/:category', async (req, res) => {
  try {
    const category = req.params.category as string;
    const channels = await liveTvService.getAllGlobalChannels();
    const results = await liveTvService.getChannelsByCategory(category, channels);
    res.json({
      success: true,
      total: results.length,
      results,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch channels by category' });
  }
});

export default router;
