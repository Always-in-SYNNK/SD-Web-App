import { useState } from "react";
import { Sidebar } from "../components/dashboard/Sidebar";
import { OpportunityFilters } from "../components/opportunities/OpportunityFilters";
import { OpportunityList } from "../components/opportunities/OpportunityList";

export default function Opportunities() {
  const [search, setSearch] = useState("");
  const [committedSearch, setCommittedSearch] = useState("");
  const [location, setLocation] = useState("");
  const [nqf, setNqf] = useState("");
  const [field, setField] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setCommittedSearch(search);
    }
  };

  return (
    <main className="flex min-h-screen bg-[#faf9f8]">
      <Sidebar activePage="/opportunities" />
      <section className="ml-64 min-h-screen w-full">

        <nav className="sticky top-0 z-50 flex items-center justify-between px-12 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <section className="flex items-center gap-6 text-sm font-medium">
            <a href="/" className="text-gray-400 hover:text-[#035b9d]">Home</a>
            <a href="/dashboard" className="text-gray-400 hover:text-[#035b9d]">Dashboard</a>
            <a href="/opportunities" className="text-[#035b9d] font-bold border-b-2 border-[#035b9d] pb-0.5">Opportunities</a>
          </section>
          <section className="flex items-center gap-3">
            <section className="relative">
              <i className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</i>
              <input
                type="text"
                placeholder="Search and press Enter..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm border-none focus:outline-none focus:ring-2 focus:ring-blue-200 w-64"
              />
            </section>
            <button className="p-2 hover:bg-gray-100 rounded-full">🔔</button>
            <button className="p-2 hover:bg-gray-100 rounded-full">❓</button>
            <figure className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#035b9d] font-bold text-xs">
              JD
            </figure>
          </section>
        </nav>

        <section className="p-12">
          <header className="mb-12">
            <small className="text-sm font-semibold tracking-wider text-[#035b9d] uppercase">Explore Careers</small>
            <h1 className="text-4xl md:text-5xl font-extrabold mt-2 tracking-tight">Accredited Opportunities</h1>
            <p className="text-gray-500 mt-4 max-w-2xl text-lg leading-relaxed">
              Connecting South Africa's brightest minds with industry-leading SETA accredited learnerships and internships.
            </p>
          </header>

          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <aside className="lg:col-span-3">
              <OpportunityFilters
                location={location} setLocation={setLocation}
                nqf={nqf} setNqf={setNqf}
                field={field} setField={setField}
              />
            </aside>
            <section className="lg:col-span-9">
              <OpportunityList search={committedSearch} location={location} nqf={nqf} field={field} />
            </section>
          </section>
        </section>
      </section>
    </main>
  );
}