import { useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";

import Home from "./pages/Home";
import StudentDashboard from "./pages/StudentDashboard";
import Opportunities from "./pages/Opportunities";
import ApplicantLogin from "./pages/ApplicantLogin";
import AuthError from "./pages/AuthError";
import ProtectedRoute from "./routes/protectedRoute";

function AppContent() {
  const [page, setPage] = useState("home");

  if (page === "dashboard") {
    return (
      <ProtectedRoute setPage={setPage}>
        <StudentDashboard setPage={setPage} />
      </ProtectedRoute>
    );
  }
  if (page === "opportunities") return <Opportunities setPage={setPage} />;
  if (page === "applogin") return <ApplicantLogin setPage={setPage} />;
  if (page === "autherror") return <AuthError setPage={setPage} />;
  return (
    <Home
      onStudentPortalClick={() => {
        localStorage.setItem("selectedRole", "applicant");
        setPage("applogin");
      }}
    />
  );
}

export default function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "772613851424-kt1l3k1tioklhmok3104276d1ibp4el9.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
