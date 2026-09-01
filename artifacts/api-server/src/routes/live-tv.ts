import { Router, type IRouter } from "express";
import {
  ListLiveTvChannelsQueryParams,
  ListLiveTvChannelsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const PLAYLIST_URL = "https://iptv-org.github.io/iptv/index.m3u";
const CACHE_TTL_MS = 10 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 20_000;

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

let playlistCache: PlaylistCache | null = null;

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

async function getPlaylistChannels(): Promise<PlaylistCache> {
  if (playlistCache && playlistCache.expiresAt > Date.now()) return playlistCache;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(PLAYLIST_URL, {
      headers: { Accept: "audio/x-mpegurl, application/x-mpegurl, text/plain" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Playlist request failed with status ${response.status}`);
    const channels = parsePlaylist(await response.text());
    if (!channels.length) throw new Error("Playlist returned no supported HTTPS HLS channels");

    playlistCache = {
      channels,
      fetchedAt: new Date().toISOString(),
      expiresAt: Date.now() + CACHE_TTL_MS,
    };
    return playlistCache;
  } finally {
    clearTimeout(timeout);
  }
}

router.get("/live-tv/channels", async (req, res): Promise<void> => {
  const parsed = ListLiveTvChannelsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const { channels: allChannels, fetchedAt } = await getPlaylistChannels();
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