import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Heart, Info, Radio, Sparkles } from "lucide-react";
import type { Media } from "@workspace/api-client-react";
import { getGetCatalogHomeQueryKey, getHealthCheckQueryKey, useGetCatalogHome, useHealthCheck } from "@workspace/api-client-react";
import { MediaModal } from "@/components/media-modal";
import { mediaImage } from "@/components/media-card";
import { MediaRail } from "@/components/media-rail";
import { useWatchlist } from "@/hooks/use-watchlist";
import { Link } from "wouter";

function HeroSkeleton() {
  return <div className="mx-5 h-[560px] animate-pulse rounded-2xl bg-white/[.05] sm:mx-8 lg:mx-12 lg:h-[610px]" />;
}

export default function HomePage() {
  const homeQuery = useGetCatalogHome({ type: "movie" }, { query: { queryKey: getGetCatalogHomeQueryKey({ type: "movie" }) } });
  const healthQuery = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey() } });
  const { items, has, toggle } = useWatchlist();
  const savedIds = useMemo(() => new Set(items.map((item) => item.id)), [items]);
  const [selected, setSelected] = useState<Media | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const heroItems = useMemo(() => homeQuery.data?.hero ?? [], [homeQuery.data?.hero]);

  useEffect(() => {
    if (heroItems.length < 2) return;
    const timer = window.setInterval(() => setHeroIndex((index) => (index + 1) % heroItems.length), 7000);
    return () => window.clearInterval(timer);
  }, [heroItems.length]);

  const hero = heroItems[heroIndex] ?? heroItems[0];
  const backdrop = hero ? mediaImage(hero.backdropPath ?? hero.posterPath, "w1280") : null;
  const handleSave = (media: Media) => toggle(media);

  if (homeQuery.isLoading) return <div className="min-h-[calc(100dvh-72px)] pt-7"><HeroSkeleton /><div className="mt-12 h-6 w-48 px-5 skeleton-shimmer sm:px-8 lg:px-12" /></div>;
  if (homeQuery.isError) return <div className="mx-auto flex min-h-[calc(100dvh-72px)] max-w-xl flex-col items-center justify-center px-6 text-center"><div className="mb-5 grid size-14 place-items-center rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive"><Radio size={23} /></div><h1 className="font-display text-3xl font-bold">The projector blinked.</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">CineVerse could not reach the catalog right now. Give it another take.</p><button type="button" data-testid="button-retry-home" onClick={() => homeQuery.refetch()} className="mt-7 rounded-lg bg-primary px-5 py-3 text-xs font-extrabold text-primary-foreground">Try again</button></div>;

  return (
    <div className="cinema-grid min-h-[calc(100dvh-72px)] pt-7">
      {hero && <section className="relative mx-5 min-h-[560px] overflow-hidden rounded-2xl border border-white/[.1] sm:mx-8 lg:mx-12 lg:min-h-[610px]" data-testid="section-hero">
        {backdrop && <img src={backdrop} alt="" className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700" />}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#080b13_0%,rgba(8,11,19,.94)_23%,rgba(8,11,19,.42)_62%,rgba(8,11,19,.22)),linear-gradient(0deg,#080b13_0%,transparent_38%)]" />
        <div className="relative flex min-h-[560px] max-w-2xl flex-col justify-end p-7 sm:p-12 lg:min-h-[610px] lg:p-16">
          <div className="reveal-up mb-auto flex items-center gap-2 pt-1 font-mono-cine text-[10px] uppercase tracking-[.25em] text-primary"><Sparkles size={13} /> Curated for your next screening</div>
          <div className="reveal-up reveal-delay-1">
            <div className="mb-4 flex flex-wrap items-center gap-3 font-mono-cine text-[10px] uppercase tracking-[.16em] text-foreground/70"><span className="rounded bg-primary px-2 py-1 font-bold text-primary-foreground">Spotlight</span><span>{hero.releaseDate?.slice(0, 4) ?? "New release"}</span><span className="text-white/25">/</span><span>{hero.mediaType}</span><span className="text-white/25">/</span><span className="text-primary">{hero.rating.toFixed(1)} rating</span></div>
            <h1 className="max-w-xl font-display text-5xl font-bold leading-[.94] tracking-[-.065em] text-foreground sm:text-7xl lg:text-[84px]" data-testid="text-hero-title">{hero.title}</h1>
            <p className="mt-6 line-clamp-3 max-w-lg text-sm leading-6 text-foreground/70 sm:text-[15px]">{hero.overview}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" data-testid="button-hero-details" onClick={() => setSelected(hero)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-xs font-extrabold text-primary-foreground transition hover:brightness-110"><Info size={16} /> Explore title</button>
              <button type="button" data-testid="button-hero-save" onClick={() => handleSave(hero)} className="inline-flex items-center gap-2 rounded-lg bg-white/[.1] px-5 py-3 text-xs font-extrabold text-foreground backdrop-blur-sm transition hover:bg-white/[.17]"><Heart size={16} fill={has(hero.id) ? "currentColor" : "none"} /> {has(hero.id) ? "In my list" : "Add to my list"}</button>
            </div>
          </div>
          {heroItems.length > 1 && <div className="mt-10 flex items-center gap-2" aria-label="Spotlight titles">{heroItems.slice(0, 5).map((item, index) => <button type="button" data-testid={`button-hero-slide-${index}`} key={item.id} aria-label={`Show spotlight ${index + 1}`} onClick={() => setHeroIndex(index)} className={`h-1 rounded-full transition-all ${index === heroIndex ? "w-10 bg-primary" : "w-5 bg-white/25 hover:bg-white/50"}`} />)}</div>}
        </div>
      </section>}

      <div className="mx-auto max-w-[1500px] pb-8 pt-14">
        <div className="mb-10 flex items-center justify-between px-5 sm:px-8 lg:px-12">
          <div><p className="mb-2 font-mono-cine text-[10px] uppercase tracking-[.22em] text-accent">Live from the catalog</p><h2 className="font-display text-3xl font-bold tracking-[-.05em] sm:text-4xl">A good night starts here.</h2></div>
          <span className="hidden items-center gap-2 text-[11px] text-muted-foreground sm:flex"><span className={`size-2 rounded-full ${healthQuery.data ? "bg-emerald-400" : "bg-primary"}`} /> {healthQuery.data?.status === "ok" ? "Catalog online" : "Curated picks"}</span>
        </div>
        {(homeQuery.data?.sections ?? []).map((section, index) => <MediaRail key={section.id} title={section.title} eyebrow={index === 0 ? "Your evening queue" : undefined} items={section.items} savedIds={savedIds} onSave={handleSave} onOpen={setSelected} />)}
        <div className="mx-5 mt-4 rounded-2xl border border-primary/20 bg-primary/[.07] p-6 sm:mx-8 sm:p-8 lg:mx-12"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-mono-cine text-[10px] uppercase tracking-[.2em] text-primary">Keep exploring</p><h3 className="mt-2 font-display text-2xl font-bold tracking-[-.04em]">Your next favorite is one search away.</h3><p className="mt-2 max-w-lg text-sm text-muted-foreground">Browse beyond the obvious. Save a title now and make your own little festival.</p></div><Link href="/search" data-testid="link-explore-search" className="inline-flex shrink-0 items-center gap-2 text-xs font-extrabold text-primary hover:underline">Explore catalog <ArrowRight size={15} /></Link></div></div>
      </div>
      <MediaModal media={selected} saved={selected ? has(selected.id) : false} onSave={() => selected && handleSave(selected)} onClose={() => setSelected(null)} onOpen={setSelected} />
    </div>
  );
}