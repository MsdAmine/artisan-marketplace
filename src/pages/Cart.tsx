import { useEffect, useState } from "react";
import { getCart, updateQuantity, removeItem } from "@/api/cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { createOrder } from "@/api/orders";

// ANIMATION CLASSES
const fade = "transition-all duration-300 ease-in-out";

export default function Cart() {
  const { toast } = useToast();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  async function refresh() {
    setLoading(true);
    const data = await getCart();
    setCart(data);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  if (loading)
    return <p className="text-center mt-10 animate-pulse">Chargement...</p>;

  if (!cart.items.length)
    return (
      <div className="flex flex-col items-center mt-20 text-gray-500">
        <img
          src="https://lottie.host/c3e31dcb-c757-4bbd-a8de-60d7b69a5dca/Pbn6pxYyO6.json"
          className="w-72"
        />
        <p className="mt-5 text-xl font-medium">Votre panier est vide</p>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto py-10 pb-28 relative">
      <h1 className="text-3xl font-bold mb-6 text-center">🛒 Votre Panier</h1>

      <div className="space-y-4">
        {cart.items.map((item: any) => (
          <Card
            key={item.productId}
            className={`shadow-sm border rounded-xl ${fade} hover:shadow-lg`}
          >
            <CardContent className="p-5 flex items-center justify-between gap-5">
              {/* IMAGE */}
              <img
                src={item.image || "https://via.placeholder.com/80"}
                className="w-20 h-20 rounded-lg object-cover shadow-sm"
              />

              {/* NAME + PRICE */}
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{item.productName}</h2>
                <p className="text-gray-500">{item.unitPrice} MAD</p>
              </div>

              {/* QUANTITY */}
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

              {/* SUBTOTAL */}
              <div className="w-28 text-right font-bold">
                {item.subtotal} MAD
              </div>

              {/* DELETE */}
              <Button
                variant="destructive"
                className="w-10 h-10"
                onClick={async () => {
                  await removeItem(item.productId);
                  toast({
                    title: "Item retiré",
                    description: `${item.productName} a été supprimé du panier.`,
                  });
                  refresh();
                }}
              >
                ✕
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* STICKY FOOTER */}
      <div className="fixed bottom-0 left-0 w-full bg-white shadow-xl py-4 px-6 flex items-center justify-between border-t">
        <span className="text-xl font-bold">Total: {cart.totalAmount} MAD</span>

        <Button
          className="px-6 py-3 text-lg font-semibold"
          onClick={() => setCheckoutOpen(true)}
        >
          Valider la commande
        </Button>
      </div>

      {/* CHECKOUT MODAL */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer votre commande</DialogTitle>
          </DialogHeader>

          <p className="text-center mt-3 text-gray-600">
            Montant total :{" "}
            <span className="font-bold">{cart.totalAmount} MAD</span>
          </p>

          <Button
            className="w-full mt-6 py-3 text-lg"
            onClick={async () => {
              const result = await createOrder(); // <-- CALL BACKEND

              toast({
                title: "Commande validée !",
                description: "Votre commande a été enregistrée.",
              });

              setCheckoutOpen(false);
            }}
          >
            Confirmer
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
