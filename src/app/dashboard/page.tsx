"use client";

import { useState } from "react";

import { useEffect } from "react";

type Transaction = {
  id: string;
  amount: number;
  category: string;
  type: "INCOME" | "EXPENSE";
  date: string;
  description?: string;
};

const [transactions, setTransactions] = useState<Transaction[]>([]);

useEffect(() => {
  async function loadTransactions() {
    const res = await fetch("/api/transactions");
    if (res.ok) {
      const data = await res.json();
      setTransactions(data);
    }
  }
  loadTransactions();
}, []);


export default function DashboardPage() {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("EXPENSE");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await fetch("/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Number(amount),
        category,
        type,
        date,
        description,
      }),
    });

    setAmount("");
    setCategory("");
    setDate("");
    setDescription("");
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 max-w-md">
      <h1 className="text-xl font-bold mb-4">Add Transaction</h1>

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="border p-2 w-full mb-2"
      />

      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="border p-2 w-full mb-2"
      />

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="border p-2 w-full mb-2"
      >
        <option value="EXPENSE">Expense</option>
        <option value="INCOME">Income</option>
      </select>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="border p-2 w-full mb-2"
      />

      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2 w-full mb-2"
      />

      <button className="bg-blue-500 text-white px-4 py-2 rounded">
        Add
      </button>
        <ul className="mt-6">
    {transactions.map((t) => (
        <li key={t.id} className="border-b py-2">
        <strong>{t.category}</strong> — {t.amount} ({t.type})
        </li>
    ))}
    </ul>

    </form>

    
  );
}
