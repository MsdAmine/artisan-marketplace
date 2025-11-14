import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api/client";
import CartItem from "../components/CartItem";

export default function Cart() {
  const [cart, setCart] = useState(null);

  function loadCart() {
    apiGet("/cart").then(setCart);
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function handleCheckout() {
    await apiPost("/orders", {});
    loadCart();
  }

  if (!cart) return <p>Chargement du panier...</p>;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-4">Panier</h1>
      {cart.items.length === 0 && <p>Votre panier est vide.</p>}
      {cart.items.map((item) => (
        <CartItem key={item.productId} item={item} />
      ))}
      <div className="mt-4 flex items-center justify-between">
        <p className="font-semibold">
          Total: {cart.totalAmount} {cart.currency}
        </p>
        <button
          onClick={handleCheckout}
          className="rounded-lg px-4 py-2 bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
          disabled={cart.items.length === 0}
        >
          Valider la commande
        </button>
      </div>
    </div>
  );
}