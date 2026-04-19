import { useEffect, useState } from "react";
import { OpportunityCard } from "./OpportunityCard";
import { fetchMyApplications } from "../../services/myApplicationService";

export function OpportunityList({
  items = [],
  loading = false,
  error = "",
  summary = { opportunities: 0, qualifications: 0 },
  pagination = null,
  onPageChange,
}) {
  const [appliedOpportunityIds, setAppliedOpportunityIds] = useState(new Set());

  useEffect(() => {
    const fetchAppliedOpportunityIds = async () => {
      try {
        const applications = await fetchMyApplications();
        const ids = new Set(
          (applications || [])
            .map((application) => {
              const opportunity = Array.isArray(application?.opportunities)
                ? application.opportunities[0]
                : application?.opportunities;

              return opportunity?.id;
            })
            .filter(Boolean)
        );

        setAppliedOpportunityIds(ids);
      } catch {
        // Keep the opportunities view functional even if applied-status lookup fails.
        setAppliedOpportunityIds(new Set());
      }
    };

    fetchAppliedOpportunityIds();
  }, [items]);

  if (loading) {
    return (
      <section className="flex items-center justify-center py-24">
        <i className="w-8 h-8 border-4 border-[#035b9d] border-t-transparent rounded-full animate-spin block" role="status" aria-label="Loading" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-bold text-red-600">Something went wrong</p>
        <p className="text-sm text-gray-400 mt-1">{error}</p>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-bold text-gray-700">No opportunities found</p>
        <p className="text-sm text-gray-400 mt-1">
          Try adjusting your filters
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <small className="text-sm text-gray-500">
          Showing <strong>{summary.opportunities}</strong> opportunities and <strong>{summary.qualifications}</strong> qualifications
        </small>

        <nav className="flex items-center gap-2">
          <small className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Sort by:
          </small>
          <select className="bg-transparent border-none text-sm font-bold text-[#035b9d] focus:ring-0">
            <option>Recently Added</option>
            <option>Closing Soon</option>
            <option>Highest Stipend</option>
          </select>
        </nav>
      </header>

      <section className="flex flex-col gap-4">
        {items.map((item) => (
          <OpportunityCard
            key={item.id}
            {...item}
            isApplied={appliedOpportunityIds.has(item.id)}
          />
        ))}
      </section>

      {pagination && pagination.totalPages > 1 && (
        <section className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={() => onPageChange?.(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            onClick={() => onPageChange?.(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </section>
      )}

    </section>
  );
}
