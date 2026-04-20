import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { QualificationCard } from "../components/opportunities/QualificationCard";
import { Sidebar } from "../components/dashboard/Sidebar";
import { OpportunityFilters } from "../components/opportunities/OpportunityFilters";
import { NotificationDropdown } from "../components/notifications/notificationDropdown";

export default function Qualifications() {
  const [search, setSearch] = useState("");
  const [committedSearch, setCommittedSearch] = useState("");
  const [quals, setQuals] = useState([]);
  const [location, setLocation] = useState("");
  const [nqf, setNqf] = useState("");
  const [field, setField] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuals = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.rpc(
        committedSearch ? "search_qualifications" : "get_all_qualifications",
        committedSearch ? { search_term: committedSearch } : undefined
      );
      if (error) { setError(error.message); } else { setQuals(data || []); }
      setLoading(false);
    };
    fetchQuals();
  }, [committedSearch]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") setCommittedSearch(search);
  };

  return (
    <main className="flex min-h-screen bg-[#faf9f8]">
      <Sidebar activePage="/qualifications" />
      <section className="ml-64 min-h-screen w-full">
        <nav className="sticky top-0 z-50 flex items-center justify-between px-12 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <section className="flex items-center gap-6 text-sm font-medium">
            <a href="/" className="text-gray-400 hover:text-[#035b9d]">Home</a>
            <a href="/dashboard" className="text-gray-400 hover:text-[#035b9d]">Dashboard</a>
            <a href="/qualifications" className="text-[#035b9d] font-bold border-b-2 border-[#035b9d] pb-0.5">Qualifications</a>
          </section>
          <section className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search and press Enter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-4 pr-4 py-2 bg-gray-100 rounded-lg text-sm w-64"
            />
            <NotificationDropdown />
            <button className="p-2 hover:bg-gray-100 rounded-full">❓</button>
            <figure className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#035b9d] font-bold text-xs">
              JD
            </figure>
          </section>
        </nav>

        <section className="p-12">
          <header className="mb-12">
            <small className="text-sm font-semibold tracking-wider text-[#035b9d] uppercase">Browse Credentials</small>
            <h1 className="text-4xl md:text-5xl font-extrabold mt-2 tracking-tight">Accredited Qualifications</h1>
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
              {loading && <p>Loading qualifications...</p>}
              {error && <p className="text-red-500">{error}</p>}
              {!loading && !error && (
                <section className="flex flex-col gap-4">
                  {quals.length === 0
                    ? <p className="text-gray-400">No qualifications found.</p>
                    : quals.map((q) => <QualificationCard key={q.qual_id} {...q} />)
                  }
                </section>
              )}
            </section>
          </section>
        </section>
      </section>
    </main>
  );
}