import { ChevronRight } from "lucide-react";
import type { Media } from "@workspace/api-client-react";
import { MediaCard } from "@/components/media-card";

export function MediaRail({ title, eyebrow, items, savedIds, onSave, onOpen }: { title: string; eyebrow?: string; items: Media[]; savedIds: Set<number>; onSave: (media: Media) => void; onOpen: (media: Media) => void }) {
  if (!items.length) return null;
  return (
    <section className="mb-12" data-testid={`section-rail-${title.toLowerCase().replaceAll(" ", "-")}`}>
      <div className="mb-5 flex items-end justify-between px-5 sm:px-8 lg:px-12">
        <div>
          {eyebrow && <p className="mb-2 font-mono-cine text-[10px] uppercase tracking-[.22em] text-primary">{eyebrow}</p>}
          <h2 className="font-display text-2xl font-bold tracking-[-.04em] sm:text-[28px]">{title}</h2>
        </div>
        <button type="button" data-testid={`button-view-rail-${title.toLowerCase().replaceAll(" ", "-")}`} onClick={() => onOpen(items[0])} className="flex items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary">View title <ChevronRight size={14} /></button>
      </div>
      <div className="scrollbar-none flex gap-4 overflow-x-auto px-5 pb-2 sm:gap-5 sm:px-8 lg:px-12">
        {items.map((media, index) => <MediaCard key={`${media.mediaType}-${media.id}`} media={media} index={index} saved={savedIds.has(media.id)} onSave={() => onSave(media)} onOpen={() => onOpen(media)} />)}
      </div>
    </section>
  );
}