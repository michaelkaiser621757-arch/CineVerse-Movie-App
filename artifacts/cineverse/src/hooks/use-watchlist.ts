import { useCallback, useEffect, useState } from "react";
import type { Media } from "@workspace/api-client-react";

const STORAGE_KEY = "cineverse-watchlist";

function readWatchlist(): Media[] {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) as Media[] : [];
  } catch {
    return [];
  }
}

export function useWatchlist() {
  const [items, setItems] = useState<Media[]>(readWatchlist);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const has = useCallback((id: number) => items.some((item) => item.id === id), [items]);
  const toggle = useCallback((media: Media) => {
    setItems((current) => current.some((item) => item.id === media.id)
      ? current.filter((item) => item.id !== media.id)
      : [media, ...current]);
  }, []);
  const remove = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);
  const clear = useCallback(() => setItems([]), []);

  return { items, has, toggle, remove, clear };
}