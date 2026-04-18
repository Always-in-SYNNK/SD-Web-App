import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Sidebar as ApplicantSidebar } from "../components/dashboard/Sidebar";
import EmployerSidebar from "../components/layout/Sidebar";

import { useAuth } from "../hooks/useAuth";
import {
  getAdminApplications,
  applyForAdmin,
  grantAdminAccess,
  rejectAdminApplication,
} from "../services/adminService";

export default function AdminAccessApplications() {
  const location = useLocation();
  const source = location.state?.source || "applicant";
  const SidebarComponent =
    source === "employer" ? EmployerSidebar : ApplicantSidebar;

  const { user, reloadUser } = useAuth();

  const [applications, setApplications] = useState([]);
  const [hasApplied, setHasApplied] = useState(false);

  /* ───────────────────────────────────────── */
  useEffect(() => {
    if (!user) return;

    fetchApplications();
    checkIfApplied();
  }, [user]);

  const fetchApplications = async () => {
    const data = await getAdminApplications();
    setApplications(data);
  };

  const checkIfApplied = async () => {
    const { data } = await supabase
      .from("admin_applications")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "pending");

    setHasApplied(data.length > 0);
  };

  /* ───────────────────────────────────────── */
  const handleApply = async () => {
    await applyForAdmin(user.id);
    setHasApplied(true);
  };

  const handleGrant = async (app) => {
    await grantAdminAccess(app);
    await fetchApplications();
  };

  const handleReject = async (id) => {
    await rejectAdminApplication(id);
    await fetchApplications();
  };

  /* ───────────────────────────────────────── */
  return (
    <div className="flex min-h-screen">
      <SidebarComponent />

      <main className="ml-64 w-full p-10">

        {!user?.isAdmin && (
          <>
            <h2 className="text-2xl font-bold">Admin Access</h2>

            {!hasApplied ? (
              <button onClick={handleApply}>
                Apply to be Admin
              </button>
            ) : (
              <p>Application Pending...</p>
            )}
          </>
        )}

        {user?.isAdmin && (
          <>
            <h2 className="text-2xl font-bold mb-4">
              Admin Applications
            </h2>

            {applications.map((app) => (
              <div key={app.id} className="border p-4 mb-2">
                <p>{app.profiles.full_name}</p>

                <button onClick={() => handleGrant(app)}>
                  Grant
                </button>

                <button onClick={() => handleReject(app.id)}>
                  Reject
                </button>
              </div>
            ))}
          </>
        )}

      </main>
    </div>
  );
}