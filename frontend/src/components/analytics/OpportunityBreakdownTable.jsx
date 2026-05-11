// frontend/src/components/analytics/OpportunityBreakdownTable.jsx
//
// Props:
//   data — array from the backend:
//          [{ opportunityTitle, count, status, location,
//             opportunityId, statusBreakdown }]
//   statusKeys — array of status breakdown keys to display, e.g., 
//                ['pending', 'shortlisted', 'accepted', 'rejected']
//                Defaults to provider-side application statuses.
//
// Now renders statusBreakdown columns dynamically based on statusKeys prop.

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

// Color mapping for application status breakdown columns
const STATUS_BREAKDOWN_COLORS = {
  pending:     { text: "text-yellow-600", header: "text-yellow-600" },
  shortlisted: { text: "text-blue-600",   header: "text-blue-600" },
  accepted:    { text: "text-green-600",  header: "text-green-600" },
  rejected:    { text: "text-red-500",    header: "text-red-500" },
  // Admin/alternative status mappings
  received:    { text: "text-gray-600",   header: "text-gray-600" },
  offered:     { text: "text-purple-600", header: "text-purple-600" },
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

export default function OpportunityBreakdownTable({ 
  data = [],
  statusKeys = ['pending', 'shortlisted', 'accepted', 'rejected'],
  showOpportunityStatus = true
}) {
  const maxCount = Math.max(...data.map(d => d.count ?? 0)) || 1;
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
                {/* Dynamically render status breakdown headers based on statusKeys */}
                {statusKeys.map((key) => (
                  <th 
                    key={key}
                    className={`pb-3 pr-4 font-semibold ${
                      STATUS_BREAKDOWN_COLORS[key]?.header || "text-gray-600"
                    }`}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </th>
                ))}
                {showOpportunityStatus && <th className="pb-3 font-semibold">Opp. Status</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((row, i) => {
                const share    = ((row.count / total) * 100).toFixed(1);
                const barWidth = Math.round((row.count / maxCount) * 100);
                const sb = row.statusBreakdown || {};

                return (
                  <tr key={row.opportunityId || i} className="bg-white hover:bg-gray-50 transition">

                    {/* Opportunity title */}
                    <td className="py-4 pr-4 font-medium text-gray-800 max-w-[180px] truncate">
                      {row.opportunityTitle}
                    </td>

                    {/* Location */}
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

                    {/* Dynamically render status breakdown cells based on statusKeys */}
                    {statusKeys.map((key) => (
                      <td key={key} className="py-4 pr-4">
                        <MiniCount 
                          value={sb[key]} 
                          color={STATUS_BREAKDOWN_COLORS[key]?.text || "text-gray-500"}
                        />
                      </td>
                    ))}

                    {showOpportunityStatus && (
                      <td className="py-4">
                        <StatusBadge status={row.status} />
                      </td>
                    )}
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