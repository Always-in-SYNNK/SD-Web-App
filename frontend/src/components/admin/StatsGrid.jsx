import { useEffect, useState } from "react";
import { getAdminStats } from "../../services/adminService";

export function StatsGrid() {
  const [stats, setStats] = useState({
    approved: 0,
    today: 0,
    pending: 0,
    rejected: 0,
  });

  function StatCard({ label, value, color }) {
  return (
    <article className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
    </article>
  );
}

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await getAdminStats();
        setStats(response?.data ?? response);
      } catch (err) {
        console.error("Failed to load stats:", err);
      }
    };

    loadStats();
  }, []);

  const statItems = [
    {
      label: "New Today",
      value: stats.today,
      color: "text-gray-800"
    },
    {
      label: "Pending Review",
      value: stats.pending,
      color: "text-yellow-600"
    },
    {
      label: "Approved",
      value: stats.approved,
      color: "text-green-600"
    },
    {
      label: "Rejected",
      value: stats.rejected,
      color: "text-red-600"
    },
  ];

  return (
    <section className="mb-6">
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statItems.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value !== undefined ? stat.value : 0}
            color={stat.color}
          />
        ))}
      </section>
    </section>
  );
}
