import { useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import StudentDashboard from "./pages/StudentDashboard";
import Opportunities from "./pages/Opportunities";

function AppContent() {
  const [page, setPage] = useState("home");

  if (page === "dashboard") return <StudentDashboard setPage={setPage} />;
  if (page === "opportunities") return <Opportunities setPage={setPage} />;
  return <Home onStudentPortalClick={() => setPage("dashboard")} />;
}

export default function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_CLIENT_ID";

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
