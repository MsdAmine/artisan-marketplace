// src/api/recommendations.ts
const BASE = "http://localhost:3000/api";

export async function getRecommendations(userId: string) {
  const res = await fetch(`${BASE}/recommendations/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch recommendations");
  return res.json();
}
