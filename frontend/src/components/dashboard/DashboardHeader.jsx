export function DashboardHeader() {
  return (
    <header className="mb-12 flex justify-between items-end">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-2">
          Qualifications Dashboard
        </h1>
        <p className="text-gray-500 text-lg">
          Architecting your professional future through verified excellence.
        </p>
      </div>
      <div className="text-right">
        <span className="block text-xs font-bold text-amber-700 uppercase tracking-widest">NQF Rank</span>
        <span className="text-2xl font-bold text-amber-600">Level 7</span>
      </div>
    </header>
  );
}