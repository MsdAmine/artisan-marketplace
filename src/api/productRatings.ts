import { API_BASE } from "./client";
import { authHeaders } from "./authHeaders";

export type ProductRatingPayload = {
  productId: string;
  rating: number;
  orderItemId?: string | null;
};

export async function submitProductRatings(
  orderId: string,
  ratings: ProductRatingPayload[]
) {
  const res = await fetch(`${API_BASE}/product-ratings`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ orderId, ratings }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `Failed to submit ratings (status ${res.status}): ${errorText}`
    );
  }

  return res.json();
}
