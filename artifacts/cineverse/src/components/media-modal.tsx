import { useEffect } from "react";
import { ExternalLink, Heart, Play, Star, X } from "lucide-react";
import type { Media, MediaDetails, Trailer, WatchProviders } from "@workspace/api-client-react";
import { getGetCatalogMediaQueryKey, getGetCatalogTrailerQueryKey, getGetCatalogWatchProvidersQueryKey, useGetCatalogMedia, useGetCatalogTrailer, useGetCatalogWatchProviders } from "@workspace/api-client-react";
import { mediaImage } from "@/components/media-card";

export function MediaModal({ media, saved, onSave, onClose, onOpen }: { media: Media | null; saved: boolean; onSave: () => void; onClose: () => void; onOpen: (media: Media) => void }) {
  const type = media?.mediaType ?? "movie";
  const id = media?.id ?? 0;
  const detailsQuery = useGetCatalogMedia(type, id, { query: { enabled: Boolean(media), queryKey: getGetCatalogMediaQueryKey(type, id) } });
  const trailerQuery = useGetCatalogTrailer(type, id, { query: { enabled: Boolean(media), queryKey: getGetCatalogTrailerQueryKey(type, id) } });
  const providerQuery = useGetCatalogWatchProviders(type, id, { query: { enabled: Boolean(media), queryKey: getGetCatalogWatchProvidersQueryKey(type, id) } });

  useEffect(() => {
    if (!media) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", handleKey); };
  }, [media, onClose]);

  if (!media) return null;
  const details = (detailsQuery.data ?? media) as MediaDetails;
  const trailer = trailerQuery.data as Trailer | undefined;
  const providers = providerQuery.data as WatchProviders | undefined;
  const backdrop = mediaImage(details.backdropPath ?? details.posterPath, "w1280");

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#05070c]/90 px-3 py-6 backdrop-blur-md sm:px-6 sm:py-10" role="dialog" aria-modal="true" aria-label={`${media.title} details`} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="relative mx-auto min-h-[min(760px,calc(100dvh-48px))] w-full max-w-4xl overflow-hidden rounded-2xl border border-white/[.1] bg-card shadow-2xl shadow-black/50">
        <div className="relative h-56 sm:h-72">
          {backdrop ? <img src={backdrop} alt="" className="h-full w-full object-cover opacity-70" /> : <div className="h-full w-full bg-card" />}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
          <button type="button" data-testid="button-close-modal" aria-label="Close details" onClick={onClose} className="absolute right-4 top-4 grid size-10 place-items-center rounded-full border border-white/15 bg-[#070a11]/65 text-white backdrop-blur-md hover:bg-[#070a11]"><X size={19} /></button>
        </div>
        <div className="relative -mt-20 px-5 pb-8 sm:-mt-24 sm:px-10">
          <div className="flex flex-col gap-6 sm:flex-row">
            <div className="hidden w-32 shrink-0 overflow-hidden rounded-lg border border-white/10 shadow-xl sm:block">
              {mediaImage(details.posterPath) ? <img src={mediaImage(details.posterPath)!} alt="" className="aspect-[2/3] w-full object-cover" /> : <div className="aspect-[2/3] bg-muted" />}
            </div>
            <div className="min-w-0 pt-5 sm:pt-12">
              <div className="mb-3 flex flex-wrap items-center gap-2 font-mono-cine text-[10px] uppercase tracking-[.15em] text-primary">
                <span>{details.mediaType}</span><span className="text-white/20">•</span><span>{details.releaseDate?.slice(0, 4) ?? "Release unknown"}</span>
                {details.runtime ? <><span className="text-white/20">•</span><span>{details.runtime} min</span></> : null}
                {details.seasons ? <><span className="text-white/20">•</span><span>{details.seasons} seasons</span></> : null}
              </div>
              <h2 className="font-display text-3xl font-bold tracking-[-.05em] sm:text-5xl" data-testid={`text-modal-title-${media.id}`}>{details.title}</h2>
              <div className="mt-3 flex items-center gap-3 text-sm"><span className="flex items-center gap-1 font-mono-cine text-primary"><Star size={14} fill="currentColor" /> {details.rating.toFixed(1)}</span><span className="text-muted-foreground">{details.genres?.join("  /  ")}</span></div>
            </div>
          </div>
          <p className="mt-7 max-w-2xl text-sm leading-7 text-muted-foreground">{details.overview || "No synopsis is available for this title yet."}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" data-testid="button-save-modal" onClick={onSave} className={`inline-flex items-center gap-2 rounded-lg px-4 py-3 text-xs font-extrabold transition ${saved ? "bg-primary text-primary-foreground" : "bg-white/[.09] text-foreground hover:bg-white/[.15]"}`}><Heart size={15} fill={saved ? "currentColor" : "none"} /> {saved ? "In my list" : "Add to my list"}</button>
            {trailer?.available && trailer.url && <a href={trailer.url} target="_blank" rel="noreferrer" data-testid="link-watch-trailer" className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-xs font-extrabold text-foreground hover:bg-white/[.07]"><Play size={15} fill="currentColor" /> Watch trailer</a>}
          </div>
          <div className="mt-8 border-t border-white/[.08] pt-6">
            <p className="mb-3 font-mono-cine text-[10px] uppercase tracking-[.18em] text-muted-foreground">Where to watch legally</p>
            {providerQuery.isLoading ? <div className="h-10 w-64 rounded-lg skeleton-shimmer" /> : providers?.flatrate?.length || providers?.rent?.length || providers?.buy?.length ? (
              <div className="flex flex-wrap items-center gap-2">
                {[...(providers.flatrate ?? []), ...(providers.rent ?? []), ...(providers.buy ?? [])].slice(0, 5).map((provider, index) => <span key={`${provider.name}-${index}`} className="rounded-lg border border-white/10 bg-white/[.04] px-3 py-2 text-xs text-foreground">{provider.name}</span>)}
                {providers.link && <a href={providers.link} target="_blank" rel="noreferrer" data-testid="link-all-providers" className="ml-1 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">See all <ExternalLink size={12} /></a>}
              </div>
            ) : <p className="text-xs text-muted-foreground">Availability varies by region. Check your preferred service for this title.</p>}
          </div>
          {details.cast?.length > 0 && <div className="mt-8 border-t border-white/[.08] pt-6"><p className="mb-3 font-mono-cine text-[10px] uppercase tracking-[.18em] text-muted-foreground">Cast</p><div className="flex flex-wrap gap-x-5 gap-y-2">{details.cast.slice(0, 5).map((person) => <span key={person.id} className="text-sm text-foreground">{person.name}<span className="ml-2 text-xs text-muted-foreground">{person.role}</span></span>)}</div></div>}
          {details.similar?.length > 0 && <div className="mt-8 border-t border-white/[.08] pt-6"><p className="mb-4 font-mono-cine text-[10px] uppercase tracking-[.18em] text-muted-foreground">You may also like</p><div className="scrollbar-none flex gap-4 overflow-x-auto pb-2">{details.similar.slice(0, 5).map((item) => <button type="button" data-testid={`button-similar-${item.id}`} key={item.id} onClick={() => onOpen(item)} className="w-20 shrink-0 text-left"><div className="aspect-[2/3] overflow-hidden rounded-md bg-muted">{mediaImage(item.posterPath) && <img src={mediaImage(item.posterPath)!} alt="" className="h-full w-full object-cover" />}</div><span className="mt-2 block truncate text-[10px] font-semibold">{item.title}</span></button>)}</div></div>}
        </div>
      </div>
    </div>
  );
}