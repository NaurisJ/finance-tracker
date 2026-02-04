"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = (await res.json()) as { error?: string; message?: string };

    if (!res.ok) {
      setMessage(data.error ?? "Failed to register account.");
      setIsError(true);
      return;
    }

    setMessage("Account created. Redirecting to login...");
    window.setTimeout(() => router.push("/login"), 900);
  }

  return (
    <main className="min-h-screen px-6 py-12 md:px-10">
      <div className="container">
        <section className="glass mx-auto max-w-md p-7 md:p-8">
          <p className="tag">Get started</p>
          <h1 className="mt-4 text-3xl font-semibold">Create your account</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Set up your finance workspace.</p>

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
              placeholder="Password (min 8 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button className="w-full rounded-xl bg-[var(--accent)] px-4 py-2.5 font-medium text-white transition hover:bg-[var(--accent-2)]">
              Register
            </button>

            {message && (
              <p className={`text-sm ${isError ? "text-[var(--danger)]" : "text-[var(--success)]"}`}>
                {message}
              </p>
            )}
          </form>

          <p className="mt-5 text-sm text-[var(--text-muted)]">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-[var(--accent)]">
              Log in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
