import { type FormEvent, useMemo, useState } from "react";
import { Filter, RotateCcw, Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import type { Media } from "@workspace/api-client-react";
import { getDiscoverCatalogQueryKey, getSearchCatalogQueryKey, useDiscoverCatalog, useSearchCatalog } from "@workspace/api-client-react";
import { MediaCard } from "@/components/media-card";
import { MediaModal } from "@/components/media-modal";
import { useWatchlist } from "@/hooks/use-watchlist";

type MediaType = "movie" | "tv";
type Sort = "trending" | "popular" | "top-rated" | "upcoming";

export default function SearchPage() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [type, setType] = useState<MediaType>("movie");
  const [sort, setSort] = useState<Sort>("trending");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Media | null>(null);
  const { items, has, toggle } = useWatchlist();
  const savedIds = useMemo(() => new Set(items.map((item) => item.id)), [items]);
  const searchParams = useMemo(() => ({ query, page }), [query, page]);
  const discoverParams = useMemo(() => ({ type, page, sort }), [type, page, sort]);
  const searchQuery = useSearchCatalog(searchParams, { query: { enabled: query.length > 0, queryKey: getSearchCatalogQueryKey(searchParams) } });
  const discoverQuery = useDiscoverCatalog(discoverParams, { query: { enabled: query.length === 0, queryKey: getDiscoverCatalogQueryKey(discoverParams) } });
  const result = query ? searchQuery.data : discoverQuery.data;
  const loading = query ? searchQuery.isLoading : discoverQuery.isLoading;
  const error = query ? searchQuery.isError : discoverQuery.isError;
  const refetch = () => query ? searchQuery.refetch() : discoverQuery.refetch();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
    setQuery(input.trim());
  };
  const reset = () => { setInput(""); setQuery(""); setPage(1); setType("movie"); setSort("trending"); };

  return (
    <div className="cinema-grid min-h-[calc(100dvh-72px)]">
      <div className="mx-auto max-w-[1500px] px-5 pb-20 pt-14 sm:px-8 lg:px-12">
        <div className="max-w-3xl reveal-up"><p className="font-mono-cine text-[10px] uppercase tracking-[.22em] text-primary">The CineVerse index</p><h1 className="mt-3 font-display text-5xl font-bold tracking-[-.065em] sm:text-7xl">Find the feeling.</h1><p className="mt-5 max-w-xl text-sm leading-6 text-muted-foreground">Search the films and series that stay with you, or let the current move of cinema set the mood.</p></div>
        <form onSubmit={submit} className="mt-10 flex max-w-3xl gap-2 rounded-xl border border-white/[.12] bg-card/80 p-2 shadow-xl shadow-black/10 focus-within:border-primary/60" role="search">
          <SearchIcon className="ml-3 mt-2.5 shrink-0 text-muted-foreground" size={19} />
          <input type="search" data-testid="input-search-catalog" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Search by title, mood, or memory..." className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
          <button type="submit" data-testid="button-submit-search" className="rounded-lg bg-primary px-5 py-2.5 text-xs font-extrabold text-primary-foreground transition hover:brightness-110">Search</button>
        </form>
        <div className="mt-10 flex flex-col gap-4 border-y border-white/[.08] py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><SlidersHorizontal size={15} /> <span className="font-semibold text-foreground">{query ? `Results for “${query}”` : "Browse the index"}</span></div>
          <div className="flex flex-wrap gap-2">
            <div className="flex rounded-lg border border-white/[.09] bg-card p-1">{(["movie", "tv"] as MediaType[]).map((value) => <button type="button" data-testid={`button-filter-type-${value}`} key={value} onClick={() => { setType(value); setQuery(""); setPage(1); }} className={`rounded-md px-3 py-1.5 text-[11px] font-bold capitalize transition ${type === value && !query ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{value === "tv" ? "Series" : "Movies"}</button>)}</div>
            <label className="flex items-center gap-2 rounded-lg border border-white/[.09] bg-card px-3 text-[11px] font-semibold text-muted-foreground"><Filter size={13} /><select data-testid="select-sort-catalog" value={sort} onChange={(event) => { setSort(event.target.value as Sort); setQuery(""); setPage(1); }} className="bg-transparent py-2 text-foreground outline-none"><option value="trending">Trending now</option><option value="popular">Most popular</option><option value="top-rated">Top rated</option><option value="upcoming">Coming soon</option></select></label>
            {(query || sort !== "trending" || type !== "movie") && <button type="button" data-testid="button-reset-filters" onClick={reset} className="inline-flex items-center gap-1 rounded-lg px-3 text-[11px] font-bold text-muted-foreground hover:text-primary"><RotateCcw size={13} /> Reset</button>}
          </div>
        </div>
        {loading ? <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">{Array.from({ length: 14 }).map((_, index) => <div key={index}><div className="aspect-[2/3] rounded-xl skeleton-shimmer" /><div className="mt-3 h-3 w-3/4 rounded skeleton-shimmer" /></div>)}</div> : error ? <div className="rounded-xl border border-destructive/25 bg-destructive/[.07] p-8 text-center"><p className="font-display text-xl font-bold">That search hit a dead end.</p><p className="mt-2 text-sm text-muted-foreground">The catalog is taking a quiet moment. Please try again.</p><button type="button" data-testid="button-retry-search" onClick={() => refetch()} className="mt-5 rounded-lg bg-primary px-4 py-2.5 text-xs font-extrabold text-primary-foreground">Retry request</button></div> : result?.results?.length ? <><div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">{result.results.map((media, index) => <MediaCard key={`${media.mediaType}-${media.id}`} media={media} index={index} saved={savedIds.has(media.id)} onSave={() => toggle(media)} onOpen={() => setSelected(media)} />)}</div><div className="mt-12 flex items-center justify-between border-t border-white/[.08] pt-5"><p className="font-mono-cine text-[10px] uppercase tracking-[.16em] text-muted-foreground">{result.totalResults.toLocaleString()} titles indexed</p><div className="flex items-center gap-2"><button type="button" data-testid="button-previous-page" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold disabled:opacity-30">Previous</button><span className="px-2 font-mono-cine text-xs text-muted-foreground">{page} / {result.totalPages}</span><button type="button" data-testid="button-next-page" disabled={page >= result.totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold disabled:opacity-30">Next</button></div></div></> : <div className="rounded-2xl border border-dashed border-white/15 bg-card/50 px-6 py-16 text-center"><p className="font-display text-2xl font-bold">{query ? "No titles in that frame." : "Nothing is queued here yet."}</p><p className="mt-2 text-sm text-muted-foreground">{query ? "Try a shorter title or a different spelling." : "Try another filter to set the scene."}</p></div>}
      </div>
      <MediaModal media={selected} saved={selected ? has(selected.id) : false} onSave={() => selected && toggle(selected)} onClose={() => setSelected(null)} onOpen={setSelected} />
    </div>
  );
}