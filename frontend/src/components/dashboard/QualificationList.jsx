import { QualificationItem } from "./QualificationItem";

export function QualificationList({ qualifications = [] }) {
  return (
    <section className="bg-[#f5f3f3] rounded-xl p-8 mb-8">
      <header className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold">Your Portfolio</h3>
      </header>
      <section className="space-y-4">
        {qualifications.length === 0 ? (
          <p className="text-gray-400 text-sm">No qualifications added yet.</p>
        ) : (
          qualifications.map((q) => (
            <QualificationItem
              key={q.id}
              icon="🎓"
              title={q.qualification_name ?? q.title}
              org={q.originator ?? ""}
              date={q.date_obtained ?? q.status ?? ""}
              accent={q.status === "completed"}
            />
          ))
        )}
      </section>
    </section>
  );
}