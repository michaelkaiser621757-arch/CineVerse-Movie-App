import { type FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowRight, Globe2, Heart, Info, Play, Radio, Search as SearchIcon, Sparkles } from "lucide-react";
import type { Media } from "@workspace/api-client-react";
import { getGetCatalogHomeQueryKey, getHealthCheckQueryKey, useGetCatalogHome, useHealthCheck } from "@workspace/api-client-react";
import { MediaModal } from "@/components/media-modal";
import { mediaImage } from "@/components/media-card";
import { MediaRail } from "@/components/media-rail";
import { useWatchlist } from "@/hooks/use-watchlist";
import { Link, useLocation } from "wouter";

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
  const [searchInput, setSearchInput] = useState("");
  const [, navigate] = useLocation();
  const heroItems = useMemo(() => homeQuery.data?.hero ?? [], [homeQuery.data?.hero]);

  useEffect(() => {
    if (heroItems.length < 2) return;
    const timer = window.setInterval(() => setHeroIndex((index) => (index + 1) % heroItems.length), 7000);
    return () => window.clearInterval(timer);
  }, [heroItems.length]);

  const hero = heroItems[heroIndex] ?? heroItems[0];
  const backdrop = hero ? mediaImage(hero.backdropPath ?? hero.posterPath, "w1280") : null;
  const handleSave = (media: Media) => toggle(media);
  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchInput.trim();
    navigate(query ? `/search?query=${encodeURIComponent(query)}` : "/search");
  };

  if (homeQuery.isLoading) return <div className="min-h-[calc(100dvh-72px)] pt-7"><HeroSkeleton /><div className="mt-12 h-6 w-48 px-5 skeleton-shimmer sm:px-8 lg:px-12" /></div>;
  if (homeQuery.isError) return <div className="mx-auto flex min-h-[calc(100dvh-72px)] max-w-xl flex-col items-center justify-center px-6 text-center"><div className="mb-5 grid size-14 place-items-center rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive"><Radio size={23} /></div><h1 className="font-display text-3xl font-bold">The projector blinked.</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">CineVerse could not reach the catalog right now. Give it another take.</p><button type="button" data-testid="button-retry-home" onClick={() => homeQuery.refetch()} className="mt-7 rounded-lg bg-primary px-5 py-3 text-xs font-extrabold text-primary-foreground">Try again</button></div>;

  return (
    <div className="cinema-grid min-h-[calc(100dvh-64px)] pt-5 sm:min-h-[calc(100dvh-72px)] sm:pt-7">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
        <form onSubmit={handleSearch} className="flex h-14 w-full overflow-hidden rounded-xl border border-white/[.13] bg-[#151518]/90 shadow-[0_12px_40px_rgba(0,0,0,.2)] transition focus-within:border-primary/70" role="search">
          <SearchIcon className="ml-4 mt-[18px] shrink-0 text-muted-foreground" size={19} />
          <input type="search" data-testid="input-home-search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Movie, Series, Anime, Actor..." className="min-w-0 flex-1 bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
          <button type="submit" data-testid="button-home-search" aria-label="Search catalog" className="grid w-16 place-items-center bg-primary text-primary-foreground transition hover:brightness-110 sm:w-20"><SearchIcon size={19} /></button>
        </form>
        <div className="mt-3 flex items-center justify-between rounded-xl border border-white/[.07] bg-[#151518]/75 px-4 py-3 text-xs shadow-lg shadow-black/10">
          <span className="flex items-center gap-2 text-emerald-400"><span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.8)]" /> {healthQuery.data?.status === "ok" ? "Live catalog active" : "Connecting to catalog"}</span>
          <span className="font-mono-cine text-[9px] uppercase tracking-[.18em] text-muted-foreground">TMDB / Global index</span>
        </div>
      </div>

      {hero && <section className="home-hero relative mx-5 mt-5 min-h-[390px] overflow-hidden rounded-[1.45rem] border border-primary/15 shadow-[0_22px_70px_rgba(0,0,0,.42)] sm:mx-8 sm:min-h-[520px] lg:mx-12 lg:min-h-[600px]" data-testid="section-hero">
        {backdrop && <img src={backdrop} alt="" className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700" />}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(75,9,12,.42)_0%,rgba(17,3,5,.48)_42%,#08070a_100%),linear-gradient(90deg,rgba(9,5,7,.94)_0%,rgba(9,5,7,.6)_48%,rgba(9,5,7,.12)_100%)]" />
        <div className="relative flex min-h-[390px] max-w-2xl flex-col justify-end p-6 sm:min-h-[520px] sm:p-12 lg:min-h-[600px] lg:p-16">
          <div className="reveal-up mb-auto flex items-center gap-2 pt-1 font-mono-cine text-[9px] uppercase tracking-[.23em] text-primary"><Sparkles size={12} /> The global content platform</div>
          <div className="reveal-up reveal-delay-1">
            <h1 className="font-display text-[48px] font-bold leading-[.9] tracking-[-.07em] text-white sm:text-7xl lg:text-[92px]" data-testid="text-hero-title">Cine<span className="text-primary">Verse</span></h1>
            <p className="mt-4 text-base font-medium text-white/75 sm:text-xl">Movies · Web Series · Anime · Live TV</p>
            <div className="mt-5 flex flex-wrap items-center gap-2 font-mono-cine text-[9px] uppercase tracking-[.14em] text-white/65"><span className="rounded bg-primary px-2 py-1 font-bold text-primary-foreground">Spotlight</span><span>{hero.title}</span><span className="text-white/30">/</span><span>{hero.rating.toFixed(1)} rating</span></div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" data-testid="button-hero-details" onClick={() => setSelected(hero)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-xs font-extrabold text-primary-foreground transition hover:brightness-110"><Play size={15} fill="currentColor" /> Explore now</button>
              <button type="button" data-testid="button-hero-save" onClick={() => handleSave(hero)} className="inline-flex items-center gap-2 rounded-lg bg-white/[.1] px-5 py-3 text-xs font-extrabold text-foreground backdrop-blur-sm transition hover:bg-white/[.17]"><Heart size={16} fill={has(hero.id) ? "currentColor" : "none"} /> {has(hero.id) ? "In my list" : "Add to my list"}</button>
            </div>
          </div>
          {heroItems.length > 1 && <div className="mt-8 flex items-center gap-2" aria-label="Spotlight titles">{heroItems.slice(0, 5).map((item, index) => <button type="button" data-testid={`button-hero-slide-${index}`} key={item.id} aria-label={`Show spotlight ${index + 1}`} onClick={() => setHeroIndex(index)} className={`h-1 rounded-full transition-all ${index === heroIndex ? "w-10 bg-primary" : "w-5 bg-white/30 hover:bg-white/60"}`} />)}</div>}
        </div>
      </section>}

      <div className="mx-auto max-w-[1500px] pb-8 pt-7 sm:pt-14">
        <section className="mx-5 mb-10 flex items-center gap-4 rounded-2xl border border-white/[.08] bg-[#151518]/85 p-4 shadow-xl shadow-black/10 sm:mx-8 sm:p-5 lg:mx-12">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300"><Globe2 size={22} /></span>
          <div className="min-w-0"><h2 className="font-display text-base font-bold tracking-[-.02em] sm:text-lg">Global Content Platform</h2><p className="mt-1 truncate text-xs text-muted-foreground">Live metadata across movies, series and more.</p></div>
          <span className="ml-auto hidden shrink-0 items-center gap-2 font-mono-cine text-[9px] uppercase tracking-[.12em] text-emerald-400 sm:flex"><span className="size-1.5 rounded-full bg-emerald-400" /> Online</span>
        </section>
        <div className="mb-10 flex items-center justify-between px-5 sm:px-8 lg:px-12">
          <div><p className="mb-2 font-mono-cine text-[10px] uppercase tracking-[.22em] text-accent">Live from the catalog</p><h2 className="font-display text-3xl font-bold tracking-[-.05em] sm:text-4xl">Trending now</h2></div>
          <span className="hidden items-center gap-2 text-[11px] text-muted-foreground sm:flex"><span className={`size-2 rounded-full ${healthQuery.data ? "bg-emerald-400" : "bg-primary"}`} /> {healthQuery.data?.status === "ok" ? "Catalog online" : "Curated picks"}</span>
        </div>
        {(homeQuery.data?.sections ?? []).map((section, index) => <MediaRail key={section.id} title={section.title} eyebrow={index === 0 ? "Your evening queue" : undefined} items={section.items} savedIds={savedIds} onSave={handleSave} onOpen={setSelected} />)}
        <div className="mx-5 mt-4 rounded-2xl border border-primary/20 bg-primary/[.07] p-6 sm:mx-8 sm:p-8 lg:mx-12"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-mono-cine text-[10px] uppercase tracking-[.2em] text-primary">Keep exploring</p><h3 className="mt-2 font-display text-2xl font-bold tracking-[-.04em]">Your next favorite is one search away.</h3><p className="mt-2 max-w-lg text-sm text-muted-foreground">Browse beyond the obvious. Save a title now and make your own little festival.</p></div><Link href="/search" data-testid="link-explore-search" className="inline-flex shrink-0 items-center gap-2 text-xs font-extrabold text-primary hover:underline">Explore catalog <ArrowRight size={15} /></Link></div></div>
      </div>
      <MediaModal media={selected} saved={selected ? has(selected.id) : false} onSave={() => selected && handleSave(selected)} onClose={() => setSelected(null)} onOpen={setSelected} />
    </div>
  );
}