import { useEffect, useState } from "react";
import { API_BASE } from "@/api/client";

const artisanNameCache = new Map<string, string>();

export function useArtisanName(artisanId?: string) {
  const [name, setName] = useState<string | null>(
    artisanId ? artisanNameCache.get(artisanId) ?? null : null
  );

  useEffect(() => {
    if (!artisanId) return;

    // If we already have it cached, use it immediately
    if (artisanNameCache.has(artisanId)) {
      setName(artisanNameCache.get(artisanId) || null);
      return;
    }

    let isCancelled = false;

    fetch(`${API_BASE}/artisans/${artisanId}/profile`)
      .then((res) => res.ok ? res.json() : Promise.reject(res))
      .then((data) => {
        if (isCancelled) return;

        const artisanName = data?.artisan?.name;
        if (artisanName) {
          artisanNameCache.set(artisanId, artisanName);
          setName(artisanName);
        }
      })
      .catch((err) => {
        console.error("Failed to load artisan name", err);
      });

    return () => {
      isCancelled = true;
    };
  }, [artisanId]);

  return name;
}

