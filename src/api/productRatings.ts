import { API_BASE } from "./client";
import { authHeaders } from "./authHeaders";

export type ProductRatingPayload = {
  productId: string;
  rating: number;
  orderItemId?: string | null;
};

export type ProductRatingRecord = {
  _id: string;
  userId: string;
  orderId: string;
  productId: string;
  rating: number;
  orderItemId?: string | null;
  productName?: string | null;
  quantity?: number;
};

export async function getProductRatings(orderId?: string) {
  const params = orderId ? `?orderId=${orderId}` : "";
  const res = await fetch(`${API_BASE}/product-ratings${params}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `Failed to fetch product ratings (status ${res.status}): ${errorText}`
    );
  }

  return res.json();
}

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
