export function DashboardHeader() {
  return (
    <header className="mb-12 flex justify-between items-end">
      <section>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-2">
          Your Dashboard
        </h1>
        <p className="text-gray-500 text-lg">
          Architecting your professional future through verified excellence.
        </p>
      </section>
      <aside className="text-right">
        <small className="block text-xs font-bold text-amber-700 uppercase tracking-widest">NQF Rank</small>
        <strong className="text-2xl font-bold text-amber-600">Level 7</strong>
      </aside>
    </header>
  );
}