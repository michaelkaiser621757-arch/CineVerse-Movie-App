# CineVerse global integrations guide

This guide documents the public sources and the safe integration boundaries used
by CineVerse. A public GitHub playlist is not, by itself, proof that every
channel or stream is licensed for every country. Keep a rights-cleared allowlist
for production distribution.

## 1. GitHub sources worth evaluating

### Live TV and channel metadata

- [iptv-org/iptv](https://github.com/iptv-org/iptv) — publicly available IPTV
  channel playlists, including country and category playlists.
- [iptv-org/api](https://github.com/iptv-org/api) — generated channel metadata
  and country/language data.
- [iptv-org/database](https://github.com/iptv-org/database) — editable channel
  metadata used by the project.
- [iptv-org/epg](https://github.com/iptv-org/epg) — EPG download and processing
  utilities.

The playlist endpoints used by this app are:

```text
https://iptv-org.github.io/iptv/index.m3u
https://iptv-org.github.io/iptv/countries/bd.m3u
https://iptv-org.github.io/iptv/countries/in.m3u
https://iptv-org.github.io/iptv/countries/us.m3u
```

The API server accepts only HTTPS HLS URLs, filters clearly blocked categories,
and caches each playlist for ten minutes. The country selector uses ISO
3166-1 alpha-2 codes.

### Movies, series, and anime metadata

- [TMDB API](https://developer.themoviedb.org/reference/intro) — current
  CineVerse movie/series catalog, genres, languages, countries, trailers, and
  watch-provider links.
- [AniList GraphQL API](https://anilist.gitbook.io/anilist-apiv2-docs/) — a
  useful no-key anime metadata source for a future dedicated anime rail.
- [Jikan API](https://docs.api.jikan.moe/) — an unofficial MyAnimeList
  read-only API; use rate limits and attribution, and do not treat it as an
  official MAL integration.

### General public API directories

- [public-apis/public-apis](https://github.com/public-apis/public-apis) —
  community-curated public APIs.
- [open-free-llm-api/awesome-freellm-apis](https://github.com/open-free-llm-api/awesome-freellm-apis) —
  a catalog of free-tier LLM providers and setup examples.

These directories are discovery lists, not guarantees of uptime, privacy,
licensing, or a free quota. Never copy an API key from a repository into source
code. Put provider secrets in Replit Secrets and call providers from the API
server.

## 2. Live TV failure recovery and logos

There are two different failure classes:

1. **Playlist staleness:** the GitHub playlist changed. Refresh the cached M3U
   and rebuild the filtered channel list.
2. **Stream failure:** a specific broadcaster URL is offline, geo-blocked,
   CORS-restricted, or incompatible with the current browser. No directory can
   guarantee that the broadcaster endpoint is online.

The current implementation handles the first class with per-country caching.
For a production health monitor, use a bounded background job rather than
probing thousands of streams during a user request:

```ts
// Pseudocode: run on a schedule for a rights-cleared allowlist only.
for (const channel of allowlistedChannels) {
  const result = await probe(channel.streamUrl, {
    timeoutMs: 5000,
    maxConcurrent: 12,
  });
  await saveHealth(channel.id, {
    reachable: result.ok,
    checkedAt: new Date().toISOString(),
  });
}
```

Do not silently replace a broadcaster URL with an unknown mirror. Show the
last-checked state, retry the source, and let an operator remove stale entries.

The `tvg-logo` attribute in iptv-org entries is the channel's declared logo
source. CineVerse now loads those logos through:

```text
/api/live-tv/logo?url=<encoded-known-playlist-logo-url>
```

The server only proxies URLs observed in a loaded iptv-org playlist, requires
HTTPS, caps the image at 512 KB, caches successful images for one hour, and
returns a transparent fallback for 403/offline/invalid images. This avoids
breaking the grid when a third-party logo host rejects browser requests.

Useful metadata endpoint:

```text
https://iptv-org.github.io/api/channels.json
```

For a branded production catalog, prefer storing approved logo URLs in your own
database or object storage after checking the broadcaster's usage terms.

## 3. Social login

The app now uses Replit-managed Clerk:

- `@clerk/react` wraps the web app.
- `/sign-in/*?` and `/sign-up/*?` are dedicated OAuth-compatible routes.
- Clerk session cookies are used for browser API calls; no bearer token is
  manually added on the web.
- The Express server mounts Clerk middleware and the production frontend API
  proxy before `/api`.
- The branded UI uses `public/logo.svg` and the CineVerse dark theme.

To enable Google:

1. Open the workspace Auth pane.
2. Open the Configure tab.
3. Enable Google under social login providers.
4. Use Replit's shared credentials for a quick start, or add your own OAuth
   credentials if you need your own consent-screen branding.

The current Replit-managed Clerk documentation does **not** list Facebook as a
supported social login provider. Therefore the default Clerk UI correctly
shows only providers enabled by Clerk, and the current preview shows Google.
Adding a fake `oauth_facebook` button would produce a broken login flow. A real
Facebook login requires moving the auth layer to a provider that supports
Facebook OAuth and replacing the Clerk architecture, or waiting for a supported
Clerk provider path.

## 4. Global content data model

The runtime TMDB response already exposes normalized `genres`, `language`,
`country`, dates, ratings, and provider links. If CineVerse later needs its own
persistent catalog, keep localized and many-to-many data normalized:

```text
media_items
  id, external_id, media_type, title, overview, original_language,
  release_date, rating, popularity, poster_path, backdrop_path

genres
  id, slug, default_name

media_genres
  media_id, genre_id

countries
  code, name

media_countries
  media_id, country_code, role

languages
  code, english_name, native_name

media_translations
  media_id, language_code, title, overview

providers
  id, slug, name, kind

availability
  media_id, provider_id, country_code, access_kind, url, checked_at
```

Recommended query contract:

```text
GET /api/catalog/discover
  ?type=movie
  &country=BD
  &language=bn
  &genre=18
  &sort=popular
  &page=1
```

Country and language filters are already wired to TMDB's discovery endpoint.
Search-by-title remains a separate multi-search operation because TMDB does not
apply discovery filters to that endpoint.

When adding a persistent Drizzle schema, use ISO codes and external IDs as
stable keys, add unique constraints on `(media_id, genre_id)` and
`(media_id, country_code)`, and cache provider availability by country. Do not
store media bytes or copied stream files in PostgreSQL.