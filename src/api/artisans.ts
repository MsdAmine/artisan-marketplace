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

export interface ArtisanProfile {
  _id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
}

export async function getArtisanProfile(
  artisanId: string
): Promise<ArtisanProfile> {
  const res = await fetch(`${API_BASE}/artisans/${artisanId}/profile`);

  if (!res.ok) {
    throw new Error(
      `Failed to fetch artisan ${artisanId} profile (status ${res.status})`
    );
  }

  return res.json();
}
