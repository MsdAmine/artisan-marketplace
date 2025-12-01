export async function addToCart(productId: string, quantity: number = 1) {
  const res = await fetch("http://localhost:3000/api/cart/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, quantity }),
  });

  if (!res.ok) {
    throw new Error("Failed to add item to cart");
  }

  return await res.json();
}
