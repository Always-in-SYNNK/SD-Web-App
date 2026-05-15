import { useEffect, useState } from "react";
import { fetchAdminStats } from "../../services/adminService";

export function StatsGrid() {
  const [stats, setStats] = useState({
    approved: 0,
    today: 0,
    pending: 0,
    rejected: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchAdminStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load stats:", err);
      }
    };

    loadStats();
  }, []);

  const statItems = [
    {
      label: "Approved Opportunities",
      value: stats.approved,
    },
    {
      label: "New Today",
      value: stats.today,
    },
    {
      label: "Pending Review",
      value: stats.pending,
    },
    {
      label: "Rejected Opportunities",
      value: stats.rejected,
    },
  ];

  return (
    <section
      aria-labelledby="admin-stats-heading"
      className="mb-6"
    >
      <h2 id="admin-stats-heading" className="sr-only">
        Opportunity moderation statistics
      </h2>

      <dl className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statItems.map((stat) => (
          <article
            key={stat.label}
            className="bg-gray-100 p-6 rounded-xl"
          >
            <dt className="text-sm text-gray-500">{stat.label}</dt>
            <dd className="text-2xl font-bold mt-2">{stat.value}</dd>
          </article>
        ))}
      </dl>
    </section>
  );
}