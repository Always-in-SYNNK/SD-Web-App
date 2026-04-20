import { QualificationItem } from "./QualificationItem";

/*hardcoded qualifications the student has*/
const qualifications = [
  {
    icon: "🏛️",
    title: "Bachelor of Architecture (Honours)",
    org: "University of Cape Town",
    date: "Nov 2023",
    accent: true,
  },
  {
    icon: "📋",
    title: "Project Management Professional (PMP)",
    org: "PMI Institute",
    date: "In Review",
    accent: false,
  },
  {
    icon: "🌿",
    title: "Green Building Professional Cert",
    org: "GBCSA",
    date: "Jan 2024",
    accent: false,
  },
];

export function QualificationList() {
  return (
    <section className="bg-[#f5f3f3] rounded-xl p-8 mb-8">
      <header className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold">Your Portfolio</h3>
        <nav className="flex space-x-2">
          <button className="p-2 rounded-lg bg-white text-gray-500 hover:bg-gray-100">🔍</button>
          <button className="p-2 rounded-lg bg-white text-gray-500 hover:bg-gray-100">⚙️</button>
        </nav>
      </header>
      <section className="space-y-4">
        {qualifications.map((q) => (
          <QualificationItem key={q.title} {...q} />
        ))}
      </section>
    </section>
  );
}