import { type FormEvent, useMemo, useState } from "react";
import { AlertTriangle, LoaderCircle, Play, Radio, Search, ShieldCheck } from "lucide-react";
import { getListLiveTvChannelsQueryKey, useListLiveTvChannels, type LiveTvChannel } from "@workspace/api-client-react";
import { LiveTvPlayer } from "@/components/live-tv-player";

const COUNTRY_OPTIONS = [
  { value: "all", label: "All countries" },
  { value: "bd", label: "Bangladesh" },
  { value: "in", label: "India" },
  { value: "us", label: "United States" },
  { value: "gb", label: "United Kingdom" },
  { value: "ca", label: "Canada" },
  { value: "au", label: "Australia" },
  { value: "de", label: "Germany" },
  { value: "fr", label: "France" },
  { value: "jp", label: "Japan" },
  { value: "kr", label: "South Korea" },
  { value: "sg", label: "Singapore" },
  { value: "ae", label: "United Arab Emirates" },
  { value: "pk", label: "Pakistan" },
  { value: "np", label: "Nepal" },
  { value: "lk", label: "Sri Lanka" },
] as const;

function channelMark(name: string) {
  return name
    .replace(/\([^)]*\)/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "TV";
}

export default function LiveTvPage() {
  const [input, setInput] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [country, setCountry] = useState("all");
  const [selected, setSelected] = useState<LiveTvChannel | null>(null);
  const params = useMemo(() => ({
    query: activeQuery || undefined,
    category: category === "All" ? undefined : category,
    country: country === "all" ? undefined : country,
    limit: 60,
  }), [activeQuery, category, country]);
  const channelsQuery = useListLiveTvChannels(params, { query: { queryKey: getListLiveTvChannelsQueryKey(params) } });
  const channels = channelsQuery.data?.channels ?? [];
  const categories = channelsQuery.data?.categories ?? [];

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setActiveQuery(input.trim());
  };

  return (
    <div className="cinema-grid min-h-[calc(100dvh-64px)]">
      <div className="mx-auto max-w-[1500px] px-5 pb-20 pt-12 sm:px-8 sm:pt-16 lg:px-12">
        <div className="max-w-3xl reveal-up">
          <p className="font-mono-cine text-[10px] uppercase tracking-[.22em] text-primary">CineVerse live signal</p>
          <h1 className="mt-3 font-display text-5xl font-bold tracking-[-.065em] sm:text-7xl">Stay in the signal<span className="text-primary">.</span></h1>
          <p className="mt-5 max-w-xl text-sm leading-6 text-muted-foreground">A curated directory of public HTTPS HLS channels. Pick a signal and watch it in the player.</p>
        </div>

        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-cyan-300/15 bg-cyan-300/[.05] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-cyan-300" size={19} /><p className="text-xs leading-5 text-muted-foreground">Only HTTPS HLS entries are shown. Channel rights and regional availability belong to each broadcaster.</p></div>
          <span className="flex shrink-0 items-center gap-2 font-mono-cine text-[9px] uppercase tracking-[.13em] text-emerald-400"><span className="size-1.5 rounded-full bg-emerald-400" /> Public playlist</span>
        </div>

        <form onSubmit={submit} className="mt-8 flex max-w-3xl gap-2 rounded-xl border border-white/[.12] bg-card/80 p-2 shadow-xl shadow-black/10 focus-within:border-primary/60" role="search">
          <Search className="ml-3 mt-2.5 shrink-0 text-muted-foreground" size={18} />
          <input type="search" data-testid="input-live-tv-search" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Search channels or regions..." className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
          <button type="submit" data-testid="button-live-tv-search" className="rounded-lg bg-primary px-5 py-2.5 text-xs font-extrabold text-primary-foreground transition hover:brightness-110">Search</button>
        </form>

        <div className="mt-3 flex max-w-3xl items-center gap-3">
          <label htmlFor="live-tv-country" className="font-mono-cine text-[10px] uppercase tracking-[.16em] text-muted-foreground">Country</label>
          <select id="live-tv-country" data-testid="select-live-tv-country" value={country} onChange={(event) => { setCountry(event.target.value); setCategory("All"); }} className="min-w-0 rounded-lg border border-white/[.12] bg-card px-3 py-2 text-xs font-semibold text-foreground outline-none transition focus:border-primary/60">
            {COUNTRY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>

        <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {["All", ...categories.slice(0, 24)].map((item) => <button type="button" key={item} data-testid={`button-live-category-${item.toLowerCase().replaceAll(" ", "-")}`} onClick={() => setCategory(item)} className={`shrink-0 rounded-full border px-4 py-2 text-[11px] font-bold transition ${category === item ? "border-primary bg-primary text-primary-foreground" : "border-white/10 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>{item}</button>)}
        </div>

        <div className="mt-10 flex items-end justify-between border-b border-white/[.08] pb-4">
          <div><p className="font-mono-cine text-[10px] uppercase tracking-[.18em] text-accent">Channel directory</p><h2 className="mt-2 font-display text-2xl font-bold tracking-[-.04em]">Live channels</h2></div>
          <span className="font-mono-cine text-[10px] uppercase tracking-[.14em] text-muted-foreground">{channelsQuery.data?.total ?? 0} available</span>
        </div>

        {channelsQuery.isLoading ? <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 12 }).map((_, index) => <div key={index} className="h-24 rounded-xl skeleton-shimmer" />)}</div> : channelsQuery.isError ? <div className="mt-7 rounded-2xl border border-destructive/25 bg-destructive/[.07] p-8 text-center"><AlertTriangle className="mx-auto text-destructive" size={23} /><p className="mt-3 font-display text-xl font-bold">The signal is quiet.</p><p className="mt-2 text-sm text-muted-foreground">The public channel directory could not be loaded right now.</p><button type="button" data-testid="button-retry-live-tv" onClick={() => channelsQuery.refetch()} className="mt-5 rounded-lg bg-primary px-4 py-2.5 text-xs font-extrabold text-primary-foreground">Retry directory</button></div> : channels.length ? <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{channels.map((channel, index) => <button type="button" key={`${channel.id}-${index}`} data-testid={`button-live-channel-${index}`} onClick={() => setSelected(channel)} className="group flex min-h-24 items-center gap-4 rounded-xl border border-white/[.09] bg-card/75 p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card hover:shadow-xl hover:shadow-black/20 focus-visible:-translate-y-0.5"><span className="grid size-14 shrink-0 place-items-center rounded-xl border border-primary/20 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/.32),transparent_60%),hsl(var(--muted))] font-display text-sm font-bold tracking-[-.03em] text-primary">{channelMark(channel.name)}</span><span className="min-w-0 flex-1"><span className="block truncate font-display text-sm font-bold text-foreground">{channel.name}</span><span className="mt-1 block truncate text-[10px] uppercase tracking-[.12em] text-muted-foreground">{channel.category}</span></span><span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary opacity-70 transition group-hover:bg-primary group-hover:text-primary-foreground group-hover:opacity-100"><Play size={14} fill="currentColor" /></span></button>)}</div> : <div className="mt-7 rounded-2xl border border-dashed border-white/15 bg-card/50 px-6 py-16 text-center"><Radio className="mx-auto text-muted-foreground" size={24} /><p className="mt-4 font-display text-xl font-bold">No channels found.</p><p className="mt-2 text-sm text-muted-foreground">Try another channel name or category.</p></div>}
      </div>
      {selected && <LiveTvPlayer channel={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}