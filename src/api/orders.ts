export async function createOrder() {
  const res = await fetch("http://localhost:3000/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Order API Error:", text);
    throw new Error("Erreur lors de la création de la commande");
  }

  return res.json();
}
