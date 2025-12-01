import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function Cart() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Load cart from backend
  async function loadCart() {
    const res = await fetch("http://localhost:3000/api/cart");
    const data = await res.json();
    setCart(data);
    setLoading(false);
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function placeOrder() {
    try {
      setPlacingOrder(true);
      const res = await fetch("http://localhost:3000/api/orders", {
        method: "POST"
      });

      const data = await res.json();
      alert("Commande créée avec succès !");
      loadCart(); // refresh cart
    } catch (err) {
      alert("Erreur lors de la commande");
    }
    setPlacingOrder(false);
  }

  if (loading) return <p className="p-10">Chargement...</p>;

  if (!cart || cart.items.length === 0)
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl mb-4">Votre panier est vide</h2>
        <a href="/" className="text-primary underline">
          Continuer vos achats
        </a>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-6">Votre Panier</h1>

        <div className="space-y-6">
          {cart.items.map((item: any) => (
            <div
              key={item.productId}
              className="flex items-center justify-between border-b pb-4"
            >
              <div>
                <p className="font-semibold">{item.productName}</p>
                <p className="text-sm text-gray-500">
                  {item.quantity} x {item.unitPrice} MAD
                </p>
              </div>

              <p className="font-bold">{item.subtotal} MAD</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between items-center">
          <p className="text-xl font-bold">
            Total: <span className="text-primary">{cart.totalAmount} MAD</span>
          </p>

          <Button
            onClick={placeOrder}
            disabled={placingOrder}
            className="px-6 py-2"
          >
            {placingOrder ? "Commande..." : "Passer la commande"}
          </Button>
        </div>
      </div>
    </div>
  );
}
