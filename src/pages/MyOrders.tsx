import { useEffect, useState } from "react";
import { getOrders } from "@/api/orders";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function MyOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  async function loadOrders() {
    const data = await getOrders();
    setOrders(data);
    setLoading(false);
  }

  useEffect(() => {
    loadOrders();
  }, []);

  if (loading) return <p className="text-center mt-10">Chargement...</p>;

  if (!orders.length)
    return (
      <p className="text-center text-gray-500 mt-10">
        Vous n'avez aucune commande pour le moment.
      </p>
    );

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-primary">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="max-w-3xl mx-auto py-10">
          <h1 className="text-3xl font-bold mb-6 text-center">
            🧾 Mes Commandes
          </h1>

          <div className="space-y-4">
            {orders.map((order) => (
              <Card
                key={order._id}
                className="cursor-pointer hover:shadow-md transition-all"
                onClick={() => setSelectedOrder(order)}
              >
                <CardContent className="p-5 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold">
                      Commande du{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </h2>
                    <p className="text-gray-500">
                      {order.items.length} articles
                    </p>
                  </div>

                  <div className="text-lg font-bold">
                    {order.totalAmount} MAD
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ORDER DETAILS MODAL */}
          <Dialog
            open={!!selectedOrder}
            onOpenChange={() => setSelectedOrder(null)}
          >
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Détails de la commande</DialogTitle>
              </DialogHeader>

              {selectedOrder && (
                <div className="space-y-3 mt-3">
                  {selectedOrder.items.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between border-b pb-2"
                    >
                      <span>
                        {item.productName} x {item.quantity}
                      </span>
                      <span className="font-bold">{item.subtotal} MAD</span>
                    </div>
                  ))}

                  <div className="text-right mt-4 text-xl font-bold">
                    Total: {selectedOrder.totalAmount} MAD
                  </div>

                  <Button
                    className="mt-4 w-full"
                    onClick={() => setSelectedOrder(null)}
                  >
                    Fermer
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
