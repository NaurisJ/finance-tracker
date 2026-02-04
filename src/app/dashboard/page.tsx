"use client";

import { useEffect, useState } from "react";

type Transaction = {
  id: string;
  amount: number;
  category: string;
  type: "INCOME" | "EXPENSE";
  date: string;
  description?: string | null;
};

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    async function loadTransactions() {
      try {
        const res = await fetch("/api/transactions");

        if (!res.ok) {
          setLoadError("Could not load transactions.");
          return;
        }

        const data = (await res.json()) as Transaction[];
        setTransactions(data);
      } catch {
        setLoadError("Could not load transactions.");
      }
    }

    loadTransactions();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/transactions", {
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

      const data = (await res.json()) as Transaction | { error: string };

      if (!res.ok || "error" in data) {
        setSubmitError(
          "error" in data ? data.error : "Failed to create transaction."
        );
        return;
      }

      setTransactions((current) => [data, ...current]);
      setAmount("");
      setCategory("");
      setDate("");
      setDescription("");
    } catch {
      setSubmitError("Failed to create transaction.");
    } finally {
      setIsSubmitting(false);
    }
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
        onChange={(e) => setType(e.target.value as "INCOME" | "EXPENSE")}
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

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Adding..." : "Add"}
      </button>

      {submitError && <p className="text-red-500 mt-3">{submitError}</p>}
      {loadError && <p className="text-red-500 mt-3">{loadError}</p>}

      <ul className="mt-6">
        {transactions.map((transaction) => (
          <li key={transaction.id} className="border-b py-2">
            <strong>{transaction.category}</strong> - {transaction.amount} ({transaction.type})
          </li>
        ))}
      </ul>
    </form>
  );
}
