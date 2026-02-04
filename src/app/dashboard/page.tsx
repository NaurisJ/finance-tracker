"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

type Transaction = {
  id: string;
  amount: number;
  category: string;
  type: "INCOME" | "EXPENSE";
  date: string;
  description?: string | null;
};

type TransactionPayload = {
  amount: number;
  category: string;
  type: "INCOME" | "EXPENSE";
  date: string;
  description: string;
};

function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="bg-red-500 text-white px-4 py-2 rounded"
    >
      Logout
    </button>
  );
}

function toDateInputValue(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editType, setEditType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [editDate, setEditDate] = useState("");
  const [editDescription, setEditDescription] = useState("");

  function showSuccess(message: string) {
    setSuccessMessage(message);
    window.setTimeout(() => {
      setSuccessMessage("");
    }, 2500);
  }

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
    setActionError("");
    setIsSubmitting(true);

    const payload: TransactionPayload = {
      amount: Number(amount),
      category,
      type,
      date,
      description,
    };

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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
      showSuccess("Transaction added.");
    } catch {
      setSubmitError("Failed to create transaction.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function startEditing(transaction: Transaction) {
    setActionError("");
    setSuccessMessage("");
    setEditingId(transaction.id);
    setEditAmount(String(transaction.amount));
    setEditCategory(transaction.category);
    setEditType(transaction.type);
    setEditDate(toDateInputValue(transaction.date));
    setEditDescription(transaction.description ?? "");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditAmount("");
    setEditCategory("");
    setEditDate("");
    setEditDescription("");
  }

  async function saveEdit(id: string) {
    setActionError("");
    setSuccessMessage("");
    setIsSavingEdit(true);

    const payload: TransactionPayload = {
      amount: Number(editAmount),
      category: editCategory,
      type: editType,
      date: editDate,
      description: editDescription,
    };

    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as Transaction | { error: string };

      if (!res.ok || "error" in data) {
        setActionError("error" in data ? data.error : "Failed to update transaction.");
        return;
      }

      setTransactions((current) =>
        current.map((transaction) => (transaction.id === id ? data : transaction))
      );
      cancelEditing();
      showSuccess("Transaction updated.");
    } catch {
      setActionError("Failed to update transaction.");
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function deleteTransaction(id: string) {
    const shouldDelete = window.confirm("Delete this transaction?");

    if (!shouldDelete) {
      return;
    }

    setActionError("");
    setSuccessMessage("");
    setDeletingId(id);

    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setActionError(data.error ?? "Failed to delete transaction.");
        return;
      }

      setTransactions((current) =>
        current.filter((transaction) => transaction.id !== id)
      );

      if (editingId === id) {
        cancelEditing();
      }
      showSuccess("Transaction deleted.");
    } catch {
      setActionError("Failed to delete transaction.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen p-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <LogoutButton />
      </header>

      <form onSubmit={handleSubmit} className="max-w-md">
        <h2 className="text-xl font-bold mb-4">Add Transaction</h2>

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
        {actionError && <p className="text-red-500 mt-3">{actionError}</p>}
        {successMessage && <p className="text-green-600 mt-3">{successMessage}</p>}
      </form>

      <ul className="mt-6 max-w-md space-y-3">
        {transactions.map((transaction) => {
          const isEditing = editingId === transaction.id;

          return (
            <li key={transaction.id} className="border rounded p-3">
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="border p-2 w-full"
                  />
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="border p-2 w-full"
                  />
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as "INCOME" | "EXPENSE")}
                    className="border p-2 w-full"
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </select>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="border p-2 w-full"
                  />
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="border p-2 w-full"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => saveEdit(transaction.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                      disabled={isSavingEdit}
                    >
                      {isSavingEdit ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="bg-gray-500 text-white px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p>
                      <strong>{transaction.category}</strong> - {transaction.amount} ({transaction.type})
                    </p>
                    <p className="text-sm text-gray-600">{toDateInputValue(transaction.date)}</p>
                    {transaction.description ? (
                      <p className="text-sm text-gray-700">{transaction.description}</p>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEditing(transaction)}
                      className="bg-amber-500 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteTransaction(transaction.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                      disabled={deletingId === transaction.id}
                    >
                      {deletingId === transaction.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
