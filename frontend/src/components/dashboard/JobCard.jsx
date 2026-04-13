// src/components/dashboard/JobCard.jsx
import { useNavigate } from "react-router-dom";

const STATUS_STYLES = {
  approved: "bg-green-100 text-green-800",
  pending:  "bg-yellow-100 text-yellow-800",
  rejected: "bg-red-100 text-red-800",
  offered:  "bg-blue-100 text-blue-800",
  accepted: "bg-purple-100 text-purple-800",
};

const JobCard = ({ title, location, status }) => {
  const navigate = useNavigate();
  const badgeClass =
    STATUS_STYLES[status] || "bg-gray-100 text-gray-800";

  return (
    <article className="p-6 bg-white rounded-lg shadow flex justify-between items-center">
      <section>
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-sm text-gray-500">
          {location || "Location not specified"}
        </p>
      </section>

      <section className="text-right flex flex-col items-end gap-2">
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${badgeClass}`}
        >
          {status}
        </span>
        <button
          onClick={() => navigate("/pipeline")}
          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm"
        >
          Manage
        </button>
      </section>
    </article>
  );
};

export default JobCard;