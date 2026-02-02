"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error);
    } else {
      setMessage("Account created. You can now log in.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 max-w-md">
      <h1 className="text-xl font-bold mb-4">Register</h1>

      <input
        className="border p-2 w-full mb-2"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="border p-2 w-full mb-2"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="bg-green-500 text-white px-4 py-2 rounded">
        Register
      </button>

      {message && <p className="mt-4">{message}</p>}
    </form>
  );
}
