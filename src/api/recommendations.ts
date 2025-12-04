// src/api/recommendations.ts
const BASE = "http://localhost:3000/api";

export async function getRecommendations(userId: string) {
  const res = await fetch(`${BASE}/recommendations/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch recommendations");
  return res.json();
}

type InteractionPayload = {
  userId: string;
  productId: string;
  action: "view" | "add_to_cart" | "purchase" | string;
};

export async function trackInteraction(payload: InteractionPayload) {
  await fetch(`${BASE}/recommendations/track`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
