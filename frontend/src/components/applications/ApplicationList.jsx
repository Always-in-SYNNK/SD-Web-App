import { ApplicationCard } from "./ApplicationCard";

/**
 * @param {{
 *   applications: Array,
 *   loading: boolean,
 *   error: string|null,
 *   onView: (id) => void,
 *   onUnapply: (id) => void,
 *   onAccept: (id) => void,
 * }} props
 */
export function ApplicationList({ applications, loading, error, onView, onUnapply, onAccept }) {
  if (loading) {
    return (
      <section className="flex items-center justify-center py-24">
        <i
          className="w-8 h-8 border-4 border-[#035b9d] border-t-transparent rounded-full animate-spin block"
          role="status"
          aria-label="Loading applications"
        />
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

  if (applications.length === 0) {
    return (
      <section className="flex flex-col items-center justify-center py-16 px-8 text-center bg-white rounded-lg shadow">
        <span className="text-5xl mb-4">📭</span>
        <h3 className="text-xl font-bold text-gray-800 mb-2">No applications yet</h3>
        <p className="text-gray-500 text-sm max-w-sm mb-6">
          You haven't submitted any applications. Explore opportunities to get started.
        </p>
        <a
          href="/opportunities"
          className="bg-[#035b9d] text-white px-6 py-2 rounded-full text-sm font-bold shadow-md hover:opacity-90 transition"
        >
          Explore Opportunities
        </a>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {applications.map((app) => (
        <ApplicationCard
          key={app.id}
          {...app}
          onView={() => onView(app.id)}
          onUnapply={() => onUnapply(app.id)}
          onAccept={() => onAccept(app.id)}
        />
      ))}
    </section>
  );
}
