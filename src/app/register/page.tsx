"use client";

import { useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export default function RegisterPage() {
  const router = useRouter();
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange =
    (field: "name" | "email" | "password") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setError("Veuillez remplir tous les champs correctement.");
      return;
    }

    setLoading(true);

    const { error: signUpError } = await authClient.signUp.email(
      {
        name: values.name,
        email: values.email,
        password: values.password,
        callbackURL: "/admin",
      },
      {
        onRequest() {
          setError(null);
        },
        onSuccess() {
          setLoading(false);
          router.push("/admin");
        },
        onError(ctx) {
          setLoading(false);
          setError(ctx.error.message || "Impossible de créer le compte.");
        },
      },
    );

    if (signUpError) {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050509] text-white">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-900 bg-[#060010] px-6 py-6 shadow-[0_0_30px_rgba(0,0,0,0.6)]">
        <h1 className="mb-4 text-lg font-semibold">Créer un compte</h1>
        <form onSubmit={handleSubmit} className="space-y-3 text-[13px]">
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Nom</label>
            <input
              type="text"
              value={values.name}
              onChange={handleChange("name")}
              className="h-9 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-[13px] outline-none focus:border-[#5227FF]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Email</label>
            <input
              type="email"
              value={values.email}
              onChange={handleChange("email")}
              className="h-9 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-[13px] outline-none focus:border-[#5227FF]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Mot de passe</label>
            <input
              type="password"
              value={values.password}
              onChange={handleChange("password")}
              className="h-9 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-[13px] outline-none focus:border-[#5227FF]"
            />
          </div>
          {error && <div className="text-xs text-red-400">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-9 w-full rounded-md bg-[#5227FF] text-[13px] font-semibold text-white transition hover:bg-[#4120d1] disabled:opacity-60"
          >
            {loading ? "Création..." : "Créer le compte"}
          </button>
        </form>
      </div>
    </div>
  );
}
