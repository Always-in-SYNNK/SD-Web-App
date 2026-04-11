import { OpportunityCard } from "./OpportunityCard";

const opportunities = [
  {
    title: "Junior Full Stack Developer Learnership",
    company: "Standard Bank South Africa",
    description: "Master modern web development with our intensive 12-month program. Gain hands-on experience in React, Node.js, and cloud deployments while working on real banking solutions.",
    location: "Sandton, GP",
    duration: "12 Months",
    nqf: "NQF Level 5",
    featured: true,
  },
  {
    title: "Electrical Engineering Artisan Internship",
    company: "Murray & Roberts Engineering",
    description: "Join our renewable energy division for a hands-on apprenticeship in industrial electrical systems. Ideal for candidates with a passion for sustainable infrastructure.",
    location: "Cape Town, WC",
    duration: "18 Months",
    nqf: "NQF Level 4",
    featured: false,
  },
  {
    title: "Commercial Banking & Compliance Learnership",
    company: "First National Bank (FNB)",
    description: "Develop deep expertise in regulatory compliance and commercial financial services. A comprehensive rotation-based program for future finance leaders.",
    location: "Umhlanga, KZN",
    duration: "12 Months",
    nqf: "NQF Level 6",
    featured: false,
  },
  {
    title: "Digital Design & Multimedia Production",
    company: "Ogilvy South Africa",
    description: "Kickstart your creative career in a world-class agency environment. Learn motion graphics, UI design, and digital content strategy from industry veterans.",
    location: "Remote, SA",
    duration: "12 Months",
    nqf: "NQF Level 5",
    featured: false,
  },
];

export function OpportunityList() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Showing <strong>24</strong> verified opportunities</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Sort by:</span>
          <select className="bg-transparent border-none text-sm font-bold text-[#035b9d] focus:ring-0">
            <option>Recently Added</option>
            <option>Highest Stipend</option>
            <option>Closing Soon</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {opportunities.map((opp) => (
          <OpportunityCard key={opp.title} {...opp} />
        ))}
      </div>

      <div className="pt-8 flex justify-center">
        <nav className="flex items-center gap-2">
          {["‹", "1", "2", "3", "...", "12", "›"].map((item, i) => (
            <button
              key={i}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                item === "1"
                  ? "bg-[#035b9d] text-white"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}