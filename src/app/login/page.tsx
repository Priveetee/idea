"use client";

import { useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function LoginPage() {
  const router = useRouter();
  const [values, setValues] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange =
    (field: "email" | "password") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setError("Email ou mot de passe invalide.");
      return;
    }

    const { error: signInError } = await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
        callbackURL: "/admin",
      },
      {
        onRequest() {
          setLoading(true);
          setError(null);
        },
        onSuccess() {
          setLoading(false);
          router.push("/admin");
        },
        onError(ctx) {
          setLoading(false);
          setError(ctx.error.message || "Impossible de se connecter.");
        },
      },
    );

    if (signInError) {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="w-full max-w-sm rounded-xl border border-zinc-900 bg-[#0a0a0a] p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-semibold tracking-tight">Welcome Back</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Don&apos;t have an account yet?{" "}
            <Link
              href="/register"
              className="text-blue-500 hover:text-blue-400 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-zinc-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <input
              type="email"
              value={values.email}
              onChange={handleChange("email")}
              className="w-full rounded-md border border-zinc-800 bg-black py-2.5 pl-10 pr-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              placeholder="email address"
            />
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-zinc-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <input
              type="password"
              value={values.password}
              onChange={handleChange("password")}
              className="w-full rounded-md border border-zinc-800 bg-black py-2.5 pl-10 pr-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              placeholder="Password"
            />
          </div>

          {error && (
            <div className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-md bg-blue-600 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
