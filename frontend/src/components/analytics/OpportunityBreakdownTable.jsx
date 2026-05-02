// frontend/src/components/analytics/OpportunityBreakdownTable.jsx
//
// Props:
//   data — array of { opportunityTitle, count, status } from the API

const PALETTE = [
  "#035b9d", "#1d7a3a", "#a06000", "#a32d2d", "#535AB7", "#0F6E56",
];

// Matches your real opportunities.status values from the DB schema:
// draft | pending | approved | rejected
const STATUS_STYLES = {
  approved: "bg-green-100 text-green-700",
  pending:  "bg-yellow-100 text-yellow-700",
  draft:    "bg-orange-100 text-orange-700",
  rejected: "bg-red-100 text-red-700",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
        STATUS_STYLES[status] || "bg-gray-100 text-gray-500"
      }`}
    >
      {status}
    </span>
  );
}

export default function OpportunityBreakdownTable({ data = [] }) {
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  const maxCount = data[0]?.count || 1;

  return (
    <div className="bg-[#f5f3f3] rounded-xl p-8">
      <h3 className="font-bold text-lg mb-6">Opportunity Breakdown</h3>

      {data.length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">No data available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-200">
                <th className="pb-3 pr-6 font-semibold">Opportunity</th>
                <th className="pb-3 pr-6 font-semibold">Applications</th>
                <th className="pb-3 pr-6 font-semibold">Share</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((row, i) => {
                const share    = ((row.count / total) * 100).toFixed(1);
                const barWidth = Math.round((row.count / maxCount) * 100);

                return (
                  <tr key={i} className="bg-white hover:bg-gray-50 transition">
                    <td className="py-4 pr-6 font-medium text-gray-800">
                      {row.opportunityTitle}
                    </td>
                    <td className="py-4 pr-6">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800 min-w-[24px]">
                          {row.count}
                        </span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden min-w-[60px]">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width:      `${barWidth}%`,
                              background: PALETTE[i % PALETTE.length],
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-6 text-gray-400 text-xs">{share}%</td>
                    <td className="py-4">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}