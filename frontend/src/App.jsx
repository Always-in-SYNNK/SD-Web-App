// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";

import Home from "./pages/Home";
import StudentDashboard from "./pages/StudentDashboard";
import Opportunities from "./pages/Opportunities";
import OpportunityDetail from "./pages/OpportunityDetail";
import ValidationPipeline from "./pages/ValidationPipeline";
import PostOpportunity from "./pages/PostOpportunity";
import DefineRequirements from "./pages/DefineRequirements";
import AdminConsole from "./pages/AdminConsole";
import AdminAccessApplications from "./pages/AdminAccessApplications";
import ApplicantLogin from "./pages/ApplicantLogin";
import ProviderLogin from "./pages/ProviderLogin";
import AuthError from "./pages/AuthError";
import ProtectedRoute from "./routes/protectedRoute";
import ProviderRegistration from "./pages/ProviderRegistration";


export default function App() {
  const clientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    "772613851424-kt1l3k1tioklhmok3104276d1ibp4el9.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Home */}
            <Route path="/" element={<Home />} />

            {/* Dev bypass — no auth required */}
            <Route path="/dev-dashboard" element={<StudentDashboard />} />

            {/* Authentication */}
            <Route path="/app-login"     element={<ApplicantLogin />} />
            <Route path="/prov-login"    element={<ProviderLogin />} />
            <Route path="/auth-error"    element={<AuthError />} />
            <Route path="/unauthorized"  element={<h1 className="p-8 text-2xl font-bold">Unauthorized</h1>} />

            {/* Public */}
            <Route path="/opportunities"     element={<Opportunities />} />
            <Route path="/opportunities/:id" element={<OpportunityDetail />} />

            {/* Applicant (protected) */}
            <Route path="/dashboard" element={
              <ProtectedRoute requiredRole="applicant">
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/applications" element={
              <ProtectedRoute requiredRole="applicant">
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute requiredRole="applicant">
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/verification" element={
              <ProtectedRoute requiredRole="applicant">
                <StudentDashboard />
              </ProtectedRoute>
            } />

            {/* Admin console — shared, sidebar switches on location.state.source */}
            <Route path="/admin" element={<AdminConsole />} />

            {/* Admin access applications — works for both applicant + employer */}
            <Route path="/admin-access" element={<AdminAccessApplications />} />

            {/* Employer */}
            <Route path="/pipeline"              element={<ValidationPipeline />} />
            <Route path="/post"                  element={<PostOpportunity />} />
            <Route path="/define"                element={<DefineRequirements />} />
            <Route path="/provider-registration" element={<ProviderRegistration />} />
          </Routes>

        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}