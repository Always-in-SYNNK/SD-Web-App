export function DashboardHeader({ profile }) {
  const firstName = profile?.full_name?.split(" ")[0] ?? "there";
  const nqfLevel = profile?.nqf_level ?? null;

  return (
    <header className="mb-12 flex justify-between items-end">
      <section>
        <small className="text-sm font-semibold tracking-wider text-[#035b9d] uppercase">
          Welcome back
        </small>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-2 mt-1">
          Hey, {firstName} 👋
        </h1>
        <p className="text-gray-500 text-lg">
          Architecting your professional future through verified excellence.
        </p>
      </section>
      {nqfLevel && (
        <aside className="text-right">
          <small className="block text-xs font-bold text-amber-700 uppercase tracking-widest">NQF Rank</small>
          <strong className="text-2xl font-bold text-amber-600">Level {nqfLevel}</strong>
        </aside>
      )}
    </header>
  );
}