import axios from 'axios';

const ANILIST_API_URL = 'https://graphql.anilist.co';

interface AniListAnime {
  id: number;
  title: {
    romaji: string;
    english: string;
    native: string;
  };
  description: string;
  coverImage: {
    large: string;
    extraLarge: string;
  };
  bannerImage: string;
  status: string;
  episodes: number;
  nextAiringEpisode?: {
    airingAt: number;
    timeUntilAiring: number;
    episode: number;
  };
  startDate: {
    year: number;
    month: number;
    day: number;
  };
  endDate: {
    year: number;
    month: number;
    day: number;
  };
  season: string;
  seasonYear: number;
  genres: string[];
  averageScore: number;
  popularity: number;
  source: string;
  studios: {
    nodes: Array<{ id: number; name: string }>;
  };
  characters: {
    nodes: any[];
  };
  recommendations: {
    nodes: any[];
  };
}

export const anilistService = {
  // ========== SEARCH ANIME ==========
  async searchAnime(query: string, page = 1, perPage = 20) {
    try {
      const graphqlQuery = `
        query SearchAnime($search: String, $page: Int, $perPage: Int) {
          Page(page: $page, perPage: $perPage) {
            pageInfo {
              total
              currentPage
              lastPage
              hasNextPage
              perPage
            }
            media(search: $search, type: ANIME) {
              id
              title {
                romaji
                english
                native
              }
              description
              coverImage {
                large
                extraLarge
              }
              bannerImage
              status
              episodes
              startDate {
                year
                month
                day
              }
              endDate {
                year
                month
                day
              }
              season
              seasonYear
              genres
              averageScore
              popularity
              source
              studios {
                nodes {
                  id
                  name
                }
              }
            }
          }
        }
      `;

      const response = await axios.post(ANILIST_API_URL, {
        query: graphqlQuery,
        variables: {
          search: query,
          page,
          perPage,
        },
      });

      return response.data.data;
    } catch (error) {
      console.error('Error searching anime on AniList:', error);
      throw error;
    }
  },

  // ========== GET TRENDING ANIME ==========
  async getTrendingAnime(page = 1, perPage = 20) {
    try {
      const graphqlQuery = `
        query TrendingAnime($page: Int, $perPage: Int) {
          Page(page: $page, perPage: $perPage) {
            pageInfo {
              total
              currentPage
              lastPage
              hasNextPage
            }
            media(sort: TRENDING_DESC, type: ANIME) {
              id
              title {
                romaji
                english
                native
              }
              description
              coverImage {
                large
                extraLarge
              }
              bannerImage
              status
              episodes
              startDate {
                year
                month
                day
              }
              seasonYear
              genres
              averageScore
              popularity
              studios {
                nodes {
                  id
                  name
                }
              }
            }
          }
        }
      `;

      const response = await axios.post(ANILIST_API_URL, {
        query: graphqlQuery,
        variables: {
          page,
          perPage,
        },
      });

      return response.data.data;
    } catch (error) {
      console.error('Error fetching trending anime from AniList:', error);
      throw error;
    }
  },

  // ========== GET POPULAR ANIME ==========
  async getPopularAnime(page = 1, perPage = 20) {
    try {
      const graphqlQuery = `
        query PopularAnime($page: Int, $perPage: Int) {
          Page(page: $page, perPage: $perPage) {
            pageInfo {
              total
              currentPage
              lastPage
              hasNextPage
            }
            media(sort: POPULARITY_DESC, type: ANIME) {
              id
              title {
                romaji
                english
                native
              }
              description
              coverImage {
                large
                extraLarge
              }
              bannerImage
              status
              episodes
              genres
              averageScore
              popularity
              studios {
                nodes {
                  id
                  name
                }
              }
            }
          }
        }
      `;

      const response = await axios.post(ANILIST_API_URL, {
        query: graphqlQuery,
        variables: {
          page,
          perPage,
        },
      });

      return response.data.data;
    } catch (error) {
      console.error('Error fetching popular anime from AniList:', error);
      throw error;
    }
  },

  // ========== GET TOP RATED ANIME ==========
  async getTopRatedAnime(page = 1, perPage = 20) {
    try {
      const graphqlQuery = `
        query TopRatedAnime($page: Int, $perPage: Int) {
          Page(page: $page, perPage: $perPage) {
            media(sort: SCORE_DESC, type: ANIME) {
              id
              title {
                romaji
                english
                native
              }
              coverImage {
                large
                extraLarge
              }
              bannerImage
              averageScore
              popularity
              episodes
              genres
            }
          }
        }
      `;

      const response = await axios.post(ANILIST_API_URL, {
        query: graphqlQuery,
        variables: {
          page,
          perPage,
        },
      });

      return response.data.data;
    } catch (error) {
      console.error('Error fetching top rated anime from AniList:', error);
      throw error;
    }
  },

  // ========== GET ANIME DETAILS ==========
  async getAnimeDetails(animeId: number) {
    try {
      const graphqlQuery = `
        query GetAnimeDetails($id: Int) {
          Media(id: $id, type: ANIME) {
            id
            title {
              romaji
              english
              native
            }
            description
            coverImage {
              large
              extraLarge
            }
            bannerImage
            status
            episodes
            nextAiringEpisode {
              airingAt
              timeUntilAiring
              episode
            }
            startDate {
              year
              month
              day
            }
            endDate {
              year
              month
              day
            }
            season
            seasonYear
            genres
            averageScore
            popularity
            source
            format
            countryOfOrigin
            studios {
              nodes {
                id
                name
              }
            }
            characters(sort: ROLE) {
              nodes {
                id
                name {
                  first
                  last
                }
                image {
                  large
                }
              }
            }
            recommendations(sort: RATING_DESC) {
              nodes {
                mediaRecommendation {
                  id
                  title {
                    romaji
                  }
                  coverImage {
                    large
                  }
                }
              }
            }
          }
        }
      `;

      const response = await axios.post(ANILIST_API_URL, {
        query: graphqlQuery,
        variables: {
          id: animeId,
        },
      });

      return response.data.data;
    } catch (error) {
      console.error('Error fetching anime details from AniList:', error);
      throw error;
    }
  },

  // ========== GET ANIME BY GENRE ==========
  async getAnimeByGenre(genre: string, page = 1, perPage = 20) {
    try {
      const graphqlQuery = `
        query AnimeByGenre($genre: String, $page: Int, $perPage: Int) {
          Page(page: $page, perPage: $perPage) {
            media(genre: $genre, type: ANIME, sort: POPULARITY_DESC) {
              id
              title {
                romaji
                english
              }
              coverImage {
                large
                extraLarge
              }
              bannerImage
              averageScore
              genres
            }
          }
        }
      `;

      const response = await axios.post(ANILIST_API_URL, {
        query: graphqlQuery,
        variables: {
          genre,
          page,
          perPage,
        },
      });

      return response.data.data;
    } catch (error) {
      console.error('Error fetching anime by genre from AniList:', error);
      throw error;
    }
  },

  // ========== GET ANIME BY SEASON ==========
  async getAnimeBySeason(year: number, season: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL', page = 1, perPage = 20) {
    try {
      const graphqlQuery = `
        query AnimeBySeason($year: Int, $season: MediaSeason, $page: Int, $perPage: Int) {
          Page(page: $page, perPage: $perPage) {
            media(seasonYear: $year, season: $season, type: ANIME, sort: POPULARITY_DESC) {
              id
              title {
                romaji
                english
                native
              }
              coverImage {
                large
                extraLarge
              }
              status
              episodes
              averageScore
              genres
            }
          }
        }
      `;

      const response = await axios.post(ANILIST_API_URL, {
        query: graphqlQuery,
        variables: {
          year,
          season,
          page,
          perPage,
        },
      });

      return response.data.data;
    } catch (error) {
      console.error('Error fetching anime by season from AniList:', error);
      throw error;
    }
  },

  // ========== GET AIRING SCHEDULE ==========
  async getAiringSchedule(page = 1, perPage = 20) {
    try {
      const graphqlQuery = `
        query AiringSchedule($page: Int, $perPage: Int) {
          Page(page: $page, perPage: $perPage) {
            airingSchedules(sort: TIME) {
              id
              episode
              airingAt
              media {
                id
                title {
                  romaji
                  english
                }
                coverImage {
                  large
                }
              }
            }
          }
        }
      `;

      const response = await axios.post(ANILIST_API_URL, {
        query: graphqlQuery,
        variables: {
          page,
          perPage,
        },
      });

      return response.data.data;
    } catch (error) {
      console.error('Error fetching airing schedule from AniList:', error);
      throw error;
    }
  },
};

export default anilistService;
