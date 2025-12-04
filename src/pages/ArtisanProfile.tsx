import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // Assuming react-router
import ProductCard from "@/components/ui/ProductCard";
import { Button } from "@/components/ui/button";
import { User, MapPin, Calendar, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ArtisanProfile() {
  const { id } = useParams(); // Get artisan ID from URL
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  // Get current user ID from local storage
  const currentUser = JSON.parse(localStorage.getItem("auth") || "{}").user;

  useEffect(() => {
    fetchProfile();
  }, [id]);

  async function fetchProfile() {
    try {
      // Pass current user ID to check "isFollowing" status
      const query = currentUser ? `?userId=${currentUser.id}` : "";
      const res = await fetch(
        `http://localhost:3000/api/artisans/${id}/profile${query}`
      );
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleFollow() {
    if (!currentUser) return alert("Veuillez vous connecter");

    setFollowLoading(true);
    const action = profile.stats.isFollowing ? "unfollow" : "follow";

    try {
      await fetch(`http://localhost:3000/api/artisans/${id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id }),
      });

      // Update local state to reflect change immediately
      setProfile((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          isFollowing: !prev.stats.isFollowing,
          followers: prev.stats.isFollowing
            ? prev.stats.followers - 1
            : prev.stats.followers + 1,
        },
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setFollowLoading(false);
    }
  }

  if (loading) return <div>Chargement...</div>;
  if (!profile) return <div>Artisan introuvable</div>;

  const { artisan, products, stats } = profile;

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      {/* Header / Bio Section */}
      <div className="bg-white rounded-apple border border-border p-8 mb-12 flex flex-col md:flex-row items-start gap-8">
        <Avatar className="h-32 w-32">
          <AvatarImage src={artisan.avatar} />
          <AvatarFallback className="text-2xl">
            {artisan.name?.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{artisan.name}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {artisan.location || "Maroc"}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" /> {stats.followers} abonnés
                </span>
              </div>
            </div>

            <Button
              onClick={toggleFollow}
              disabled={followLoading}
              variant={stats.isFollowing ? "outline" : "default"}
            >
              {stats.isFollowing ? "Suivi" : "Suivre"}
            </Button>
          </div>

          <p className="text-gray-600 max-w-2xl">
            {artisan.bio || "Cet artisan n'a pas encore ajouté de biographie."}
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <h2 className="text-2xl font-semibold mb-6">
        Créations ({products.length})
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          // Assuming you have ProductCard component
          <ProductCard key={p._id} p={p} />
        ))}
      </div>
    </div>
  );
}
