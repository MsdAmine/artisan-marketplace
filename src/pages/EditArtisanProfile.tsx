import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function EditArtisanProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Logged‑in artisan

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Redirect if trying to edit someone else's profile
  useEffect(() => {
    if (!user) return;
    if (user.id !== id) navigate("/not-authorized");
  }, [user, id, navigate]);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  async function fetchProfile() {
    try {
      const res = await fetch(
        `http://localhost:3000/api/artisans/${id}/profile`
      );
      const data = await res.json();
      setProfile(data.artisan);
      setAvatarPreview(data.artisan.avatar);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleAvatarChange(e: any) {
    const file = e.target.files[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);

    setProfile((prev: any) => ({
      ...prev,
      avatarFile: file,
    }));
  }

  async function handleSave() {
    setSaving(true);

    try {
      let avatarUrl = profile.avatar;

      // --- Upload avatar if changed ---
      if (profile.avatarFile) {
        const formData = new FormData();
        formData.append("file", profile.avatarFile);

        const uploadRes = await fetch("http://localhost:3000/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        avatarUrl = uploadData.url;
      }

      // --- Send update request ---
      const res = await fetch(`http://localhost:3000/api/artisans/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          bio: profile.bio,
          location: profile.location,
          phone: profile.phone,
          website: profile.website,
          avatar: avatarUrl,
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      navigate(`/artisan/${id}`);
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Erreur lors de la mise à jour du profil.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Chargement...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Card className="border-border rounded-apple shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            Modifier mon profil
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarPreview || ""} />
              <AvatarFallback>{profile.name?.charAt(0)}</AvatarFallback>
            </Avatar>

            <div>
              <label className="cursor-pointer flex items-center gap-2 font-medium text-primary hover:underline">
                <Upload className="h-4 w-4" />
                Changer la photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="font-medium">Nom</label>
            <Input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="font-medium">Bio</label>
            <Textarea
              className="min-h-28"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="font-medium">Localisation</label>
            <Input
              value={profile.location}
              onChange={(e) =>
                setProfile({ ...profile, location: e.target.value })
              }
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="font-medium">Téléphone</label>
            <Input
              value={profile.phone || ""}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
            />
          </div>

          {/* Website */}
          <div className="space-y-2">
            <label className="font-medium">Site Web</label>
            <Input
              value={profile.website || ""}
              onChange={(e) =>
                setProfile({ ...profile, website: e.target.value })
              }
            />
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            className="w-full rounded-apple"
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Enregistrer les modifications"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
