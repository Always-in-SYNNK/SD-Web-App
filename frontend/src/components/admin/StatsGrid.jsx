export function StatsGrid() {
  const stats = [
    { label: "Total Active", value: "1,284" },
    { label: "New Today", value: "42" },
    { label: "Flagged", value: "12" },
    { label: "Pending Review", value: "89" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-2">
      {stats.map((s) => (
        <div key={s.label} className="bg-gray-100 p-6 rounded-xl">
          <p className="text-sm text-gray-500">{s.label}</p>
          <h3 className="text-2xl font-bold">{s.value}</h3>
        </div>
      ))}
    </div>
  );
}