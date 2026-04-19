const STATUS_STYLES = {
  Received: {
    dot: "bg-gray-400",
    badge: "bg-gray-100 text-gray-700",
  },
  Shortlisted: {
    dot: "bg-yellow-400",
    badge: "bg-yellow-100 text-yellow-800",
  },
  Offered: {
    dot: "bg-green-500",
    badge: "bg-green-100 text-green-800",
  },
  Accepted: {
    dot: "bg-blue-500",
    badge: "bg-blue-100 text-blue-800",
  },
  Rejected: {
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-800",
  },
};

const STATUS_ICONS = {
  Received: "📐",
  Shortlisted: "🏗️",
  Offered: "🌿",
  Accepted: "✅",
  Rejected: "❌",
};

/**
 * @param {{
 *   id: string|number,
 *   title: string,
 *   company?: string,
 *   location: string,
 *   status: "Received"|"Shortlisted"|"Offered"|"Accepted"|"Rejected",
 *   meta: string,          // e.g. "Submitted Oct 24, 2023" or "Expires in 3 days"
 *   onView: () => void,
 *   onUnapply: () => void,
 *   onAccept?: () => void, // only shown when status === "Offered"
 * }} props
 */
export function ApplicationCard({
  title,
  company,
  location,
  status,
  meta,
  //onView,
  onUnapply,
  onAccept,
}) {
  const styles = STATUS_STYLES[status] ?? STATUS_STYLES.Received;
  const icon = STATUS_ICONS[status] ?? "📄";
  const isOffered = status === "Offered";
  const canUnapply = status === "Received" || status === "Shortlisted";

  return (
    <article
      className={`bg-white p-8 rounded-xl flex items-start justify-between
        hover:scale-[1.015] transition-all duration-300 border border-gray-100
        hover:shadow-md group
        ${isOffered ? "border-l-4 border-l-green-500 shadow-sm" : ""}
      `}
    >
      {/* Left: icon + details */}
      <section className="flex gap-6">
        <figure className="w-16 h-16 rounded-lg bg-[#f5f3f3] flex items-center justify-center text-2xl shrink-0">
          {icon}
        </figure>

        <section className="space-y-1">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#035b9d] transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-500 font-medium">
            {company ? `${company} • ${location}` : location}
          </p>

          <section className="flex items-center gap-4 pt-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${styles.badge}`}
            >
              <i className={`w-2 h-2 rounded-full mr-2 ${styles.dot}`} />
              {status}
            </span>
            <time className="text-xs text-gray-400 font-medium">{meta}</time>
          </section>
        </section>
      </section>

      {/* Right: actions */}
      <nav className="flex flex-col gap-2 min-w-[120px]">
        <button
          onClick={(e)=> e.stopPropagation()} //Will implement onView later
          className="w-full px-6 py-2 rounded-full text-xs font-bold bg-[#efeded] text-gray-800 hover:bg-[#e3e2e2] transition-colors"
        >
          View
        </button>

        {isOffered ? (
          <button
            onClick={onAccept}
            className="w-full px-6 py-2 rounded-full text-xs font-bold bg-green-500 text-white shadow-md shadow-green-100 hover:opacity-90 transition-opacity"
          >
            Accept
          </button>
        ) : canUnapply ? (
          <button
            onClick={onUnapply}
            className="w-full px-6 py-2 rounded-full text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
          >
            Unapply
          </button>
        ) : null}
      </nav>
    </article>
  );
}
