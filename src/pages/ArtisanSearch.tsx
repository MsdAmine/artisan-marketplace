import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, MapPin, User, Loader2, AlertCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

import type { ArtisanSummary } from "@/api/artisans";
import { searchArtisans } from "@/api/artisans";

export default function ArtisanSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<ArtisanSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const currentQuery = searchParams.get("q")?.trim() || "";
    if (!currentQuery) {
      setResults([]);
      return;
    }

    async function fetchResults() {
      try {
        setLoading(true);
        setError(null);
        const artisans = await searchArtisans(currentQuery);
        setResults(artisans);
      } catch (err) {
        console.error("Failed to search artisans", err);
        setError("Impossible d'effectuer la recherche pour le moment.");
      } finally {
        setLoading(false);
      }
    }

    void fetchResults();
  }, [searchParams]);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    setSearchParams(trimmed ? { q: trimmed } : {});
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Recherche d'artisans</p>
            <h1 className="text-3xl font-semibold">Trouver un artisan</h1>
          </div>
          <form
            onSubmit={onSubmit}
            className="flex items-center gap-3 w-full sm:w-auto"
          >
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nom de l'artisan"
                className="pl-9"
              />
            </div>
            <Button type="submit" disabled={!query.trim()}>
              Rechercher
            </Button>
          </form>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Recherche en cours...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && searchParams.get("q") && results.length === 0 && (
          <div className="flex items-center gap-3 text-muted-foreground">
            <User className="h-5 w-5" />
            <span>Aucun artisan trouvé pour "{searchParams.get("q")}".</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((artisan) => (
            <Card key={artisan._id} className="rounded-xl border-border">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={artisan.avatar} />
                    <AvatarFallback>
                      {artisan.name?.charAt(0)?.toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{artisan.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{artisan.location || "Localisation inconnue"}</span>
                    </div>
                  </div>
                </div>

                {artisan.bio ? (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {artisan.bio}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Cet artisan n'a pas encore ajouté de description.
                  </p>
                )}

                <Button asChild className="w-full">
                  <Link to={`/artisan/${artisan._id}`}>Voir le profil</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
