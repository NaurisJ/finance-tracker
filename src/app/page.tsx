import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-12 md:px-10">
      <div className="container">
        <nav className="flex items-center justify-between">
          <div className="text-lg font-semibold">FlowLedger</div>
          <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
            <Link href="/login" className="transition hover:text-white">Log in</Link>
            <Link
              href="/register"
              className="rounded-full bg-[var(--accent)] px-4 py-2 font-semibold text-white shadow-[0_8px_18px_rgba(79,140,255,0.35)] transition hover:bg-[var(--accent-2)]"
            >
              Create account
            </Link>
          </div>
        </nav>

        <section className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] section-tint blue">
          <div className="glass p-8 md:p-12">
            <span className="tag">Finance OS</span>
            <h1 className="mt-5 text-4xl font-semibold leading-tight md:text-5xl">
              A calm command center for your cash flow.
            </h1>
            <p className="mt-4 text-lg text-[var(--text-muted)]">
              Capture income and expenses, edit entries fast, and see your balance update in real time.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="rounded-xl bg-[var(--accent)] px-6 py-3 text-center text-white transition hover:bg-[var(--accent-2)]"
              >
                Get started
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-[var(--border)] px-6 py-3 text-center text-[var(--text)] transition hover:border-[var(--accent)]"
              >
                See your dashboard
              </Link>
            </div>
          </div>

          <div className="glass p-8">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--text-muted)]">Monthly overview</p>
              <span className="text-xs text-[var(--text-muted)]">Updated 2h ago</span>
            </div>
            <div className="mt-6">
              <p className="text-3xl font-semibold">$4,230.10</p>
              <p className="text-sm text-[var(--text-muted)]">Current balance</p>
            </div>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-muted)]">Income</span>
                <span className="text-sm text-[var(--success)]">$8,900</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-muted)]">Expense</span>
                <span className="text-sm text-[var(--danger)]">$4,670</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--surface-2)]">
                <div className="h-2 w-3/5 rounded-full bg-[var(--accent)]"></div>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                A quick preview of your real-time ledger once connected.
              </p>
            </div>
          </div>
        </section>

        <div className="divider my-10"></div>

        <section className="section-tint purple">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Why FlowLedger</h2>
            <span className="text-xs text-[var(--text-muted)]">Core benefits</span>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="glass p-6">
              <p className="text-sm text-[var(--text-muted)]">Unified ledger</p>
              <p className="mt-2 text-lg">Everything in one clean timeline.</p>
            </div>
            <div className="glass p-6">
              <p className="text-sm text-[var(--text-muted)]">Fast edits</p>
              <p className="mt-2 text-lg">Update, correct, and move on.</p>
            </div>
            <div className="glass p-6">
              <p className="text-sm text-[var(--text-muted)]">Live totals</p>
              <p className="mt-2 text-lg">Balance updates after each entry.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
