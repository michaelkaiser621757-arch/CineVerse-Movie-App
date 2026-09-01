import { Bookmark, Check, Play, Star } from "lucide-react";
import type { Media } from "@workspace/api-client-react";

const IMAGE_BASE = "https://image.tmdb.org/t/p/";

export function mediaImage(path: string | null, size = "w500") {
  return path ? `${IMAGE_BASE}${size}${path}` : null;
}

function year(date: string | null) {
  return date ? new Date(date).getFullYear() : "—";
}

export function MediaCard({ media, saved, onSave, onOpen, index = 0 }: { media: Media; saved: boolean; onSave: () => void; onOpen: () => void; index?: number }) {
  const poster = mediaImage(media.posterPath);
  return (
    <article className="group w-[148px] shrink-0 sm:w-[174px] lg:w-[190px] reveal-up" style={{ animationDelay: `${Math.min(index * 45, 320)}ms` }} data-testid={`card-media-${media.id}`}>
      <div className="poster-shine relative aspect-[2/3] overflow-hidden rounded-xl border border-white/[.08] bg-card shadow-lg shadow-black/20">
        {poster ? <img src={poster} alt={`${media.title} poster`} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.045]" /> : <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_30%_20%,hsl(var(--accent)/.22),transparent_40%),hsl(var(--card))] p-4 text-center font-display text-sm text-muted-foreground">{media.title}</div>}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070a11]/95 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <button type="button" data-testid={`button-open-media-${media.id}`} aria-label={`Open ${media.title}`} onClick={onOpen} className="absolute inset-x-3 bottom-3 flex translate-y-3 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-xs font-extrabold text-primary-foreground opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 focus:translate-y-0 focus:opacity-100">
          <Play size={13} fill="currentColor" /> Details
        </button>
        <button type="button" data-testid={`button-save-media-${media.id}`} aria-label={saved ? `Remove ${media.title} from list` : `Save ${media.title} to list`} onClick={onSave} className={`absolute right-2 top-2 grid size-8 place-items-center rounded-full border backdrop-blur-md transition ${saved ? "border-primary/60 bg-primary text-primary-foreground" : "border-white/20 bg-[#070a11]/55 text-foreground opacity-0 group-hover:opacity-100 focus:opacity-100"}`}>
          {saved ? <Check size={15} /> : <Bookmark size={15} />}
        </button>
        <span className="absolute left-2 top-2 rounded bg-[#070a11]/65 px-1.5 py-1 font-mono-cine text-[9px] uppercase tracking-wider text-white/75 backdrop-blur-md">{media.mediaType}</span>
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-[13px] font-bold tracking-[-.01em] text-foreground" data-testid={`text-title-${media.id}`}>{media.title}</h3>
          <p className="mt-1 text-[11px] text-muted-foreground">{year(media.releaseDate)} <span className="mx-1 text-white/20">/</span> {media.genres?.[0] ?? "Feature"}</p>
        </div>
        <span className="flex shrink-0 items-center gap-1 pt-0.5 font-mono-cine text-[10px] text-primary"><Star size={11} fill="currentColor" /> {media.rating.toFixed(1)}</span>
      </div>
    </article>
  );
}