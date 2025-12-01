import { useEffect, useState } from "react";
import { apiGet } from "../api/client";

export default function Stats() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/stats/sales-by-artisan")
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Chargement des statistiques...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Statistiques Marketplace</h1>

      {stats.length === 0 ? (
        <p className="text-slate-500">Aucune donnée disponible.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {stats.map((row) => (
            <div
              key={row.artisanId}
              className="bg-white border rounded-xl p-4 shadow-sm"
            >
              <h2 className="font-semibold text-slate-800 mb-2">
                Artisan: {row.artisanName}
              </h2>

              <p className="text-sm text-slate-600">
                Total ventes:{" "}
                <span className="font-bold text-indigo-600">
                  {row.totalSales} MAD
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
      )}
    </div>
  );
}