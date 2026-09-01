import { Film, Heart, Home, Menu, Radio, Search, Sparkles, Tv, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";

export function CineShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/", label: "Discover", icon: Home },
    { href: "/search", label: "Find a title", icon: Search },
    { href: "/live-tv", label: "Live TV", icon: Radio },
    { href: "/watchlist", label: "My list", icon: Heart },
  ];
  const mobileLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/search?type=movie&sort=popular", label: "Movies", icon: Film },
    { href: "/search?type=tv&sort=popular", label: "Series", icon: Tv },
    { href: "/search?query=Anime", label: "Anime", icon: Sparkles },
    { href: "/live-tv", label: "Live TV", icon: Radio },
  ];
  const currentPath = location.split("?")[0];

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/[.07] bg-[#080b13]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[64px] max-w-[1500px] items-center justify-between px-5 sm:h-[72px] sm:px-8 lg:px-12">
          <Link href="/" data-testid="link-brand" className="group flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_8px_24px_hsl(var(--primary)/.2)] transition-transform group-hover:rotate-[-8deg]">
              <Film size={18} strokeWidth={2.5} />
            </span>
            <span className="font-display text-[19px] font-bold tracking-[-.04em]">Cine<span className="text-primary">Verse</span></span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            {links.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} data-testid={`link-nav-${label.toLowerCase().replaceAll(" ", "-")}`} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors ${location === href ? "bg-white/[.08] text-foreground" : "text-muted-foreground hover:bg-white/[.05] hover:text-foreground"}`}>
                <Icon size={16} strokeWidth={location === href ? 2.5 : 1.8} />
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/search" data-testid="link-header-search" aria-label="Search titles" className="grid size-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/[.08] hover:text-foreground">
              <Search size={19} />
            </Link>
            <button type="button" data-testid="button-mobile-menu" aria-label="Open navigation" onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/[.08] hover:text-foreground md:hidden">
              <Menu size={20} />
            </button>
            <span className="ml-2 grid size-9 place-items-center rounded-full border border-primary/40 bg-primary/10 font-mono-cine text-[10px] font-medium text-primary sm:size-8">CV</span>
          </div>
        </div>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 bg-[#080b13]/80 backdrop-blur-sm md:hidden" onClick={() => setOpen(false)}>
          <div className="ml-auto flex h-full w-[min(86vw,340px)] flex-col border-l border-white/[.08] bg-[#0e121e] p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-12 flex items-center justify-between">
              <span className="font-mono-cine text-[10px] uppercase tracking-[.2em] text-muted-foreground">Navigate</span>
              <button type="button" data-testid="button-close-menu" aria-label="Close navigation" onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-full bg-white/[.06]"><X size={18} /></button>
            </div>
            <nav className="flex flex-col gap-2">
              {links.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} onClick={() => setOpen(false)} data-testid={`link-mobile-${label.toLowerCase().replaceAll(" ", "-")}`} className={`flex items-center gap-4 rounded-xl px-4 py-4 text-base font-semibold ${location === href ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-white/[.06] hover:text-foreground"}`}>
                  <Icon size={19} /> {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
      <main className="pb-20 pt-[64px] sm:pt-[72px] md:pb-0">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[.09] bg-[#080b13]/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden" aria-label="Mobile navigation">
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {mobileLinks.map(({ href, label, icon: Icon }) => {
            const isActive = href === "/" ? currentPath === "/" : href.startsWith("/live-tv") ? currentPath === "/live-tv" : currentPath === "/search" && href.includes("search");
            return (
              <Link
                key={label}
                href={href}
                data-testid={`link-bottom-${label.toLowerCase().replaceAll(" ", "-")}`}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[9px] font-semibold transition ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                {isActive && <span className="absolute top-0 h-0.5 w-7 rounded-full bg-primary shadow-[0_0_16px_hsl(var(--primary)/.8)]" />}
                <Icon size={17} strokeWidth={isActive ? 2.5 : 1.8} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      <footer className="hidden border-t border-white/[.07] px-5 py-10 md:block sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p><span className="font-semibold text-foreground">CineVerse</span> — find your next favorite story.</p>
          <p className="font-mono-cine text-[10px] uppercase tracking-[.18em]">Discovery, not distribution</p>
        </div>
      </footer>
    </div>
  );
}