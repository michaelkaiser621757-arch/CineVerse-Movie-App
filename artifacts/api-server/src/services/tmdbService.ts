import axios from 'axios';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  original_language: string;
}

interface TMDBSeries {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  vote_average: number;
  original_language: string;
}

export const tmdbService = {
  // ========== MOVIES ==========
  async getPopularMovies(page = 1, language = 'en-US') {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
        params: {
          api_key: TMDB_API_KEY,
          page,
          language,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching popular movies:', error);
      throw error;
    }
  },

  async getTrendingMovies(timeWindow = 'week', page = 1) {
    try {
      const response = await axios.get(
        `${TMDB_BASE_URL}/trending/movie/${timeWindow}`,
        {
          params: {
            api_key: TMDB_API_KEY,
            page,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching trending movies:', error);
      throw error;
    }
  },

  async getTopRatedMovies(page = 1, language = 'en-US') {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/movie/top_rated`, {
        params: {
          api_key: TMDB_API_KEY,
          page,
          language,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top rated movies:', error);
      throw error;
    }
  },

  async getUpcomingMovies(page = 1, language = 'en-US') {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/movie/upcoming`, {
        params: {
          api_key: TMDB_API_KEY,
          page,
          language,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming movies:', error);
      throw error;
    }
  },

  async searchMovies(query: string, page = 1, language = 'en-US') {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
        params: {
          api_key: TMDB_API_KEY,
          query,
          page,
          language,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching movies:', error);
      throw error;
    }
  },

  async getMovieDetails(movieId: number, language = 'en-US') {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
        params: {
          api_key: TMDB_API_KEY,
          language,
          append_to_response: 'videos,credits,similar,providers',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching movie details:', error);
      throw error;
    }
  },

  // ========== TV SERIES ==========
  async getPopularSeries(page = 1, language = 'en-US') {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/tv/popular`, {
        params: {
          api_key: TMDB_API_KEY,
          page,
          language,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching popular series:', error);
      throw error;
    }
  },

  async getTrendingSeries(timeWindow = 'week', page = 1) {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/trending/tv/${timeWindow}`, {
        params: {
          api_key: TMDB_API_KEY,
          page,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching trending series:', error);
      throw error;
    }
  },

  async getTopRatedSeries(page = 1, language = 'en-US') {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/tv/top_rated`, {
        params: {
          api_key: TMDB_API_KEY,
          page,
          language,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top rated series:', error);
      throw error;
    }
  },

  async searchSeries(query: string, page = 1, language = 'en-US') {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/search/tv`, {
        params: {
          api_key: TMDB_API_KEY,
          query,
          page,
          language,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching series:', error);
      throw error;
    }
  },

  async getSeriesDetails(seriesId: number, language = 'en-US') {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/tv/${seriesId}`, {
        params: {
          api_key: TMDB_API_KEY,
          language,
          append_to_response: 'videos,credits,similar,providers',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching series details:', error);
      throw error;
    }
  },

  // ========== ANIME (Filtered from TMDB) ==========
  async getPopularAnime(page = 1, language = 'en-US') {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/discover/tv`, {
        params: {
          api_key: TMDB_API_KEY,
          with_genres: '16', // Animation genre
          with_origin_country: 'JP', // Japan
          page,
          language,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching popular anime:', error);
      throw error;
    }
  },

  async searchAnime(query: string, page = 1, language = 'en-US') {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/search/tv`, {
        params: {
          api_key: TMDB_API_KEY,
          query,
          page,
          language,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching anime:', error);
      throw error;
    }
  },

  async getImageUrl(imagePath: string, size = 'w500') {
    return `https://image.tmdb.org/t/p/${size}${imagePath}`;
  },
};

export default tmdbService;
