// src/hooks/useProductRating.js (MODIFIÉ)

import { useState, useEffect } from 'react';
// ✅ CORRECTION DU CHEMIN RELATIF
import { getProductAverageRating } from '@/api/productRatings';

export function useProductRating(productId) {
    const [rating, setRating] = useState({ average: 0, totalReviews: 0 });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!productId) return;

        async function fetchRating() {
            setLoading(true);
            try {
                // Utilise la nouvelle fonction pour récupérer la note
                const data = await getProductAverageRating(productId);
                
                setRating({
                    average: data.average || 0,
                    totalReviews: data.totalReviews || 0
                });
            } catch (error) {
                console.error("Error fetching product rating:", error);
                setRating({ average: 0, totalReviews: 0 });
            } finally {
                setLoading(false);
            }
        }

        fetchRating();
    }, [productId]);

    return rating;
}