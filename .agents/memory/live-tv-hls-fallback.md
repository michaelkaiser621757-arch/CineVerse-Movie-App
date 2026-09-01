---
name: Live TV HLS fallback
description: Playback constraint for the CineVerse web app when an HLS helper dependency is unavailable.
---

Prefer the browser's native video element for authorized HTTPS HLS streams when the workspace cannot install an HLS helper package. Keep the player honest about browser/stream support and provide a retry/source action instead of silently proxying or transforming media.

**Why:** The workspace package registry rejected the HLS helper install, and server-side stream proxying would add unnecessary operational and rights risk.

**How to apply:** If a future HLS dependency becomes available, add it as a progressive enhancement with native fallback. Do not use the player to relay unlicensed movie or series sources.