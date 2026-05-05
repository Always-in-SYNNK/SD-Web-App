// frontend/src/components/analytics/OpportunityBreakdownTable.jsx
//
// Props:
//   data — array from the backend:
//          [{ opportunityTitle, count, status, location,
//             opportunityId, statusBreakdown }]
//
// Now renders the statusBreakdown columns (pending / shortlisted /
// accepted / rejected) that the backend provides — no frontend calculation needed.

const PALETTE = [
  "#035b9d", "#1d7a3a", "#a06000", "#a32d2d", "#535AB7", "#0F6E56",
];

// Matches the real opportunities.status values from your DB schema:
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

// Small inline number — used for the statusBreakdown mini columns
function MiniCount({ value, color = "text-gray-500" }) {
  return (
    <span className={`text-xs font-semibold ${color}`}>
      {value ?? 0}
    </span>
  );
}

export default function OpportunityBreakdownTable({ data = [] }) {
  const maxCount = data[0]?.count || 1;
  // Use the total from the first render — recalculated if data changes
  const total = data.reduce((s, d) => s + d.count, 0) || 1;

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
                <th className="pb-3 pr-4 font-semibold">Opportunity</th>
                <th className="pb-3 pr-4 font-semibold">Location</th>
                <th className="pb-3 pr-4 font-semibold">Applications</th>
                <th className="pb-3 pr-4 font-semibold">Share</th>
                {/* statusBreakdown columns — provided directly by backend */}
                <th className="pb-3 pr-4 font-semibold text-yellow-600">Pending</th>
                <th className="pb-3 pr-4 font-semibold text-blue-600">Shortlisted</th>
                <th className="pb-3 pr-4 font-semibold text-green-600">Accepted</th>
                <th className="pb-3 pr-4 font-semibold text-red-500">Rejected</th>
                <th className="pb-3 font-semibold">Opp. Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((row, i) => {
                const share    = ((row.count / total) * 100).toFixed(1);
                const barWidth = Math.round((row.count / maxCount) * 100);
                // statusBreakdown is provided by backend — no calculation needed
                const sb = row.statusBreakdown || {};

                return (
                  <tr key={row.opportunityId || i} className="bg-white hover:bg-gray-50 transition">

                    {/* Opportunity title */}
                    <td className="py-4 pr-4 font-medium text-gray-800 max-w-[180px] truncate">
                      {row.opportunityTitle}
                    </td>

                    {/* Location — available from backend */}
                    <td className="py-4 pr-4 text-gray-400 text-xs">
                      {row.location || "—"}
                    </td>

                    {/* Count + mini bar */}
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800 min-w-[24px]">
                          {row.count}
                        </span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden min-w-[50px]">
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

                    {/* Share */}
                    <td className="py-4 pr-4 text-gray-400 text-xs">{share}%</td>

                    {/* Status breakdown — straight from backend, no calculation */}
                    <td className="py-4 pr-4">
                      <MiniCount value={sb.pending}     color="text-yellow-600" />
                    </td>
                    <td className="py-4 pr-4">
                      <MiniCount value={sb.shortlisted} color="text-blue-600" />
                    </td>
                    <td className="py-4 pr-4">
                      <MiniCount value={sb.accepted}    color="text-green-600" />
                    </td>
                    <td className="py-4 pr-4">
                      <MiniCount value={sb.rejected}    color="text-red-500" />
                    </td>

                    {/* Opportunity status badge */}
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