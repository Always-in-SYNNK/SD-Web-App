// frontend/src/components/analytics/AllApplicationsTable.jsx
//
// Displays every application in the database.
// Mirrors the style of OpportunityBreakdownTable.

const STATUS_STYLES = {
  received:    "bg-gray-100   text-gray-600",
  shortlisted: "bg-blue-100   text-blue-700",
  offered:     "bg-purple-100 text-purple-700",
  accepted:    "bg-green-100  text-green-700",
  rejected:    "bg-red-100    text-red-600",
};

const OPP_STATUS_STYLES = {
  approved: "bg-green-100  text-green-700",
  pending:  "bg-yellow-100 text-yellow-700",
  draft:    "bg-orange-100 text-orange-700",
  rejected: "bg-red-100    text-red-600",
};

function StatusBadge({ status, styleMap }) {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
      styleMap[status] || "bg-gray-100 text-gray-500"
    }`}>
      {status}
    </span>
  );
}

export default function AllApplicationsTable({ data = [], loading = false }) {
  if (loading) {
    return (
      <article className="bg-[#f5f3f3] rounded-xl p-8">
        <p className="text-gray-400 text-sm text-center py-8">
          Loading applications…
        </p>
      </article>
    );
  }

  return (
    <article className="bg-[#f5f3f3] rounded-xl p-8">

      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <section>
          <h3 className="font-bold text-lg">All Applications</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Every application submitted across all providers — {data.length} total
          </p>
        </section>
      </header>

      {data.length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">
          No applications found in the database.
        </p>
      ) : (
        <section className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-200">
                <th className="pb-3 pr-4 font-semibold">Applicant</th>
                <th className="pb-3 pr-4 font-semibold">Email</th>
                <th className="pb-3 pr-4 font-semibold">Opportunity</th>
                <th className="pb-3 pr-4 font-semibold">Location</th>
                <th className="pb-3 pr-4 font-semibold">App. Status</th>
                <th className="pb-3 pr-4 font-semibold">Opp. Status</th>
                <th className="pb-3 font-semibold">Applied</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((app) => (
                <tr
                  key={app.id}
                  className="bg-white hover:bg-gray-50 transition"
                >
                  {/* Applicant name */}
                  <td className="py-4 pr-4 font-medium text-gray-800">
                    {app.applicantName}
                  </td>

                  {/* Email */}
                  <td className="py-4 pr-4 text-gray-400 text-xs">
                    {app.applicantEmail}
                  </td>

                  {/* Opportunity title */}
                  <td className="py-4 pr-4 text-gray-700 max-w-[180px] truncate">
                    {app.opportunityTitle}
                  </td>

                  {/* Location */}
                  <td className="py-4 pr-4 text-gray-400 text-xs">
                    {app.opportunityLocation}
                  </td>

                  {/* Application status badge */}
                  <td className="py-4 pr-4">
                    <StatusBadge
                      status={app.status}
                      styleMap={STATUS_STYLES}
                    />
                  </td>

                  {/* Opportunity status badge */}
                  <td className="py-4 pr-4">
                    <StatusBadge
                      status={app.opportunityStatus}
                      styleMap={OPP_STATUS_STYLES}
                    />
                  </td>

                  {/* Date applied */}
                  <td className="py-4 text-gray-400 text-xs">
                    {new Date(app.createdAt).toLocaleDateString("en-ZA", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </article>
  );
}