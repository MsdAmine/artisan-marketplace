import { useEffect, useMemo, useState } from "react";
import { getOrders } from "@/api/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Clock, Package, Truck } from "lucide-react";

const statusStyles: Record<string, string> = {
  processing: "bg-amber-100 text-amber-800 border-amber-200",
  shipped: "bg-blue-100 text-blue-800 border-blue-200",
  delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    minimumFractionDigits: 2,
  }).format(amount || 0);
}

function formatDate(date?: string) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getOrders();
        if (!cancelled) {
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err?.message ||
              "Impossible de récupérer les commandes. Vérifiez vos droits admin."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.totalAmount || 0),
      0
    );

    const byStatus = orders.reduce<Record<string, number>>((acc, order) => {
      const status = order.status || "processing";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return { totalOrders, totalRevenue, byStatus };
  }, [orders]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-slate-600">
        <Clock className="h-4 w-4 animate-spin" />
        <p>Chargement des commandes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="flex items-center gap-3 text-red-700 py-6">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-semibold">Erreur</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900">Gestion des commandes</h1>
        <p className="text-slate-600">
          Consultez toutes les commandes des clients et leur statut en temps réel.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Commandes totales
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-3xl font-semibold text-slate-900">
              {stats.totalOrders}
            </div>
            <Package className="h-9 w-9 text-primary" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Revenu cumulé
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-3xl font-semibold text-slate-900">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <Truck className="h-9 w-9 text-emerald-600" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Statuts en cours
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {Object.entries(stats.byStatus).map(([status, count]) => (
              <Badge
                key={status}
                variant="secondary"
                className={`${statusStyles[status] || ""} border`}
              >
                {status} · {count}
              </Badge>
            ))}
            {orders.length === 0 && (
              <p className="text-sm text-slate-500">Aucune commande pour le moment.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commandes récentes</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Commande</TableHead>
                <TableHead className="whitespace-nowrap">Client</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="whitespace-nowrap">Créée le</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500">
                    Aucune commande à afficher.
                  </TableCell>
                </TableRow>
              )}
              {orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium">
                    {order.orderNumber || order._id}
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {order.userId || "—"}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(order.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`${
                        statusStyles[order.status] || "bg-slate-100 text-slate-700 border"
                      } border`}
                    >
                      {order.status || "processing"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {formatDate(order.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
