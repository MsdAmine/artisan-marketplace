import { useEffect, useState } from "react";
import { getCart, updateQuantity, removeItem } from "@/api/cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Cart() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const data = await getCart();
    setCart(data);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  if (loading) return <p className="text-center mt-10">Chargement...</p>;

  if (!cart.items.length)
    return <p className="text-center text-gray-500 mt-10">Votre panier est vide.</p>;

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">🛒 Panier</h1>

      <div className="space-y-4">
        {cart.items.map((item: any) => (
          <Card key={item.productId} className="shadow-sm border rounded-xl">
            <CardContent className="p-5 flex items-center justify-between gap-4">
              
              {/* Item name + price */}
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{item.productName}</h2>
                <p className="text-gray-500">{item.unitPrice} MAD</p>
              </div>

              {/* Quantity buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="w-8 h-8"
                  onClick={async () => {
                    if (item.quantity > 1) {
                      await updateQuantity(item.productId, item.quantity - 1);
                      refresh();
                    }
                  }}
                >
                  –
                </Button>

                <span className="w-6 text-center font-medium">
                  {item.quantity}
                </span>

                <Button
                  variant="outline"
                  className="w-8 h-8"
                  onClick={async () => {
                    await updateQuantity(item.productId, item.quantity + 1);
                    refresh();
                  }}
                >
                  +
                </Button>
              </div>

              {/* Subtotal */}
              <div className="w-28 text-right font-bold">
                {item.subtotal} MAD
              </div>

              {/* Delete */}
              <Button
                variant="destructive"
                className="w-10 h-10"
                onClick={async () => {
                  await removeItem(item.productId);
                  refresh();
                }}
              >
                ✕
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Total row */}
      <div className="text-right mt-8 text-2xl font-bold">
        Total: {cart.totalAmount} MAD
      </div>

      {/* Checkout button */}
      <div className="text-right mt-6">
        <Button className="px-6 py-3 text-lg font-semibold">
          Valider la commande
        </Button>
      </div>
    </div>
  );
}
