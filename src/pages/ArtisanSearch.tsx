import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  MapPin,
  User,
  Loader2,
  AlertCircle,
  Star,
  Users,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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

  const hasSearchQuery = searchParams.get("q");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-8 py-12">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-semibold tracking-tight mb-4">
            Découvrez nos Artisans
          </h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Trouvez l'artisan parfait pour vos projets parmi notre communauté de
            créateurs passionnés
          </p>

          {/* Enhanced Search Bar */}
          <div className="max-w-2xl mx-auto">
            <Card className="rounded-apple border-border shadow-lg">
              <CardContent className="p-6">
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Rechercher un artisan par nom, spécialité, localisation..."
                      className="pl-12 py-4 rounded-apple text-base border-2 focus:border-primary transition-colors"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <Button
                        type="submit"
                        disabled={!query.trim() || loading}
                        className="rounded-apple gap-2 px-6 py-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Recherche...
                          </>
                        ) : (
                          <>
                            <Search className="h-4 w-4" />
                            Rechercher
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-12 w-12 border-3 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">
              Recherche d'artisans en cours...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="rounded-apple border-border mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-red-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">
                    Erreur de recherche
                  </h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Results State */}
        {!loading && !error && hasSearchQuery && results.length === 0 && (
          <Card className="rounded-apple border-border">
            <CardContent className="p-12 text-center">
              <User className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                Aucun artisan trouvé
              </h3>
              <p className="text-muted-foreground mb-6">
                Aucun résultat pour "
                <span className="font-semibold">{searchParams.get("q")}</span>"
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery("");
                    setSearchParams({});
                  }}
                  className="rounded-apple"
                >
                  Voir tous les artisans
                </Button>
                <Button
                  variant="default"
                  onClick={() => setQuery("")}
                  className="rounded-apple"
                >
                  Nouvelle recherche
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Prompt to search */}
        {!loading && !error && !hasSearchQuery && (
          <Card className="rounded-apple border-border">
            <CardContent className="p-10 text-center space-y-4">
              <Search className="h-12 w-12 text-muted-foreground mx-auto" />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">
                  Recherchez un artisan pour voir les résultats
                </h3>
                <p className="text-muted-foreground">
                  Entrez un nom, une spécialité ou une localisation pour trouver
                  des artisans réels correspondant à votre recherche.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Grid */}
        {!loading && !error && hasSearchQuery && results.length > 0 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold tracking-tight mb-2">
                Résultats de recherche
              </h2>
              <p className="text-muted-foreground">
                {`${results.length} artisan${
                  results.length > 1 ? "s" : ""
                } trouvé${results.length > 1 ? "s" : ""}`}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((artisan) => {
                // Use safe access with optional chaining and fallbacks
                const artisanFollowers = artisan.followers ?? 0;
                const artisanRating = artisan.rating ?? 4.8;

                return (
                  <Card
                    key={artisan._id}
                    className="rounded-apple border-border hover:shadow-lg transition-all duration-300 group hover:-translate-y-1"
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Artisan Header */}
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <Avatar className="h-16 w-16 border-2 border-border group-hover:border-primary transition-colors">
                              <AvatarImage src={artisan.avatar} />
                              <AvatarFallback className="text-lg font-semibold">
                                {artisan.name?.charAt(0)?.toUpperCase() || "A"}
                              </AvatarFallback>
                            </Avatar>
                            <Badge
                              className="absolute -top-2 -right-2 rounded-full text-xs px-2 py-1"
                              variant="secondary"
                            >
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                              {artisanRating.toFixed(1)}
                            </Badge>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors mb-1">
                              {artisan.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                              <MapPin className="h-4 w-4" />
                              <span>
                                {artisan.location || "Localisation inconnue"}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Users className="h-3 w-3" />
                                {artisanFollowers.toLocaleString()} abonnés
                              </span>
                              <Badge
                                variant="outline"
                                className="rounded-full text-xs"
                              >
                                <Sparkles className="h-3 w-3 mr-1" />
                                Vérifié
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Bio */}
                        <div className="border-t border-border pt-4">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {artisan.bio ||
                              "Cet artisan n'a pas encore ajouté de description."}
                          </p>
                        </div>

                        {/* Action Button */}
                        <Button
                          asChild
                          className="w-full rounded-apple gap-2 group/btn"
                          variant="outline"
                        >
                          <Link to={`/artisan/${artisan._id}`}>
                            Voir le profil
                            <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Search Tips */}
        {hasSearchQuery && results.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Pas trouvé ce que vous cherchiez ? Essayez avec d'autres termes
              comme "poterie", "tapis", ou une ville spécifique.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
