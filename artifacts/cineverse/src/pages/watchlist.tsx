import { useMemo, useState } from "react";
import { Bookmark, Check, Heart, Trash2 } from "lucide-react";
import type { Media } from "@workspace/api-client-react";
import { MediaCard } from "@/components/media-card";
import { MediaModal } from "@/components/media-modal";
import { useWatchlist } from "@/hooks/use-watchlist";
import { Link } from "wouter";

export default function WatchlistPage() {
  const { items, has, toggle, remove, clear } = useWatchlist();
  const [selected, setSelected] = useState<Media | null>(null);
  const [confirming, setConfirming] = useState(false);
  const savedIds = useMemo(() => new Set(items.map((item) => item.id)), [items]);
  const confirmClear = () => { if (confirming) { clear(); setConfirming(false); } else setConfirming(true); };

  return (
    <div className="cinema-grid min-h-[calc(100dvh-72px)]">
      <div className="mx-auto max-w-[1500px] px-5 pb-20 pt-14 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-6 border-b border-white/[.08] pb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="reveal-up"><p className="font-mono-cine text-[10px] uppercase tracking-[.22em] text-primary">Your private screening room</p><h1 className="mt-3 font-display text-5xl font-bold tracking-[-.065em] sm:text-7xl" data-testid="text-watchlist-heading">My list<span className="text-primary">.</span></h1><p className="mt-4 text-sm text-muted-foreground">{items.length ? `${items.length} title${items.length === 1 ? "" : "s"} waiting for your attention.` : "A place for the stories you are not ready to forget."}</p></div>
          {items.length > 0 && <button type="button" data-testid="button-clear-watchlist" onClick={confirmClear} className={`inline-flex items-center gap-2 self-start rounded-lg px-3 py-2 text-xs font-bold transition sm:self-auto ${confirming ? "bg-destructive text-destructive-foreground" : "border border-white/10 text-muted-foreground hover:border-destructive/50 hover:text-destructive"}`}><Trash2 size={14} /> {confirming ? "Confirm clear" : "Clear list"}</button>}
        </div>
        {items.length ? <div className="pt-10"><div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">{items.map((media, index) => <div key={`${media.mediaType}-${media.id}`} className="group relative"><MediaCard media={media} index={index} saved={savedIds.has(media.id)} onSave={() => remove(media.id)} onOpen={() => setSelected(media)} /><button type="button" data-testid={`button-remove-watchlist-${media.id}`} aria-label={`Remove ${media.title}`} onClick={() => remove(media.id)} className="absolute right-2 top-2 z-10 grid size-8 place-items-center rounded-full border border-white/20 bg-[#070a11]/75 text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100 hover:bg-destructive focus:opacity-100"><Check size={15} /></button></div>)}</div></div> : <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-card/45 px-6 py-24 text-center"><div className="grid size-16 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary"><Bookmark size={27} /></div><h2 className="mt-6 font-display text-2xl font-bold">Your list is a blank reel.</h2><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Tap the bookmark on any title that catches your eye. It will be here, waiting, whenever you are.</p><Link href="/search" data-testid="link-browse-from-watchlist" className="mt-7 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-xs font-extrabold text-primary-foreground"><Heart size={15} /> Browse titles</Link></div>}
      </div>
      <MediaModal media={selected} saved={selected ? has(selected.id) : false} onSave={() => selected && toggle(selected)} onClose={() => setSelected(null)} onOpen={setSelected} />
    </div>
  );
}