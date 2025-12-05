import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, X } from "lucide-react"; // ADDED 'X' for dismiss button
import { useAuth } from "@/context/AuthContext";

export default function EditArtisanProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth(); // Logged‑in artisan
  const apiBaseUrl =
    import.meta.env.VITE_API_URL?.replace(/\/$/, "") || window.location.origin;

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [error, setError] = useState<string | null>(null); // State for custom error message

  const canEdit = useMemo(() => {
    if (!user || !id) return false;
    return user.id === id && user.role === "artisan";
  }, [id, user]); // MOVED: Define fetchProfile using useCallback BEFORE the useEffect hook that calls it

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(
        new URL(`/api/artisans/${id}/profile`, apiBaseUrl).toString()
      );
      const data = await res.json();
      setProfile(data.artisan);
      setAvatarPreview(data.artisan.avatar);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError("Impossible de charger le profil de l'artisan.");
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, id]); // Redirect if trying to edit someone else's profile

  useEffect(() => {
    if (authLoading) return; // If the user is logged in, but not the correct artisan for this ID, deny access.

    if (!canEdit) {
      setLoading(false); // Only set access denied if the user object exists, otherwise show loading until auth state is known
      if (user) {
        setAccessDenied(true);
      }
      return;
    } // Fetch the profile data if access is granted

    fetchProfile();
  }, [authLoading, canEdit, user, fetchProfile]); // Added 'user' to dependencies

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; // Use optional chaining for safety
    if (!file) return; // Clean up previous preview URL to avoid memory leaks

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);

    setProfile((prev: any) => ({
      ...prev,
      avatarFile: file,
    }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null); // Clear previous errors

    try {
      let avatarUrl = profile.avatar; // --- Upload avatar if changed ---

      if (profile.avatarFile) {
        const formData = new FormData();
        formData.append("image", profile.avatarFile);

        const uploadRes = await fetch(
          new URL("/api/upload", apiBaseUrl).toString(),
          {
          method: "POST",
          body: formData,
          }
        );

        if (!uploadRes.ok) throw new Error("Upload failed");

        if (!uploadRes.ok) throw new Error("Upload failed");

        const uploadData = await uploadRes.json();
        avatarUrl = uploadData.url;
      } // --- Send update request ---

      const res = await fetch(new URL(`/api/artisans/${id}`, apiBaseUrl).toString(), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
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
      console.error("Failed to update profile:", err); // REPLACED alert() with state-driven error message
      setError(
        "Erreur lors de la mise à jour du profil. Veuillez vérifier vos informations."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
                <Loader2 className="h-6 w-6 mr-2 animate-spin" />       
        Chargement...      {" "}
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
               {" "}
        <Card className="max-w-lg w-full text-center border-destructive/40">
                   {" "}
          <CardHeader>
                        <CardTitle className="text-xl">Accès refusé</CardTitle> 
                   {" "}
          </CardHeader>
                   {" "}
          <CardContent className="space-y-4 text-muted-foreground">
                       {" "}
            <p>Vous ne pouvez modifier que votre propre profil artisan.</p>     
                 {" "}
            <div className="flex justify-center gap-3">
                           {" "}
              <Button variant="outline" onClick={() => navigate(-1)}>
                                Retour              {" "}
              </Button>
                           {" "}
              <Button onClick={() => navigate(`/artisan/${id}`)}>
                                Voir le profil              {" "}
              </Button>
                         {" "}
            </div>
                     {" "}
          </CardContent>
                 {" "}
        </Card>
             {" "}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
            {/* Custom Error Message Box (Replaces alert()) */}     {" "}
      {error && (
        <div
          className="mb-6 p-4 bg-red-50 border border-red-300 text-red-700 rounded-lg shadow-md flex justify-between items-center transition-opacity duration-300"
          role="alert"
        >
                    <span className="font-medium">⚠️ {error}</span>         {" "}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setError(null)}
            className="text-red-700 hover:bg-red-100"
          >
                        <X className="h-4 w-4" />         {" "}
          </Button>
                 {" "}
        </div>
      )}
           {" "}
      <Card className="border-border rounded-apple shadow-sm">
               {" "}
        <CardHeader>
                   {" "}
          <CardTitle className="text-2xl font-semibold">
                        Modifier mon profil          {" "}
          </CardTitle>
                 {" "}
        </CardHeader>
               {" "}
        <CardContent className="space-y-6">
                    {/* Avatar Upload */}         {" "}
          <div className="flex items-center gap-6">
                       {" "}
            <Avatar className="h-24 w-24">
                            <AvatarImage src={avatarPreview || ""} />           
                <AvatarFallback>{profile.name?.charAt(0)}</AvatarFallback>     
                   {" "}
            </Avatar>
                       {" "}
            <div>
                           {" "}
              <label className="cursor-pointer flex items-center gap-2 font-medium text-primary hover:underline">
                                <Upload className="h-4 w-4" />
                                Changer la photo                {" "}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                             {" "}
              </label>
                         {" "}
            </div>
                     {" "}
          </div>
                    {/* Name */}         {" "}
          <div className="space-y-2">
                        <label className="font-medium">Nom</label>
                       {" "}
            <Input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
                     {" "}
          </div>
                    {/* Bio */}         {" "}
          <div className="space-y-2">
                        <label className="font-medium">Bio</label>
                       {" "}
            <Textarea
              className="min-h-28"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            />
                     {" "}
          </div>
                    {/* Location */}         {" "}
          <div className="space-y-2">
                        <label className="font-medium">Localisation</label>
                       {" "}
            <Input
              value={profile.location}
              onChange={(e) =>
                setProfile({ ...profile, location: e.target.value })
              }
            />
                     {" "}
          </div>
                    {/* Phone */}         {" "}
          <div className="space-y-2">
                        <label className="font-medium">Téléphone</label>
                       {" "}
            <Input
              value={profile.phone || ""}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
            />
                     {" "}
          </div>
                    {/* Website */}         {" "}
          <div className="space-y-2">
                        <label className="font-medium">Site Web</label>
                       {" "}
            <Input
              value={profile.website || ""}
              onChange={(e) =>
                setProfile({ ...profile, website: e.target.value })
              }
            />
                     {" "}
          </div>
                    {/* Save Button */}         {" "}
          <Button
            onClick={handleSave}
            className="w-full rounded-apple"
            disabled={saving}
          >
                       {" "}
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              "Enregistrer les modifications"
            )}
                     {" "}
          </Button>
                 {" "}
        </CardContent>
             {" "}
      </Card>
         {" "}
    </div>
  );
}
