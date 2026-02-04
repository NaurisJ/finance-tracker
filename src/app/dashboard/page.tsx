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
      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text)] transition hover:border-[var(--accent)] hover:bg-[var(--surface-2)]"
    >
      Logout
    </button>
  );
}

function toDateInputValue(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
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

  const incomeTotal = transactions
    .filter((item) => item.type === "INCOME")
    .reduce((sum, item) => sum + item.amount, 0);
  const expenseTotal = transactions
    .filter((item) => item.type === "EXPENSE")
    .reduce((sum, item) => sum + item.amount, 0);
  const balance = incomeTotal - expenseTotal;

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
    <main className="min-h-screen px-6 py-8 md:px-10 md:py-10">
      <div className="container">
        <header className="glass p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="tag">FlowLedger</p>
              <h1 className="mt-3 text-3xl font-semibold">Finance workspace</h1>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Keep a tight ledger and see the full picture at a glance.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium"
              >
                Export CSV
              </button>
              <LogoutButton />
            </div>
          </div>
        </header>

        <section className="mt-6 section-tint blue">
          <div className="glass p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Overview</h2>
              <span className="text-xs text-[var(--text-muted)]">Totals</span>
            </div>
            <div className="divider my-4"></div>
            <div className="grid gap-4 md:grid-cols-3">
            <article className="stat relative p-5">
              <div className="absolute inset-0 rounded-2xl bg-emerald-400/10"></div>
              <div className="relative flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-200">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 5l6 6"></path>
                    <path d="M12 5L6 11"></path>
                    <path d="M12 5v14"></path>
                  </svg>
                </span>
                <p className="text-sm text-[var(--text-muted)]">Income</p>
              </div>
              <p className="mt-2 text-2xl font-semibold text-[var(--success)]">{formatMoney(incomeTotal)}</p>
              <p className="mt-2 text-xs text-[var(--text-muted)]">Total incoming funds</p>
            </article>
            <article className="stat relative p-5">
              <div className="absolute inset-0 rounded-2xl bg-orange-400/10"></div>
              <div className="relative flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-orange-400/15 text-orange-200">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 19l6-6"></path>
                    <path d="M12 19l-6-6"></path>
                    <path d="M12 5v14"></path>
                  </svg>
                </span>
                <p className="text-sm text-[var(--text-muted)]">Expense</p>
              </div>
              <p className="mt-2 text-2xl font-semibold text-[var(--danger)]">{formatMoney(expenseTotal)}</p>
              <p className="mt-2 text-xs text-[var(--text-muted)]">Total outgoing funds</p>
            </article>
            <article className="stat relative p-5">
              <div className="absolute inset-0 rounded-2xl bg-blue-400/10"></div>
              <div className="relative flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-400/15 text-blue-200">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14"></path>
                    <path d="M5 7h9"></path>
                    <path d="M5 17h9"></path>
                  </svg>
                </span>
                <p className="text-sm text-[var(--text-muted)]">Balance</p>
              </div>
              <p className={`mt-2 text-2xl font-semibold ${balance >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                {formatMoney(balance)}
              </p>
              <p className="mt-2 text-xs text-[var(--text-muted)]">Income minus expense</p>
            </article>
            </div>
          </div>
        </section>

        <section className="mt-6 section-tint green">
          <div className="glass p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Operations</h2>
              <span className="text-xs text-[var(--text-muted)]">Create and manage</span>
            </div>
            <div className="divider my-4"></div>
            <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <form onSubmit={handleSubmit} className="glass p-6">
            <h2 className="text-lg font-semibold">Add transaction</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Quick entry form.</p>

            <div className="mt-4 space-y-3">
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 outline-none transition focus:border-[var(--accent)]"
              />

              <input
                type="text"
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 outline-none transition focus:border-[var(--accent)]"
              />

              <select
                value={type}
                onChange={(e) => setType(e.target.value as "INCOME" | "EXPENSE")}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 outline-none transition focus:border-[var(--accent)]"
              >
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 outline-none transition focus:border-[var(--accent)]"
              />

              <input
                type="text"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 outline-none transition focus:border-[var(--accent)]"
              />
            </div>

            <button
              className="mt-4 w-full rounded-xl bg-[var(--accent)] px-4 py-2.5 font-medium text-white transition hover:bg-[var(--accent-2)] hover:shadow-[0_10px_24px_rgba(79,140,255,0.25)]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Transaction"}
            </button>

            {submitError && <p className="mt-3 text-sm text-[var(--danger)]">{submitError}</p>}
            {loadError && <p className="mt-3 text-sm text-[var(--danger)]">{loadError}</p>}
            {actionError && <p className="mt-3 text-sm text-[var(--danger)]">{actionError}</p>}
            {successMessage && <p className="mt-3 text-sm text-[var(--success)]">{successMessage}</p>}
          </form>

          <section className="glass p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Recent activity</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">List of all transactions.</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-white"
                >
                  Filter
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-white"
                >
                  Sort
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {transactions.map((transaction) => {
                const isEditing = editingId === transaction.id;

                if (isEditing) {
                  return (
                    <div key={transaction.id} className="list-item p-3">
                      <div className="grid gap-3 xl:grid-cols-[1fr_1fr_0.8fr_0.9fr_auto] items-start">
                        <input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="w-full rounded-xl border border-[var(--border)] px-3 py-2"
                        />
                        <input
                          type="text"
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="w-full rounded-xl border border-[var(--border)] px-3 py-2"
                        />
                        <select
                          value={editType}
                          onChange={(e) => setEditType(e.target.value as "INCOME" | "EXPENSE")}
                          className="w-full rounded-xl border border-[var(--border)] px-3 py-2"
                        >
                          <option value="EXPENSE">Expense</option>
                          <option value="INCOME">Income</option>
                        </select>
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="w-full rounded-xl border border-[var(--border)] px-3 py-2"
                        />
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => saveEdit(transaction.id)}
                            className="rounded-xl bg-[var(--accent)] px-3 py-1.5 text-sm text-white"
                            disabled={isSavingEdit}
                          >
                            {isSavingEdit ? "Saving..." : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={transaction.id} className="list-item p-3">
                    <div className="grid gap-4 md:grid-cols-[1.6fr_0.7fr_0.7fr_0.9fr_auto] md:items-center">
                      <div>
                        <p className="text-sm font-semibold">{transaction.category}</p>
                        {transaction.description ? (
                          <p className="mt-1 text-xs text-[var(--text-muted)]">{transaction.description}</p>
                        ) : null}
                      </div>
                      <p className="text-sm font-medium">{formatMoney(transaction.amount)}</p>
                      <span
                        className={`inline-flex w-fit items-center rounded-full px-2 py-1 text-xs font-semibold ${
                          transaction.type === "INCOME"
                            ? "bg-emerald-400/10 text-emerald-300"
                            : "bg-orange-400/10 text-orange-300"
                        }`}
                      >
                        {transaction.type}
                      </span>
                      <p className="text-sm text-[var(--text-muted)]">{formatDate(transaction.date)}</p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => startEditing(transaction)}
                          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm transition hover:border-[var(--accent)]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTransaction(transaction.id)}
                          className="rounded-xl bg-[var(--danger)] px-3 py-1.5 text-sm text-white transition hover:opacity-90"
                          disabled={deletingId === transaction.id}
                        >
                          {deletingId === transaction.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
