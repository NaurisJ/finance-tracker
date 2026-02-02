"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { signOut } from "next-auth/react";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await signIn("credentials", { email, password });

        const result = await signIn("credentials", {
    email,
    password,
    redirect: false,
    });

    if (!result?.ok) {
    setError("Invalid email or password");
    } else {
    window.location.href = "/dashboard";
    }

  }

  return (
    <div className="flex items-center justify-center h-screen">
      <form className="bg-white p-8 text-black rounded shadow" onSubmit={handleSubmit}>
        <h1 className="text-xl font-bold mb-4">Login</h1>
        <input
          className="border p-2 w-full mb-4"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border p-2 w-full mb-4"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded" type="submit">
          Login
        </button>
      </form>
      {error && <p className="text-red-500">{error}</p>}
            <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="bg-red-500 text-white px-4 py-2 rounded"
        >
        Logout
        </button>

    </div>

  );
}
