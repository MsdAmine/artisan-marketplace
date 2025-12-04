import { useAuth } from "@/context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  if (!user) return <div>Veuillez vous connecter.</div>;

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-4">Mon Profil</h1>

      <div className="border rounded-xl p-6 bg-white shadow">
        <p><strong>Email :</strong> {user.email}</p>
        <p><strong>Rôle :</strong> {user.role}</p>
      </div>
    </div>
  );
}
