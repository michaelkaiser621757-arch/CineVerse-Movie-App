import axios from 'axios';

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

interface Anime {
  mal_id: number;
  title: string;
  title_english: string;
  synopsis: string;
  images: {
    jpg: {
      image_url: string;
      large_image_url: string;
    };
  };
  aired: {
    from: string;
    to: string;
  };
  score: number;
  episodes: number;
  status: string;
  type: string;
  airing: boolean;
}

export const jikanService = {
  // ========== TRENDING ANIME ==========
  async getTrendingAnime(page = 1, limit = 25) {
    try {
      const response = await axios.get(`${JIKAN_BASE_URL}/top/anime`, {
        params: {
          page,
          limit,
          type: 'tv',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching trending anime:', error);
      throw error;
    }
  },

  async getTopAnime(filter = 'airing', page = 1, limit = 25) {
    try {
      const response = await axios.get(`${JIKAN_BASE_URL}/top/anime`, {
        params: {
          page,
          limit,
          filter,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top anime:', error);
      throw error;
    }
  },

  // ========== SEARCH ANIME ==========
  async searchAnime(query: string, page = 1, limit = 25) {
    try {
      const response = await axios.get(`${JIKAN_BASE_URL}/anime`, {
        params: {
          query,
          page,
          limit,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching anime:', error);
      throw error;
    }
  },

  // ========== ANIME DETAILS ==========
  async getAnimeDetails(animeId: number) {
    try {
      const response = await axios.get(`${JIKAN_BASE_URL}/anime/${animeId}`, {
        params: {
          fields: 'mal_id,url,images,title,title_english,title_japanese,title_synonyms,type,source,episodes,status,airing,aired,duration,rating,score,scored_by,rank,popularity,members,favorites,synopsis,background,genres,explicit_genres,themes,demographics,studios,producers,licensors',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching anime details:', error);
      throw error;
    }
  },

  // ========== ANIME CHARACTERS & VOICE ACTORS ==========
  async getAnimeCharacters(animeId: number) {
    try {
      const response = await axios.get(`${JIKAN_BASE_URL}/anime/${animeId}/characters`);
      return response.data;
    } catch (error) {
      console.error('Error fetching anime characters:', error);
      throw error;
    }
  },

  // ========== ANIME EPISODES ==========
  async getAnimeEpisodes(animeId: number, page = 1) {
    try {
      const response = await axios.get(`${JIKAN_BASE_URL}/anime/${animeId}/episodes`, {
        params: {
          page,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching anime episodes:', error);
      throw error;
    }
  },

  // ========== ANIME BY GENRE ==========
  async getAnimeByGenre(genreId: number, page = 1, limit = 25) {
    try {
      const response = await axios.get(`${JIKAN_BASE_URL}/genres/anime/${genreId}`, {
        params: {
          page,
          limit,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching anime by genre:', error);
      throw error;
    }
  },

  // ========== ANIME SEASONS ==========
  async getAnimeSeason(year: number, season: 'winter' | 'spring' | 'summer' | 'fall', page = 1) {
    try {
      const response = await axios.get(
        `${JIKAN_BASE_URL}/seasons/${year}/${season}`,
        {
          params: {
            page,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching anime season:', error);
      throw error;
    }
  },

  // ========== RECOMMENDATIONS ==========
  async getAnimeRecommendations(animeId: number) {
    try {
      const response = await axios.get(`${JIKAN_BASE_URL}/anime/${animeId}/recommendations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching anime recommendations:', error);
      throw error;
    }
  },

  // ========== GENRES LIST ==========
  async getGenres() {
    try {
      const response = await axios.get(`${JIKAN_BASE_URL}/genres/anime`);
      return response.data;
    } catch (error) {
      console.error('Error fetching genres:', error);
      throw error;
    }
  },
};

export default jikanService;
