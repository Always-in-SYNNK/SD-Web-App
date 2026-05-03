// src/components/dashboard/JobCard.jsx
import { useNavigate } from "react-router-dom";

const STATUS_STYLES = {
  approved: "bg-green-100 text-green-800",
  pending:  "bg-yellow-100 text-yellow-800",
  rejected: "bg-red-100 text-red-800",
  draft:    "bg-gray-100 text-gray-500",
  offered:  "bg-blue-100 text-blue-800",
  accepted: "bg-purple-100 text-purple-800",
};

const JobCard = ({
  id,
  title,
  location,
  duration,
  stipend,
  closing_date,
  status,
}) => {
  const navigate = useNavigate();
  const styles = STATUS_STYLES[status] || STATUS_STYLES.draft;
  const isDraft = status === "draft";

  const formattedStipend =
    stipend !== null && stipend !== undefined && stipend !== ""
      ? `R${Number(stipend).toLocaleString()}/month`
      : null;

  const formattedDate = closing_date
    ? new Date(closing_date).toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <article
      className={`bg-white rounded-xl shadow-sm flex flex-col md:flex-row gap-5 items-start md:items-center p-6 
        hover:shadow-md transition-all duration-200 group
        ${isDraft ? "opacity-80" : ""}`}
    >

      {/* Content */}
      <section className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-bold text-[#0d1b2a] text-base group-hover:text-[#035b9d] transition-colors">
            {title}
          </h3>
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${styles}`}
          >
            {status}
          </span>
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-[#707881] pt-1">
          {location && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">
                location_on
              </span>
              {location}
            </span>
          )}
          {duration && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">
                schedule
              </span>
              {duration}
            </span>
          )}
          {formattedStipend && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">
                payments
              </span>
              {formattedStipend}
            </span>
          )}
          {formattedDate && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">
                event
              </span>
              Closes {formattedDate}
            </span>
          )}
        </div>
      </section>

      {/* Action Buttons */}
      <nav className="flex gap-2 shrink-0">
        {isDraft && (
          <button
            onClick={() => navigate(`/opportunities/edit/${id}`)}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Edit Draft
          </button>
        )}

        {status === "approved" && (
          <button
            onClick={() => navigate(`/opportunity/${id}/applications`)}
            className="px-4 py-2 bg-[#035b9d] text-white rounded-lg text-sm font-medium hover:bg-[#024f8a] transition-colors"
          >
            View Applications
          </button>
        )}

        {status === "rejected" && (
          <button
            onClick={() => navigate(`/opportunities/edit/${id}`)}
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
      </nav>
    </article>
  );
};

export default JobCard;
