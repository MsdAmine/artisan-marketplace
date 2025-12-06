import { useEffect, useState } from "react";
import { apiGet } from "../api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type SalesStat = {
  artisanId: string;
  artisanName: string;
  totalSales: number;
  totalOrders: number;
};

export default function Stats() {
  const [stats, setStats] = useState<SalesStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/stats/sales-by-artisan")
      .then((data) =>
        setStats(
          Array.isArray(data)
            ? data.map((row: any) => ({
                artisanId: row._id || row.artisanId,
                artisanName: row.artisanName || "",
                totalSales: row.totalSales,
                totalOrders: row.totalOrders,
              }))
            : []
        )
      )
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = stats.reduce((sum, row) => sum + row.totalSales, 0);
  const totalOrders = stats.reduce((sum, row) => sum + row.totalOrders, 0);

  const sortedBySales = [...stats].sort((a, b) => b.totalSales - a.totalSales);
  const topArtisans = sortedBySales.slice(0, 5);

  const maxSales = Math.max(...stats.map((row) => row.totalSales), 1);
  const maxOrders = Math.max(...stats.map((row) => row.totalOrders), 1);

  if (loading) return <p>Chargement des statistiques...</p>;

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-primary">
      <div className="max-w-7xl mx-auto px-8 py-12 space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Statistiques Marketplace</h1>
          <p className="text-slate-600">Vue d'ensemble des performances des artisans.</p>
        </div>

        {stats.length === 0 ? (
          <p className="text-slate-500">Aucune donnée disponible.</p>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-600">
                    Revenu total généré
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold text-slate-900">
                    {totalRevenue.toLocaleString("fr-MA", {
                      style: "currency",
                      currency: "MAD",
                      minimumFractionDigits: 0,
                    })}
                  </p>
                  <p className="text-sm text-slate-500">Toutes commandes confondues</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-600">
                    Commandes totales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold text-slate-900">{totalOrders}</p>
                  <p className="text-sm text-slate-500">Réparties entre tous les artisans</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-600">Top vendeur</CardTitle>
                </CardHeader>
                <CardContent>
                  {sortedBySales[0] ? (
                    <div className="space-y-1">
                      <p className="text-lg font-semibold text-slate-900">
                        {sortedBySales[0].artisanName}
                      </p>
                      <p className="text-sm text-slate-600">
                        {sortedBySales[0].totalSales.toLocaleString("fr-MA", {
                          style: "currency",
                          currency: "MAD",
                          minimumFractionDigits: 0,
                        })}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Aucun vendeur disponible.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Ventes par artisan</CardTitle>
                  <p className="text-sm text-slate-500">
                    Classement des 5 meilleurs artisans (ventes en MAD).
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topArtisans.map((row) => (
                    <div key={row.artisanId} className="space-y-2">
                      <div className="flex items-center justify-between text-sm font-medium text-slate-800">
                        <span>
                          Artisan: {row.artisanId}
                          {row.artisanName
                            ? ` (${row.artisanName})`
                            : " (Nom inconnu)"}
                        </span>
                        <span className="text-slate-600">
                          {row.totalSales.toLocaleString("fr-MA", {
                            style: "currency",
                            currency: "MAD",
                            minimumFractionDigits: 0,
                          })}
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
                          style={{ width: `${(row.totalSales / maxSales) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Volume de commandes</CardTitle>
                  <p className="text-sm text-slate-500">
                    Comparatif du nombre de commandes par artisan.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topArtisans.map((row) => (
                    <div key={row.artisanId} className="space-y-2">
                      <div className="flex items-center justify-between text-sm font-medium text-slate-800">
                        <span>
                          Artisan: {row.artisanId}
                          {row.artisanName
                            ? ` (${row.artisanName})`
                            : " (Nom inconnu)"}
                        </span>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-800">
                          {row.totalOrders} commandes
                        </Badge>
                      </div>
                      <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${(row.totalOrders / maxOrders) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card className="border border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Détails par artisan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {stats.map((row) => (
                    <div
                      key={row.artisanId}
                      className="bg-white border rounded-xl p-4 shadow-sm space-y-2"
                    >
                      <h2 className="font-semibold text-slate-800">
                        Artisan: {row.artisanId}
                        {row.artisanName
                          ? ` (${row.artisanName})`
                          : " (Nom inconnu)"}
                      </h2>

                      <p className="text-sm text-slate-600">
                        Total ventes:{" "}
                        <span className="font-bold text-indigo-600">
                          {row.totalSales.toLocaleString("fr-MA", {
                            style: "currency",
                            currency: "MAD",
                            minimumFractionDigits: 0,
                          })}
                        </span>
                      </p>

                      <p className="text-sm text-slate-600">
                        Nombre de commandes:{" "}
                        <span className="font-bold text-indigo-600">
                          {row.totalOrders}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
