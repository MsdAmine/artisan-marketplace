import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Cart() {
  const [cart, setCart] = useState(null);

  const load = () => apiGet("/cart").then(setCart);

  useEffect(load, []);

  if (!cart) return null;

  return (
    <div className="max-w-xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-semibold">Votre panier</h1>

      {cart.items.length === 0 && (
        <p className="text-gray-500 text-sm">Panier vide.</p>
      )}

      {cart.items.map((i) => (
        <Card key={i.productId} className="p-4 flex justify-between">
          <div>
            <p className="font-medium">{i.productName}</p>
            <p className="text-xs text-gray-500">
              {i.quantity} × {i.unitPrice} MAD
            </p>
          </div>
          <p className="font-semibold">{i.subtotal} MAD</p>
        </Card>
      ))}

      <div className="flex justify-between text-lg font-semibold">
        <span>Total</span>
        <span>{cart.totalAmount} MAD</span>
      </div>

      <Button
        className="w-full"
        onClick={() => apiPost("/orders", {}).then(load)}
      >
        Valider la commande
      </Button>
    </div>
  );
}
