// src/api/productRatings.ts (INCHANGÉ - CORRESPOND À VOTRE CODE FOURNI)

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

// Définition du type de réponse attendue du backend
export type AverageRatingResponse = {
    average: number;
    totalReviews: number;
};

// Nouvelle fonction pour récupérer la note moyenne d'un produit
export async function getProductAverageRating(
    productId: string
): Promise<AverageRatingResponse> {
    // L'endpoint est supposé être public et ne nécessite pas authHeaders
    const res = await fetch(`${API_BASE}/products/${productId}/rating`);

    if (!res.ok) {
        // Si l'endpoint échoue (par exemple 404), on retourne 0.0 pour éviter un crash
        console.error(
            `Failed to fetch average rating for product ${productId}. Status: ${res.status}`
        );
        // Si la note est indisponible, retourne 0/0
        return { average: 0, totalReviews: 0 };
    }

    // Si la réponse est OK, retourne les données JSON (average et totalReviews)
    return res.json();
}