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

  /* --------------------------- */
  /*      Loading State          */
  /* --------------------------- */
  if (loading)
    return (
      <p className="text-center mt-10 text-secondary animate-pulse">
        Chargement...
      </p>
    );

  /* --------------------------- */
  /*      Empty Cart State       */
  /* --------------------------- */
  if (!cart.items.length)
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6">
        <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center mb-6 shadow-inner">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            strokeWidth="2"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9h14l-2-9M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
        </div>

        <h2 className="text-xl font-semibold tracking-tight">
          Votre panier est vide
        </h2>
        <p className="text-secondary mt-2">
          Ajoutez un produit pour continuer.
        </p>
      </div>
    );

  /* --------------------------- */
  /*           Cart UI           */
  /* --------------------------- */

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 pt-12 pb-32 relative">
        {/* Title */}
        <h1 className="text-3xl font-semibold tracking-tight text-center mb-8">
          🛒 Votre Panier
        </h1>

        {/* Cart Items */}
        <div className="space-y-4">
          {cart.items.map((item: any) => (
            <Card
              key={item.productId}
              className={`rounded-xl border border-border shadow-sm hover:shadow-lg ${fade}`}
            >
              <CardContent className="p-5 flex items-center gap-5">
                {/* IMAGE */}
                <img
                  src={item.image || "https://via.placeholder.com/80"}
                  className="w-20 h-20 rounded-lg object-cover shadow-sm bg-gray-50"
                />

                {/* PRODUCT INFO */}
                <div className="flex-1">
                  <h2 className="text-lg font-medium">{item.productName}</h2>
                  <p className="text-secondary">{item.unitPrice} MAD</p>
                </div>

                {/* QUANTITY */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="w-8 h-8 rounded-lg"
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
                    className="w-8 h-8 rounded-lg"
                    onClick={async () => {
                      await updateQuantity(item.productId, item.quantity + 1);
                      refresh();
                    }}
                  >
                    +
                  </Button>
                </div>

                {/* SUBTOTAL */}
                <div className="w-28 text-right font-semibold">
                  {item.subtotal} MAD
                </div>

                {/* DELETE */}
                <Button
                  variant="destructive"
                  className="w-10 h-10 rounded-lg"
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

        {/* Sticky Footer */}
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-border shadow-lg px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-semibold">
            Total: {cart.totalAmount} MAD
          </span>

          <Button
            className="px-6 py-3 text-lg rounded-lg"
            onClick={() => setCheckoutOpen(true)}
          >
            Valider la commande
          </Button>
        </div>

        {/* Checkout Modal */}
        <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
          <DialogContent className="max-w-md rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Confirmer votre commande
              </DialogTitle>
            </DialogHeader>

            <p className="text-center mt-3 text-secondary">
              Montant total :
              <span className="ml-1 font-bold text-primary">
                {cart.totalAmount} MAD
              </span>
            </p>

            <Button
              className="w-full mt-6 py-3 text-lg rounded-lg"
              onClick={async () => {
                await createOrder();

                toast({
                  title: "Commande validée !",
                  description: "Votre commande a été enregistrée.",
                });

                setCheckoutOpen(false);
                refresh();
              }}
            >
              Confirmer
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
