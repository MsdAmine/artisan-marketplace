import { useEffect, useState } from "react";
import { searchArtisans, type ArtisanSummary } from "@/api/artisans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertCircle, Search } from "lucide-react";

export default function AdminArtisans() {
  const [query, setQuery] = useState("");
  const [artisans, setArtisans] = useState<ArtisanSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleSearch("");
  }, []);

  async function handleSearch(term: string) {
    setQuery(term);
    setLoading(true);
    setError(null);

    try {
      const data = await searchArtisans(term);
      setArtisans(data);
    } catch (err: any) {
      setError(
        err?.message || "Impossible de charger les artisans. Vérifiez l'API."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900">Artisans référencés</h1>
        <p className="text-slate-600">
          Consultez la liste des artisans actifs et leurs indicateurs clés.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={query}
              placeholder="Rechercher un artisan par nom"
              className="pl-10"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-3 text-red-700 py-4">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Liste des artisans ({artisans.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Artisan</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Followers</TableHead>
                <TableHead>Note moyenne</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-slate-500">
                    Chargement...
                  </TableCell>
                </TableRow>
              )}
              {!loading && artisans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-slate-500">
                    Aucun artisan trouvé.
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                artisans.map((artisan) => (
                  <TableRow key={artisan._id}>
                    <TableCell className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={artisan.avatar} alt={artisan.name} />
                        <AvatarFallback>
                          {artisan.name
                            ?.split(" ")
                            .map((part) => part[0])
                            .join("") || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-900">{artisan.name}</p>
                        <p className="text-sm text-slate-600 truncate max-w-xs">
                          {artisan.bio || "Aucune description"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-700">
                      {artisan.location || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-800">
                        {artisan.followers ?? 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-amber-50 text-amber-800">
                        {artisan.rating ? `${artisan.rating}/5` : "N/A"}
                      </Badge>
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
