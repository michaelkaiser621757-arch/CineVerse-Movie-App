import { AlertTriangle, LoaderCircle, Radio, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { LiveTvChannel } from "@workspace/api-client-react";

type PlayerStatus = "loading" | "playing" | "error";

export function LiveTvPlayer({ channel, onClose }: { channel: LiveTvChannel; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<PlayerStatus>("loading");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    setStatus("loading");
    video.load();
    void video.play().catch(() => {
      // Browsers can block autoplay; the native controls remain available.
    });
    return () => {
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [channel.streamUrl]);

  const retry = () => {
    const video = videoRef.current;
    if (!video) return;
    setStatus("loading");
    video.load();
    void video.play().catch(() => {
      // The user can use the play control if autoplay is blocked.
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#05070c]/90 px-3 py-6 backdrop-blur-md sm:px-6 sm:py-10" role="dialog" aria-modal="true" aria-label={`${channel.name} live player`} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-white/[.1] bg-card shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between border-b border-white/[.08] px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Radio size={17} /></span>
            <div className="min-w-0"><p className="truncate font-display text-base font-bold">{channel.name}</p><p className="font-mono-cine text-[9px] uppercase tracking-[.15em] text-muted-foreground">Live signal · {channel.category}</p></div>
          </div>
          <button type="button" data-testid="button-close-live-player" aria-label="Close live player" onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-full bg-white/[.06] text-muted-foreground transition hover:bg-white/[.12] hover:text-foreground"><X size={18} /></button>
        </div>
        <div className="relative aspect-video bg-black">
          <video
            ref={videoRef}
            src={channel.streamUrl}
            className="size-full object-contain"
            controls
            autoPlay
            playsInline
            preload="metadata"
            onLoadedMetadata={() => setStatus("playing")}
            onPlaying={() => setStatus("playing")}
            onError={() => setStatus("error")}
          />
          {status === "loading" && <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/40"><div className="flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-xs text-white"><LoaderCircle size={15} className="animate-spin text-primary" /> Connecting to live signal…</div></div>}
          {status === "error" && <div className="absolute inset-0 grid place-items-center bg-black/80 p-6 text-center"><div><AlertTriangle className="mx-auto text-primary" size={24} /><p className="mt-3 font-display text-lg font-bold">This channel is unavailable</p><p className="mt-2 max-w-sm text-xs leading-5 text-muted-foreground">The stream may be offline or this browser may not support this HLS format.</p><div className="mt-5 flex flex-wrap justify-center gap-2"><button type="button" data-testid="button-retry-live-player" onClick={retry} className="rounded-lg bg-primary px-4 py-2.5 text-xs font-extrabold text-primary-foreground">Try again</button><a href={channel.streamUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-white/15 px-4 py-2.5 text-xs font-bold text-foreground hover:bg-white/[.08]">Open source</a></div></div></div>}
        </div>
        <div className="flex flex-col gap-2 border-t border-white/[.08] px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6"><span>Live HLS playback via the channel operator’s public stream.</span><span className="font-mono-cine text-[9px] uppercase tracking-[.12em] text-primary">HTTPS / HLS</span></div>
      </div>
    </div>
  );
}