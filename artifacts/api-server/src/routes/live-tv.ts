import { Router, type IRouter } from "express";
import {
  ListLiveTvChannelsQueryParams,
  ListLiveTvChannelsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const PLAYLIST_URL = "https://iptv-org.github.io/iptv/index.m3u";
const COUNTRY_PLAYLIST_URL = "https://iptv-org.github.io/iptv/countries";
const CACHE_TTL_MS = 10 * 60 * 1000;
const LOGO_CACHE_TTL_MS = 60 * 60 * 1000;
const MAX_LOGO_BYTES = 512 * 1024;
const REQUEST_TIMEOUT_MS = 20_000;
const EMPTY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

type LiveTvChannel = {
  id: string;
  name: string;
  category: string;
  streamUrl: string;
  logoUrl: string | null;
  tvgId: string | null;
};

type PlaylistCache = {
  channels: LiveTvChannel[];
  fetchedAt: string;
  expiresAt: number;
};

const playlistCaches = new Map<string, PlaylistCache>();
const knownLogoUrls = new Set<string>();
const logoCache = new Map<string, { body: Buffer; contentType: string; expiresAt: number }>();

function attribute(line: string, name: string): string | null {
  const match = line.match(new RegExp(`${name}="([^"]*)"`, "i"));
  return match?.[1]?.trim() || null;
}

function channelId(name: string, tvgId: string | null, streamUrl: string): string {
  if (tvgId) return tvgId;
  try {
    return `${name}-${new URL(streamUrl).hostname}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  } catch {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
}

function parsePlaylist(raw: string): LiveTvChannel[] {
  const channels: LiveTvChannel[] = [];
  let pending: Omit<LiveTvChannel, "streamUrl" | "id"> | null = null;

  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith("#EXTINF")) {
      const commaIndex = line.indexOf(",");
      const name = commaIndex >= 0 ? line.slice(commaIndex + 1).trim() : "Untitled channel";
      const group = attribute(line, "group-title")?.split(";")[0]?.trim();
      pending = {
        name: name || "Untitled channel",
        category: group || "General",
        logoUrl: attribute(line, "tvg-logo"),
        tvgId: attribute(line, "tvg-id"),
      };
      continue;
    }

    if (!pending || line.startsWith("#")) continue;
    pending = (() => {
      const entry = pending;
      try {
        const url = new URL(line);
        const isHttpsHls = url.protocol === "https:" && /\.m3u8(?:$|\/|\?)/i.test(`${url.pathname}${url.search}`);
        const category = entry.category.toLowerCase();
        const blockedCategory = ["adult", "xxx", "porn", "movie", "series"].some((word) => category.includes(word));
        const isIpAddress = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(url.hostname);
        if (!isHttpsHls || blockedCategory || isIpAddress) return null;

        channels.push({
          ...entry,
          id: channelId(entry.name, entry.tvgId, url.toString()),
          streamUrl: url.toString(),
        });
      } catch {
        // Ignore malformed playlist entries rather than exposing broken cards.
      }
      return null;
    })();
  }

  return channels;
}

async function getPlaylistChannels(country?: string): Promise<PlaylistCache> {
  const cacheKey = country || "all";
  const cached = playlistCaches.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached;
  const playlistUrl = country ? `${COUNTRY_PLAYLIST_URL}/${country}.m3u` : PLAYLIST_URL;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(playlistUrl, {
      headers: { Accept: "audio/x-mpegurl, application/x-mpegurl, text/plain" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Playlist request failed with status ${response.status}`);
    const channels = parsePlaylist(await response.text());
    if (!channels.length) throw new Error("Playlist returned no supported HTTPS HLS channels");
    for (const channel of channels) {
      if (channel.logoUrl) knownLogoUrls.add(channel.logoUrl);
    }

    const nextCache: PlaylistCache = {
      channels,
      fetchedAt: new Date().toISOString(),
      expiresAt: Date.now() + CACHE_TTL_MS,
    };
    playlistCaches.set(cacheKey, nextCache);
    return nextCache;
  } finally {
    clearTimeout(timeout);
  }
}

router.get("/live-tv/logo", async (req, res): Promise<void> => {
  const rawUrl = typeof req.query.url === "string" ? req.query.url : "";
  if (!knownLogoUrls.has(rawUrl)) {
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.type("png").send(EMPTY_PNG);
    return;
  }

  const cached = logoCache.get(rawUrl);
  if (cached && cached.expiresAt > Date.now()) {
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.type(cached.contentType).send(cached.body);
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const logoUrl = new URL(rawUrl);
    if (logoUrl.protocol !== "https:") {
      res.type("png").send(EMPTY_PNG);
      return;
    }

    const response = await fetch(logoUrl, {
      headers: { Accept: "image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8" },
      signal: controller.signal,
    });
    const contentType = response.headers.get("content-type")?.split(";")[0] || "";
    const contentLength = Number(response.headers.get("content-length") || 0);
    if (!response.ok || !contentType.startsWith("image/") || contentLength > MAX_LOGO_BYTES) {
      res.setHeader("Cache-Control", "public, max-age=900");
      res.type("png").send(EMPTY_PNG);
      return;
    }

    const body = Buffer.from(await response.arrayBuffer());
    if (body.length > MAX_LOGO_BYTES) {
      res.setHeader("Cache-Control", "public, max-age=900");
      res.type("png").send(EMPTY_PNG);
      return;
    }

    logoCache.set(rawUrl, {
      body,
      contentType,
      expiresAt: Date.now() + LOGO_CACHE_TTL_MS,
    });
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.type(contentType).send(body);
  } catch (error) {
    req.log.debug({ err: error, logoUrl: rawUrl }, "Live TV logo unavailable");
    res.setHeader("Cache-Control", "public, max-age=900");
    res.type("png").send(EMPTY_PNG);
  } finally {
    clearTimeout(timeout);
  }
});

router.get("/live-tv/channels", async (req, res): Promise<void> => {
  const parsed = ListLiveTvChannelsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const { country } = parsed.data;
    const { channels: allChannels, fetchedAt } = await getPlaylistChannels(country?.toLowerCase());
    const query = parsed.data.query?.toLowerCase();
    const category = parsed.data.category?.toLowerCase();
    const filtered = allChannels.filter((channel) => {
      const matchesQuery = !query || `${channel.name} ${channel.category} ${channel.tvgId ?? ""}`.toLowerCase().includes(query);
      const matchesCategory = !category || channel.category.toLowerCase() === category;
      return matchesQuery && matchesCategory;
    });
    const categories = [...new Set(allChannels.map((channel) => channel.category))].sort((a, b) => a.localeCompare(b));

    res.json(ListLiveTvChannelsResponse.parse({
      source: "iptv-org public playlist",
      fetchedAt,
      total: filtered.length,
      categories,
      channels: filtered.slice(0, parsed.data.limit),
    }));
  } catch (error) {
    req.log.error({ err: error }, "Failed to load live TV playlist");
    res.status(503).json({ error: "Live TV channels are temporarily unavailable." });
  }
});

export default router;