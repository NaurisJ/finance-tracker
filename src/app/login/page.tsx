"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!result?.ok) {
      setError("Invalid email or password");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen px-6 py-12 md:px-10">
      <div className="container">
        <section className="glass mx-auto max-w-md p-7 md:p-8">
          <p className="tag">Welcome back</p>
          <h1 className="mt-4 text-3xl font-semibold">Log in to FlowLedger</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Pick up where you left off.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 outline-none transition focus:border-[var(--accent)]"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 outline-none transition focus:border-[var(--accent)]"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              className="w-full rounded-xl bg-[var(--accent)] px-4 py-2.5 font-medium text-white transition hover:bg-[var(--accent-2)]"
              type="submit"
            >
              Login
            </button>

            {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
          </form>

          <p className="mt-5 text-sm text-[var(--text-muted)]">
            No account yet?{" "}
            <Link href="/register" className="font-medium text-[var(--accent)]">
              Create one
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
