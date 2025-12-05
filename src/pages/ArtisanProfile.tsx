import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import ProductCard from "@/components/ui/ProductCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  MapPin,
  Calendar,
  Users,
  X,
  Package,
  Star,
  ShoppingBag,
  Globe,
  Mail,
  Phone,
  Filter,
  Grid3x3,
  List,
  Shield,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

interface ArtisanProfileData {
  artisan: {
    _id: string;
    name: string;
    avatar: string;
    location: string;   
    bio: string;
    email?: string;
    phone?: string;
    website?: string;
    joinedDate?: string;
  };
  products: any[];
  stats: {
    followers: number;
    isFollowing: boolean;
    totalSales: number;
    totalProducts: number;
    averageRating: number;
  };
}

export default function ArtisanProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState<ArtisanProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [error, setError] = useState<string | null>(null);

  const apiBaseUrl =
    import.meta.env.VITE_API_URL?.replace(/\/$/, "") || window.location.origin;

  // -----------------------------
  //  LOAD ARTISAN PROFILE
  // -----------------------------
  useEffect(() => {
    if (!id) return;
    fetchProfile();
  }, [id, currentUser, apiBaseUrl]);

  async function fetchProfile() {
    try {
      setError(null);
      const query = currentUser ? `?userId=${currentUser.id}` : "";
      const res = await fetch(
        new URL(`/api/artisans/${id}/profile${query}`, apiBaseUrl).toString()
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch profile (status ${res.status})`);
      }

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("Unexpected response format from profile endpoint");
      }

      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(
        "Impossible de charger le profil de l'artisan pour le moment. Veuillez réessayer plus tard."
      );
    } finally {
      setLoading(false);
    }
  }

  // -----------------------------
  //  FOLLOW / UNFOLLOW
  // -----------------------------
  async function toggleFollow() {
    if (!currentUser) {
      setAuthRequired(true);
      return;
    }

    if (currentUser.id === profile?.artisan._id) return; // prevent self-follow

    setFollowLoading(true);
    const action = profile!.stats.isFollowing ? "unfollow" : "follow";

    try {
      await fetch(
        new URL(`/api/artisans/${id}/${action}`, apiBaseUrl).toString(),
        {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id }),
        }
      );

      setProfile((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          stats: {
            ...prev.stats,
            isFollowing: !prev.stats.isFollowing,
            followers: prev.stats.isFollowing
              ? prev.stats.followers - 1
              : prev.stats.followers + 1,
          },
        };
      });
    } catch (err) {
      console.error("Error toggling follow:", err);
    } finally {
      setFollowLoading(false);
    }
  }

  // -----------------------------
  //  LOADING UI
  // -----------------------------
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Card>
          <CardContent className="text-center p-10 space-y-4">
            <Package className="h-16 w-16 text-muted-foreground mx-auto" />
            <h2 className="text-2xl font-semibold">Profil indisponible</h2>
            <p className="text-muted-foreground max-w-md">{error}</p>
            <Button variant="outline" onClick={() => navigate(-1)}>
              Retour
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // -----------------------------
  //  ARTISAN NOT FOUND
  // -----------------------------
  if (!profile || !profile.artisan) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Card>
          <CardContent className="text-center p-10">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Artisan introuvable</h2>
            <p className="text-muted-foreground">
              Cet artisan n'existe pas ou a été supprimé.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---------------------------------
  const { artisan, products, stats } = profile;

  const isOwnProfile = currentUser && currentUser.id === artisan._id;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* LOGIN REQUIRED ALERT */}
        {authRequired && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-amber-600" />
              <span className="font-medium text-amber-900">
                Veuillez vous connecter pour suivre cet artisan
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setAuthRequired(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/*                           PROFILE HEADER                         */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          {/* Left Side */}
          <div className="lg:w-2/3">
            <div className="border rounded-xl p-8 bg-gradient-to-r from-primary/5 to-secondary/5">
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                  <AvatarImage src={artisan.avatar} />
                  <AvatarFallback>{artisan.name.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    {/* Name + badges */}
                    <div>
                      <h1 className="text-3xl font-semibold">{artisan.name}</h1>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
                        <span className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" /> {artisan.location}
                        </span>
                        <span className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {stats.followers} abonnés
                        </span>
                        <span className="flex items-center gap-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {stats.averageRating} ({stats.totalSales} ventes)
                        </span>
                      </div>
                    </div>

                    {/* ⭐ EDIT BUTTON or FOLLOW BUTTON */}
                    {isOwnProfile ? (
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/artisan/${artisan._id}/edit`)}
                      >
                        Modifier le profil
                      </Button>
                    ) : (
                      <Button
                        onClick={toggleFollow}
                        disabled={followLoading}
                        variant={stats.isFollowing ? "outline" : "default"}
                      >
                        {stats.isFollowing ? "Suivi" : "Suivre"}
                      </Button>
                    )}
                  </div>

                  <p className="text-muted-foreground mt-4">{artisan.bio}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side Stats */}
          <div className="lg:w-1/3">
            <Card>
              <CardHeader>
                <CardTitle>Statistiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Stat
                  label="Produits actifs"
                  value={stats.totalProducts}
                  icon={Package}
                />
                <Stat
                  label="Total des ventes"
                  value={stats.totalSales}
                  icon={ShoppingBag}
                />
                <Stat
                  label="Note moyenne"
                  value={`${stats.averageRating}/5`}
                  icon={Star}
                />
                <Stat
                  label="Depuis"
                  value={new Date(artisan.joinedDate || "").getFullYear()}
                  icon={Calendar}
                />
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {artisan.email && (
                  <ContactRow
                    icon={Mail}
                    text={artisan.email}
                    link={`mailto:${artisan.email}`}
                  />
                )}
                {artisan.phone && (
                  <ContactRow
                    icon={Phone}
                    text={artisan.phone}
                    link={`tel:${artisan.phone}`}
                  />
                )}
                {artisan.website && (
                  <ContactRow
                    icon={Globe}
                    text={artisan.website}
                    link={artisan.website}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/*                           PRODUCTS GRID                          */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-semibold">Créations</h2>
              <p className="text-muted-foreground">
                {products.length} produit{products.length > 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* View Switch */}
              <div className="flex border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>

                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" /> Filtrer
              </Button>
            </div>
          </div>

          {products.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              {products.map((p) => (
                <ProductCard key={p._id} p={p} viewMode={viewMode} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Aucun produit disponible
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

/* Small UI Helpers */
function Stat({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {value}
      </span>
    </div>
  );
}

function ContactRow({ icon: Icon, text, link }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <a href={link} className="text-sm hover:text-primary">
        {text}
      </a>
    </div>
  );
}
