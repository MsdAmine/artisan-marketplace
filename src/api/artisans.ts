import { API_BASE } from "./client";

export interface ArtisanSummary {
  _id: string;
  name: string;
  avatar?: string;
  location?: string;
  bio?: string;
  followers?: number;
  rating?: number;   
}

export async function searchArtisans(query: string): Promise<ArtisanSummary[]> {
  const res = await fetch(
    `${API_BASE}/artisans/search?q=${encodeURIComponent(query.trim())}`
  );

  if (!res.ok) {
    throw new Error(`Search failed with status ${res.status}`);
  }

  const data = await res.json();
  return data.artisans as ArtisanSummary[];
}
