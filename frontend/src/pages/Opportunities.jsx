import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import {
  getLocations,
  getFields,
  getNqfLevels,
  getOpportunities,
} from '../lib/api';
import { fetchMyApplications } from "../services/myApplicationService";
import { Sidebar } from "../components/dashboard/Sidebar";
import { OpportunityFilters } from "../components/opportunities/OpportunityFilters";
import { OpportunityList } from "../components/opportunities/OpportunityList";
import { MatchingOpportunities } from "../components/opportunities/matchingOpportunity";
import { NotificationDropdown } from "../components/notifications/notificationDropdown";
import { useNavigate } from "react-router-dom";

function getOpportunityKey(opportunity) {
  return String(opportunity?.id ?? opportunity?.opportunityId ?? "");
}

export default function Opportunities() {
  const [locations, setLocations] = useState([]);
  const [fields, setFields] = useState([]);
  const [nqfLevels, setNqfLevels] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [showMatches, setShowMatches] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const { token, user } = useAuth();
  const API = import.meta.env.VITE_API_URL;
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.profile) setProfile(data.profile);
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };
    if (token) fetchProfile();
  }, [token, API]);

  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest("[data-user-menu]")) setShowMenu(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "JD";

  const [filters, setFilters] = useState({
    field: '',
    location: '',
    nqfLevel: '',
    search: '',
    searchInput: '',
    page: 1,
    limit: 12,
  });

  const [items, setItems] = useState([]);
  const [appliedOpportunityIds, setAppliedOpportunityIds] = useState(new Set());
  const [summary, setSummary] = useState({
    opportunities: 0,
    qualifications: 0,
  });

  const [loadingFilters, setLoadingFilters] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    const loadAppliedOpportunityIds = async () => {
      if (!token) {
        setAppliedOpportunityIds(new Set());
        return;
      }

      try {
        const applications = await fetchMyApplications();
        const ids = new Set(
          (applications || [])
            .map((application) => {
              const opportunity = Array.isArray(application?.opportunities)
                ? application.opportunities[0]
                : application?.opportunities;
              return getOpportunityKey(opportunity);
            })
            .filter(Boolean)
        );

        setAppliedOpportunityIds(ids);
      } catch {
        setAppliedOpportunityIds(new Set());
      }
    };

    loadAppliedOpportunityIds();
  }, [token]);

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

        // Filter to only show opportunities, exclude qualifications
        const opportunitiesOnly = (result.data || []).filter(item => item._type === "opportunity");
        
        setItems(opportunitiesOnly);
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

    if (!showMatches) {
      loadItems();
    }
  }, [
    filters.search,
    filters.location,
    filters.nqfLevel,
    filters.field,
    filters.page,
    filters.limit,
    showMatches,
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

  const handleViewMatch = () => {
    setShowMatches(true);
  };

  const handleBackToAll = () => {
    setShowMatches(false);
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

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
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
            {!showMatches ? (
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
            ) : (
              <button
                type="button"
                onClick={handleBackToAll}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                ← Back to All Opportunities
              </button>
            )}

            <NotificationDropdown/>
              <section className="relative" data-user-menu>
                <button
                  type="button"
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2"
                  >
                  <section className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-gray-700 leading-tight truncate max-w-[160px]">
                      {profile?.full_name || user?.email || "User"}
                    </p>
                    <p className="text-xs text-gray-400 leading-tight">Applicant</p>
                  </section>

                  <figure className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#035b9d] font-bold text-xs shrink-0">
                   {initials}
                  </figure>
                </button>

                {showMenu && (
                  <section className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                    <button
                      type="button"
                      onClick={() => { setShowMenu(false); navigate("/dashboard"); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => { setShowMenu(false); logout(); }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                >
                Sign Out
                </button>
              </section>
              )}
            </section>
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

          {showMatches ? (
            <div className="space-y-8">
                <MatchingOpportunities appliedOpportunityIds={appliedOpportunityIds} />
            </div>
          ) : (
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
                  onViewMatch={handleViewMatch}
                  loading={loadingFilters}
                />
              </aside>
              <section className="lg:col-span-9">
                <OpportunityList
                  items={items}
                  appliedOpportunityIds={appliedOpportunityIds}
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
          )}
        </section>
      </section>
    </main>
  );
}
