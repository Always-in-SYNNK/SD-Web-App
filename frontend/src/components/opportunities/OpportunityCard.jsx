import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { applyToOpportunity } from "../../services/myApplicationService";

const STATUS_STYLES = {
  approved: "bg-green-100 text-green-800",
  pending:  "bg-yellow-100 text-yellow-800",
  rejected: "bg-red-100 text-red-800",
  draft:    "bg-gray-100 text-gray-500",
  offered:  "bg-blue-100 text-blue-800",
  accepted: "bg-purple-100 text-purple-800",
};

export function OpportunityCard({
  id,
  title,
  description,
  location,
  duration,
  stipend,
  closing_date,
  status,
  isApplied = false,
  isAdmin = false,
  isProvider = false,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  disableApprove = false,
  disableReject = false,
  disableDelete = false,
}) {
  const navigate = useNavigate();

  const formattedStipend = stipend
    ? `R${Number(stipend).toLocaleString()}/month`
    : "Unpaid";

  const formattedDate = closing_date
    ? new Date(closing_date).toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "No closing date";

  const [applied, setApplied] = useState(isApplied);

  useEffect(() => {
    setApplied(isApplied);
  }, [isApplied]);

  const handleApply = async (e) => {
    e.stopPropagation();
    try {
      await applyToOpportunity(id);
      setApplied(true);
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.error || "Failed to apply";
      if (String(message).toLowerCase().includes("already applied")) {
        setApplied(true);
      }
      alert(message);
    }
  };

  const statusPill = status && (
    <span
      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${
        STATUS_STYLES[status] ?? STATUS_STYLES.draft
      }`}
    >
      {status}
    </span>
  );

  return (
    <article
      onClick={() => !isProvider && navigate(`/opportunities/${id}`)}
      className={`bg-white p-6 rounded-xl flex flex-col md:flex-row gap-6 items-center relative group border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all duration-300 ${
        isProvider ? "cursor-default" : "cursor-pointer"
      }`}
    >
      <figure className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 text-2xl">
        🎓
      </figure>

      <section className="flex-1 space-y-1 text-center md:text-left">
        <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#035b9d] transition-colors">
            {title}
          </h3>
          {statusPill}
        </div>

        {description && (
          <p className="text-gray-500 text-sm mt-1 line-clamp-2">
            {description}
          </p>
        )}

        <section className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-400 pt-2 text-xs">
          {location && <strong>📍 {location}</strong>}
          {duration && <strong>🕐 {duration}</strong>}
          {stipend && <strong>💰 {formattedStipend}</strong>}
          <time>📅 Closes {formattedDate}</time>
        </section>
      </section>

      <nav className="flex flex-row md:flex-col gap-3 shrink-0">
        {isProvider ? (
          <>
            {status === "draft" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/opportunities/edit/${id}`);
                }}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Edit Draft
              </button>
            )}

            {status === "approved" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/opportunity/${id}/applications`);
                }}
                className="px-4 py-2 bg-[#035b9d] text-white rounded-lg text-sm font-medium hover:bg-[#024f8a] transition-colors"
              >
                View Applications
              </button>
            )}

            {status === "rejected" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/opportunities/edit/${id}`);
                }}
                className="px-4 py-2 border border-gray-300 text-[#404850] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Revise &amp; Resubmit
              </button>
            )}

            {status === "pending" && (
              <span className="px-4 py-2 bg-yellow-50 text-yellow-600 rounded-lg text-sm font-medium border border-yellow-200">
                Under Review
              </span>
            )}
          </>
        ) : isAdmin ? (
          <>
            {onApprove && (
              <button
                disabled={disableApprove}
                onClick={(e) => { e.stopPropagation(); onApprove(id); }}
                className="px-5 py-2 bg-green-100 text-green-700 rounded-lg font-bold text-sm hover:bg-green-200 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-100"
                title={disableApprove ? "You cannot approve your own opportunity." : undefined}
              >
                Approve
              </button>
            )}
            {onReject && (
              <button
                disabled={disableReject}
                onClick={(e) => { e.stopPropagation(); onReject(id); }}
                className="px-5 py-2 bg-orange-100 text-orange-700 rounded-lg font-bold text-sm hover:bg-orange-200 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-orange-100"
                title={disableReject ? "You cannot reject your own opportunity." : undefined}
              >
                Reject
              </button>
            )}
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(id); }}
                className="px-5 py-2 bg-gray-100 rounded-lg font-bold text-sm hover:bg-gray-200 transition"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                disabled={disableDelete}
                onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                className="px-5 py-2 bg-red-100 text-red-600 rounded-lg font-bold text-sm hover:bg-red-200 transition"
                title={disableDelete ? "You cannot delete your own opportunity." : undefined}
              >
                Delete
              </button>
            )}
          </>
        ) : (
          <button
            disabled={applied}
            onClick={handleApply}
            className={`px-6 py-2.5 text-white rounded-full font-bold text-sm transition min-w-[100px] ${
              applied ? "bg-green-500" : "bg-[#035b9d]"
            }`}
          >
            {applied ? "Applied" : "Apply"}
          </button>
        )}
      </nav>
    </article>
  );
}
