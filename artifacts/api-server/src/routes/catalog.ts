import { Router, type IRouter } from "express";
import {
  DiscoverCatalogQueryParams,
  DiscoverCatalogResponse,
  GetCatalogHomeQueryParams,
  GetCatalogHomeResponse,
  GetCatalogMediaParams,
  GetCatalogMediaResponse,
  GetCatalogTrailerParams,
  GetCatalogTrailerResponse,
  GetCatalogWatchProvidersParams,
  GetCatalogWatchProvidersResponse,
  SearchCatalogQueryParams,
  SearchCatalogResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

type MediaType = "movie" | "tv";

type TmdbResult = {
  id: number;
  media_type?: MediaType;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  popularity?: number;
  genre_ids?: number[];
};

type TmdbResponse = {
  page?: number;
  total_pages?: number;
  total_results?: number;
  results?: TmdbResult[];
};

const GENRE_NAMES: Record<number, string> = {
  12: "Adventure",
  14: "Fantasy",
  16: "Animation",
  18: "Drama",
  27: "Horror",
  28: "Action",
  35: "Comedy",
  36: "History",
  37: "Western",
  53: "Thriller",
  80: "Crime",
  99: "Documentary",
  878: "Science Fiction",
  9648: "Mystery",
  10402: "Music",
  10749: "Romance",
  10751: "Family",
  10752: "War",
  10759: "Action & Adventure",
  10762: "Kids",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
};

function requireApiKey(): string {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error("TMDB_API_KEY is not configured");
  }
  return apiKey;
}

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const query = new URLSearchParams({ api_key: requireApiKey(), ...params });
  const response = await fetch(`${TMDB_BASE_URL}${path}?${query.toString()}`);
  if (!response.ok) {
    throw new Error(`TMDB request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function mediaFromResult(result: TmdbResult, type: MediaType): {
  id: number;
  mediaType: MediaType;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  rating: number;
  popularity: number;
  genres: string[];
} {
  return {
    id: result.id,
    mediaType: result.media_type ?? type,
    title: result.title ?? result.name ?? "Untitled",
    overview: result.overview ?? "No overview available.",
    posterPath: result.poster_path ?? null,
    backdropPath: result.backdrop_path ?? null,
    releaseDate: result.release_date ?? result.first_air_date ?? null,
    rating: Number(result.vote_average ?? 0),
    popularity: Number(result.popularity ?? 0),
    genres: (result.genre_ids ?? []).map((genreId) => GENRE_NAMES[genreId] ?? `Genre ${genreId}`),
  };
}

function pageFromResponse(data: TmdbResponse, type: MediaType) {
  return {
    page: data.page ?? 1,
    totalPages: data.total_pages ?? 1,
    totalResults: data.total_results ?? 0,
    results: (data.results ?? [])
      .filter((result) => result.poster_path)
      .map((result) => mediaFromResult(result, result.media_type ?? type)),
  };
}

function tmdbPathForSort(type: MediaType, sort: string): { path: string; params?: Record<string, string> } {
  if (sort === "top-rated") {
    return { path: `/${type}/top_rated` };
  }
  if (sort === "upcoming") {
    return type === "movie"
      ? { path: "/movie/upcoming" }
      : { path: "/tv/on_the_air" };
  }
  if (sort === "popular") {
    return { path: `/${type}/popular` };
  }
  return { path: `/trending/${type}/week` };
}

function safeType(value: string | string[]): MediaType | null {
  const type = Array.isArray(value) ? value[0] : value;
  return type === "movie" || type === "tv" ? type : null;
}

router.get("/catalog/home", async (req, res): Promise<void> => {
  const parsed = GetCatalogHomeQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const type = parsed.data.type;
  try {
    const [heroData, popularData, topRatedData, trendingData] = await Promise.all([
      tmdbFetch<TmdbResponse>(`/trending/${type}/week`),
      tmdbFetch<TmdbResponse>(`/${type}/popular`),
      tmdbFetch<TmdbResponse>(`/${type}/top_rated`),
      tmdbFetch<TmdbResponse>(`/discover/${type}`, {
        sort_by: "vote_average.desc",
        "vote_count.gte": "500",
      }),
    ]);

    const response = GetCatalogHomeResponse.parse({
      hero: (heroData.results ?? [])
        .filter((item) => item.backdrop_path)
        .slice(0, 6)
        .map((item) => mediaFromResult(item, type)),
      sections: [
        {
          id: "popular",
          title: "Popular right now",
          items: (popularData.results ?? []).slice(0, 12).map((item) => mediaFromResult(item, type)),
        },
        {
          id: "top-rated",
          title: "Critically acclaimed",
          items: (topRatedData.results ?? []).slice(0, 12).map((item) => mediaFromResult(item, type)),
        },
        {
          id: "trending",
          title: "Trending this week",
          items: (trendingData.results ?? []).slice(0, 12).map((item) => mediaFromResult(item, type)),
        },
      ],
    });
    res.json(response);
  } catch (error) {
    req.log.error({ err: error }, "Failed to load TMDB home catalog");
    res.status(503).json({ error: "Movie catalog is temporarily unavailable." });
  }
});

router.get("/catalog/discover", async (req, res): Promise<void> => {
  const parsed = DiscoverCatalogQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { type, page, sort, language, country, genre, yearFrom, yearTo, ratingFrom } = parsed.data;
  const hasDiscoverFilters = Boolean(
    language || country || genre || yearFrom !== undefined || yearTo !== undefined || ratingFrom !== undefined,
  );
  const selected = hasDiscoverFilters
    ? { path: `/discover/${type}` }
    : tmdbPathForSort(type, sort);
  const params: Record<string, string> = {
    page: String(page),
  };
  if (selected.path.startsWith("/discover/")) {
    params.sort_by = sort === "top-rated"
      ? "vote_average.desc"
      : sort === "upcoming"
        ? `${type === "movie" ? "primary_release_date" : "first_air_date"}.asc`
        : "popularity.desc";
  }
  if (language) params.with_original_language = language;
  if (country) params.with_origin_country = country.toUpperCase();
  if (genre) params.with_genres = String(genre);
  if (ratingFrom !== undefined) params["vote_average.gte"] = String(ratingFrom);
  if (yearFrom !== undefined || yearTo !== undefined) {
    if (type === "movie") {
      if (yearFrom !== undefined) params["primary_release_date.gte"] = `${yearFrom}-01-01`;
      if (yearTo !== undefined) params["primary_release_date.lte"] = `${yearTo}-12-31`;
    } else {
      if (yearFrom !== undefined) params["first_air_date.gte"] = `${yearFrom}-01-01`;
      if (yearTo !== undefined) params["first_air_date.lte"] = `${yearTo}-12-31`;
    }
  }

  try {
    const data = await tmdbFetch<TmdbResponse>(selected.path, { ...selected.params, ...params });
    res.json(DiscoverCatalogResponse.parse(pageFromResponse(data, type)));
  } catch (error) {
    req.log.error({ err: error }, "Failed to discover TMDB catalog");
    res.status(503).json({ error: "Movie catalog is temporarily unavailable." });
  }
});

router.get("/catalog/search", async (req, res): Promise<void> => {
  const parsed = SearchCatalogQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const data = await tmdbFetch<TmdbResponse>("/search/multi", {
      query: parsed.data.query,
      page: String(parsed.data.page),
      include_adult: "false",
    });
    const results = (data.results ?? [])
      .filter((result) => (result.media_type === "movie" || result.media_type === "tv") && result.poster_path)
      .map((result) => mediaFromResult(result, result.media_type as MediaType));
    res.json(SearchCatalogResponse.parse({
      page: data.page ?? parsed.data.page,
      totalPages: data.total_pages ?? 1,
      totalResults: data.total_results ?? results.length,
      results,
    }));
  } catch (error) {
    req.log.error({ err: error }, "Failed to search TMDB catalog");
    res.status(503).json({ error: "Search is temporarily unavailable." });
  }
});

router.get("/catalog/media/:type/:id", async (req, res): Promise<void> => {
  const parsed = GetCatalogMediaParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { type, id } = parsed.data;
  try {
    const data = await tmdbFetch<TmdbResult & {
      runtime?: number;
      number_of_seasons?: number;
      credits?: {
        cast?: Array<{ id: number; name: string; character?: string; profile_path?: string | null }>;
        crew?: Array<{ id: number; name: string; job?: string; department?: string; profile_path?: string | null }>;
      };
      similar?: TmdbResponse;
    }>(`/${type}/${id}`, { append_to_response: "credits,similar" });
    const cast = (data.credits?.cast ?? []).slice(0, 12).map((person) => ({
      id: person.id,
      name: person.name,
      role: person.character ?? "Cast",
      profilePath: person.profile_path ?? null,
    }));
    const crew = (data.credits?.crew ?? [])
      .filter((person) => person.job === "Director" || person.department === "Directing")
      .slice(0, 6)
      .map((person) => ({
        id: person.id,
        name: person.name,
        role: person.job ?? "Crew",
        profilePath: person.profile_path ?? null,
      }));
    res.json(GetCatalogMediaResponse.parse({
      ...mediaFromResult(data, type),
      runtime: data.runtime ?? null,
      seasons: data.number_of_seasons ?? null,
      cast,
      crew,
      similar: (data.similar?.results ?? []).slice(0, 12).map((item) => mediaFromResult(item, type)),
    }));
  } catch (error) {
    req.log.error({ err: error }, "Failed to load TMDB media details");
    res.status(503).json({ error: "Title details are temporarily unavailable." });
  }
});

router.get("/catalog/media/:type/:id/trailer", async (req, res): Promise<void> => {
  const parsed = GetCatalogTrailerParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const data = await tmdbFetch<{ results?: Array<{ name?: string; key?: string; site?: string; type?: string; official?: boolean }> }>(
      `/${parsed.data.type}/${parsed.data.id}/videos`,
    );
    const trailer = (data.results ?? []).find(
      (video) => video.site === "YouTube" && (video.type === "Trailer" || video.type === "Teaser"),
    );
    res.json(GetCatalogTrailerResponse.parse({
      available: Boolean(trailer?.key),
      name: trailer?.name ?? null,
      key: trailer?.key ?? null,
      url: trailer?.key ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
    }));
  } catch (error) {
    req.log.error({ err: error }, "Failed to load TMDB trailer");
    res.status(503).json({ error: "Trailer is temporarily unavailable." });
  }
});

router.get("/catalog/media/:type/:id/watch-providers", async (req, res): Promise<void> => {
  const parsed = GetCatalogWatchProvidersParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const data = await tmdbFetch<{
      results?: Record<string, {
        link?: string;
        flatrate?: Array<{ provider_name?: string; logo_path?: string | null }>;
        rent?: Array<{ provider_name?: string; logo_path?: string | null }>;
        buy?: Array<{ provider_name?: string; logo_path?: string | null }>;
      }>;
    }>(`/${parsed.data.type}/${parsed.data.id}/watch/providers`);
    const country = data.results?.US;
    const providers = (items: Array<{ provider_name?: string; logo_path?: string | null }> = []) =>
      items.slice(0, 8).map((item) => ({
        name: item.provider_name ?? "Provider",
        logoPath: item.logo_path ?? null,
      }));
    res.json(GetCatalogWatchProvidersResponse.parse({
      country: "US",
      link: country?.link ?? null,
      flatrate: providers(country?.flatrate),
      rent: providers(country?.rent),
      buy: providers(country?.buy),
    }));
  } catch (error) {
    req.log.error({ err: error }, "Failed to load TMDB watch providers");
    res.status(503).json({ error: "Watch options are temporarily unavailable." });
  }
});

export default router;