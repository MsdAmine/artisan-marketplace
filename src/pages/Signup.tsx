// src/pages/Signup.tsx
import { useState } from "react";
import { signup } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer"
  });

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function submit() {
    try {
      await signup(form);
      alert("Compte créé !");
      window.location.href = "/login";
    } catch {
      alert("Erreur d'inscription");
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20 space-y-4">
      <h1 className="text-2xl font-bold text-center">Créer un compte</h1>

      <Input placeholder="Nom" value={form.name} onChange={e => update("name", e.target.value)} />
      <Input placeholder="Email" value={form.email} onChange={e => update("email", e.target.value)} />
      <Input placeholder="Mot de passe" type="password" value={form.password} onChange={e => update("password", e.target.value)} />

      <select
        className="border rounded p-2 w-full"
        value={form.role}
        onChange={e => update("role", e.target.value)}
      >
        <option value="customer">Client</option>
        <option value="artisan">Artisan</option>
        <option value="admin">Admin</option>
      </select>

      <Button className="w-full" onClick={submit}>Créer le compte</Button>
    </div>
  );
}
