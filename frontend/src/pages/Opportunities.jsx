import { Sidebar } from "../components/dashboard/Sidebar";
import { OpportunityFilters } from "../components/opportunities/OpportunityFilters";
import { OpportunityList } from "../components/opportunities/OpportunityList";

export default function Opportunities({ setPage }) {
  return (
    <div className="flex min-h-screen bg-[#faf9f8]">
      <Sidebar setPage={setPage} activePage="opportunities" />
      <main className="ml-64 min-h-screen w-full">

        {/* Top Nav Bar */}
        <nav className="sticky top-0 z-50 flex items-center justify-between px-12 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="flex items-center gap-6 text-sm font-medium">
            <a href="#" className="text-gray-400 hover:text-[#035b9d] transition-colors">Dashboard</a>
            <a href="#" className="text-[#035b9d] font-bold border-b-2 border-[#035b9d] pb-0.5">Opportunities</a>
            <a href="#" className="text-gray-400 hover:text-[#035b9d] transition-colors">Applications</a>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search opportunities..."
                className="pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm border-none focus:outline-none focus:ring-2 focus:ring-blue-200 w-64"
              />
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">🔔</button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">❓</button>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#035b9d] font-bold text-xs">
              JD
            </div>
          </div>
        </nav>

        <div className="p-12">
          <header className="mb-12">
            <span className="text-sm font-semibold tracking-wider text-[#035b9d] uppercase">Explore Careers</span>
            <h1 className="text-4xl md:text-5xl font-extrabold mt-2 tracking-tight">Accredited Opportunities</h1>
            <p className="text-gray-500 mt-4 max-w-2xl text-lg leading-relaxed">
              Connecting South Africa's brightest minds with industry-leading SETA accredited learnerships and internships.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-3">
              <OpportunityFilters />
            </div>
            <div className="lg:col-span-9">
              <OpportunityList />
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}