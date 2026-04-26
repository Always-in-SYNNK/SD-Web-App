import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  applyForAdmin,
  getMyAdminApplicationStatus,
} from "../../services/adminService";

// ── Admin status badge ────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending: {
    label: "Pending Review",
    icon: "hourglass_empty",
    pill: "bg-amber-50 text-amber-700 border-amber-200",
    icon_color: "text-amber-500",
    description: "Your application is being reviewed.",
  },
  rejected: {
    label: "Not Approved",
    icon: "cancel",
    pill: "bg-red-50 text-red-600 border-red-200",
    icon_color: "text-red-400",
    description: "Your application was not approved.",
  },
};

export default function AdminSection({ isAdmin, source = "applicant" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [appStatus, setAppStatus] = useState(null); // null | 'pending' | 'rejected'
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isAdmin) {
      queueMicrotask(() => setLoading(false));
      return;
    }

    (async () => {
      try {
        const data = await getMyAdminApplicationStatus();
        setAppStatus(data?.status ?? null); // null means no application yet
        setErrorMessage("");
      } catch (error) {
        setAppStatus(null);
        setErrorMessage(error?.message || "Could not load admin application status.");
      } finally {
        setLoading(false);
      }
    })();
  }, [isAdmin]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await applyForAdmin();
      setAppStatus("pending");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error?.message || "Could not submit admin application.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="h-12 rounded-lg bg-gray-100 animate-pulse" />
    );
  }

  // ── State 1: Already an admin ────────────────────────────────────────────
  if (isAdmin) {
    return (
      <button
        onClick={() => navigate("/admin/applications", { state: { from: location.pathname, source } })}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#d2e4ff] text-[#035b9d] rounded-lg font-semibold text-sm hover:bg-[#bdd6ff] transition-colors group"
      >
        <span className="flex items-center gap-2">
          {/* shield icon */}
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
          </svg>
          Admin Portal
        </span>
        <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    );
  }

  // ── State 2: Pending or Rejected ─────────────────────────────────────────
  if (appStatus === "pending" || appStatus === "rejected") {
    const cfg = STATUS_CONFIG[appStatus];
    return (
      <div className="space-y-2">
        <div className={`w-full px-4 py-3 rounded-lg border ${cfg.pill} opacity-80 cursor-not-allowed`}>
          <div className="flex items-center gap-3">
            {/* material icon via span — works if you have the font loaded, else swap for SVG */}
            <span className={`material-symbols-outlined text-base leading-none ${cfg.icon_color}`}>
              {cfg.icon}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold whitespace-nowrap">Admin Portal</p>
              <span className="mt-1 inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-current/20 bg-white/60">
                {appStatus}
              </span>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-gray-400 px-1">{cfg.description}</p>
      </div>
    );
  }

  // ── State 3: No application yet ──────────────────────────────────────────
  return (
    <div className="space-y-2">
      <button
        onClick={handleApply}
        disabled={applying}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#035b9d] text-white rounded-full text-sm font-semibold hover:bg-[#024a82] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {applying ? (
          <>
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            Submitting…
          </>
        ) : (
          <>
            {/* person-add icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            Apply for Admin
          </>
        )}
      </button>

      {errorMessage && (
        <p className="text-[11px] text-red-500 px-1">{errorMessage}</p>
      )}
    </div>
  );
}