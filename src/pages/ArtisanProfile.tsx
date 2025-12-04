import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
  Heart,
  Share2,
  Filter,
  Grid3x3,
  List,
  TrendingUp,
  CheckCircle,
  Shield,
  Truck,
} from "lucide-react";

// Define the assumed structure for the current user object
interface CurrentUser {
  id: string;
  name?: string;
  email?: string;
}

// Define the assumed structure for the profile data
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
  const [profile, setProfile] = useState<ArtisanProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [activeTab, setActiveTab] = useState("products");

  // Mock current user for demo (replace with actual auth)
  const currentUser: CurrentUser | null = {
    id: "mock-user-123",
    name: "John Doe",
    email: "john@example.com",
  };

  useEffect(() => {
    if (id) {
      fetchProfile();
    }
  }, [id]);

  async function fetchProfile() {
    try {
      // Using mock data for demonstration
      const mockProfile: ArtisanProfileData = {
        artisan: {
          _id: id || "1",
          name: "Ahmed Berrada",
          avatar: "https://via.placeholder.com/150",
          location: "Marrakech, Maroc",
          bio: "Artisan spécialisé dans la création de tapis berbères traditionnels depuis plus de 15 ans. Chaque pièce est unique et faite à la main avec des matériaux naturels.",
          email: "ahmed.berrada@artisanat.ma",
          phone: "+212 6 12 34 56 78",
          website: "www.berradacarpets.ma",
          joinedDate: "2019-03-15T10:30:00Z",
        },
        products: Array(8)
          .fill(null)
          .map((_, i) => ({
            _id: `prod-${i}`,
            name:
              i === 0 ? "Tapis berbère premium" : `Tapis traditionnel ${i + 1}`,
            description:
              "Tapis fait main avec des motifs traditionnels berbères",
            price: 890 + i * 100,
            stock: 10 - i,
            image: "https://via.placeholder.com/300",
            category: "Textile",
            artisan: "Ahmed Berrada",
          })),
        stats: {
          followers: 1245,
          isFollowing: false,
          totalSales: 189,
          totalProducts: 8,
          averageRating: 4.8,
        },
      };

      // For real API call, uncomment:
      // const query = currentUser ? `?userId=${currentUser.id}` : "";
      // const res = await fetch(`http://localhost:3000/api/artisans/${id}/profile${query}`);
      // const data = await res.json();

      setProfile(mockProfile);
    } catch (err) {
      console.error("Error fetching artisan profile:", err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleFollow() {
    if (!currentUser || !currentUser.id) {
      setAuthRequired(true);
      return;
    }

    setFollowLoading(true);
    const action = profile!.stats.isFollowing ? "unfollow" : "follow";

    try {
      // For real API call, uncomment:
      // await fetch(`http://localhost:3000/api/artisans/${id}/${action}`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ userId: currentUser.id }),
      // });

      // Update local state
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
      console.error("Error toggling follow status:", err);
    } finally {
      setFollowLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!profile || !profile.artisan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="rounded-apple border-border">
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Artisan introuvable
            </h2>
            <p className="text-muted-foreground mb-6">
              L'artisan que vous recherchez n'existe pas ou a été supprimé.
            </p>
            <Button asChild className="rounded-apple">
              <a href="/">Retour à l'accueil</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { artisan, products, stats } = profile;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Auth Required Message */}
        {authRequired && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-apple p-4 flex items-center justify-between">
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
              className="h-8 w-8 hover:bg-amber-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Profile Header */}
        <div className="flex flex-col lg:flex-row gap-8 mb-10">
          {/* Left Column - Artisan Info */}

          <div className="lg:w-2/3">
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border border-border rounded-apple p-8 mb-6">
              <div className="flex items-start gap-6">
                <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                  <AvatarImage src={artisan.avatar} />
                  <AvatarFallback className="text-2xl">
                    {artisan.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-semibold tracking-tight">
                          {artisan.name}
                        </h1>
                        <Badge className="rounded-full bg-primary text-primary-foreground">
                          Artisan vérifié
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {artisan.location}
                        </span>
                        <span className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {stats.followers.toLocaleString()} abonnés
                        </span>
                        <span className="flex items-center gap-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {stats.averageRating} ({stats.totalSales} ventes)
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-6">{artisan.bio}</p>

                  <div className="flex items-center gap-4">
                    {/* If viewing your own profile → show Edit button */}
                    {currentUser && currentUser.id === artisan._id ? (
                      <Button
                        variant="outline"
                        className="rounded-apple"
                        onClick={() =>
                          console.log("Redirect to profile edit page")
                        }
                        // later: onClick={() => navigate(`/artisan/${artisan._id}/edit`)}
                      >
                        Modifier le profil
                      </Button>
                    ) : (
                      // If viewing someone else's profile → show Follow button
                      <Button
                        onClick={toggleFollow}
                        disabled={followLoading}
                        variant={stats.isFollowing ? "outline" : "default"}
                        className="rounded-apple"
                      >
                        {stats.isFollowing ? "Suivi" : "Suivre"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className="lg:w-1/3">
            <Card className="rounded-apple border-border sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Statistiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Produits actifs</span>
                  <span className="font-semibold flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    {stats.totalProducts}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Total des ventes
                  </span>
                  <span className="font-semibold flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    {stats.totalSales}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Note moyenne</span>
                  <span className="font-semibold flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {stats.averageRating}/5
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Depuis</span>
                  <span className="font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {artisan.joinedDate
                      ? new Date(artisan.joinedDate).getFullYear()
                      : "2019"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="rounded-apple border-border mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {artisan.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`mailto:${artisan.email}`}
                      className="text-sm hover:text-primary"
                    >
                      {artisan.email}
                    </a>
                  </div>
                )}

                {artisan.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`tel:${artisan.phone}`}
                      className="text-sm hover:text-primary"
                    >
                      {artisan.phone}
                    </a>
                  </div>
                )}

                {artisan.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={artisan.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:text-primary"
                    >
                      {artisan.website}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Products Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight mb-2">
                Créations
              </h2>
              <p className="text-muted-foreground">
                {products.length} produit{products.length > 1 ? "s" : ""}{" "}
                disponible{products.length > 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex border border-border rounded-apple overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  className="h-9 w-9 rounded-none border-r border-border"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  className="h-9 w-9 rounded-none"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="rounded-apple gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtrer
              </Button>
            </div>
          </div>

          {products.length > 0 ? (
            <div
              className={`gap-6 ${
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "space-y-4"
              }`}
            >
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  p={product}
                  viewMode={viewMode}
                />
              ))}
            </div>
          ) : (
            <Card className="rounded-apple border-border">
              <CardContent className="p-12 text-center">
                <Package className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                  Aucun produit disponible
                </h3>
                <p className="text-muted-foreground">
                  Cet artisan n'a pas encore publié de produits.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
