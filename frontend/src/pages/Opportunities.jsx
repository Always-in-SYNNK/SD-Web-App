import { useEffect, useState } from "react";
import {
  getLocations,
  getFields,
  getNqfLevels,
  getOpportunities,
} from '../lib/api';
import { Sidebar } from "../components/dashboard/Sidebar";
import { OpportunityFilters } from "../components/opportunities/OpportunityFilters";
import { OpportunityList } from "../components/opportunities/OpportunityList";
import { NotificationDropdown } from "../components/notifications/notificationDropdown";

export default function Opportunities() {
  const [locations, setLocations] = useState([]);
  const [fields, setFields] = useState([]);
  const [nqfLevels, setNqfLevels] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [pagination, setPagination] = useState(null);

  const [filters, setFilters] = useState({
    field: '',
    location: '',
    nqfLevel: '',
    search: '',
    page: 1,
    limit: 12,
  });

  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({
    opportunities: 0,
    qualifications: 0,
  });

  const [loadingFilters, setLoadingFilters] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        setLoadingFilters(true);
        setError("");

        const [locationsRes, fieldsRes, nqfLevelsRes] = await Promise.all([
          getLocations(),
          getFields(),
          getNqfLevels()
        ]);

        console.log("locationsRes:", locationsRes);
        console.log("fieldsRes:", fieldsRes);
        console.log("nqfLevelsRes:", nqfLevelsRes);

        setLocations(locationsRes.data || []);
        setFields(fieldsRes.data || []);
        setNqfLevels(nqfLevelsRes.data || []);
      } catch (err) {
        setError(err.message || "Failed to load filters");
      } finally {
        setLoadingFilters(false);
      }
    };

    loadDropdowns();
  }, []);

  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoadingItems(true);
        setError("");

        const result = await getOpportunities({
          search: filters.search,
          location: filters.location,
          nqfLevel: filters.nqfLevel,
          field: filters.field,
          page: filters.page,
          limit: filters.limit,
        });

        setItems(result.data || []);
        setPagination(result.pagination || null);
        setSummary(
          result.summary || {
            opportunities: 0,
            qualifications: 0,
          }
        );
      } catch (err) {
        setError(err.message || "Failed to load opportunities");
      } finally {
        setLoadingItems(false);
      }
    };

    loadItems();
  }, [
    filters.search,
    filters.location,
    filters.nqfLevel,
    filters.field,
    filters.page,
    filters.limit,
  ]);

  const handleSearchChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      searchInput: e.target.value,
    }));
  };

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const resetFilters = () => {
    setFilters((prev) => ({
      ...prev,
      searchInput: "",
      search: "",
      location: "",
      nqfLevel: "",
      field: "",
      page: 1,
    }));
  };
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      setFilters((prev) => ({
        ...prev,
        search: prev.searchInput.trim(),
        page: 1,
      }));
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
                value={filters.searchInput}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                className="pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm border-none focus:outline-none focus:ring-2 focus:ring-blue-200 w-64"
              />
            </section>

            <NotificationDropdown/>
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
                location={filters.location}
                nqfLevel={filters.nqfLevel}
                field={filters.field}
                setLocation={(value) => updateFilter("location", value)}
                setNqfLevel={(value) => updateFilter("nqfLevel", value)}
                setField={(value) => updateFilter("field", value)}
                locations={locations}
                nqfLevels={nqfLevels}
                fields={fields}
                onReset={resetFilters}
                loading={loadingFilters}
              />
            </aside>
            <section className="lg:col-span-9">
              <OpportunityList
                items={items}
                loading={loadingItems}
                error={error}
                summary={summary}
                pagination={pagination}
                onPageChange={(page) =>
                  setFilters((prev) => ({ ...prev, page }))
                }
              />
            </section>
          </section>
        </section>
      </section>
    </main>
  );
}
