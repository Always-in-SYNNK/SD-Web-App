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
import ApplicantLogin from "./pages/ApplicantLogin";
import AuthError from "./pages/AuthError";
import ProtectedRoute from "./routes/protectedRoute";

export default function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "772613851424-kt1l3k1tioklhmok3104276d1ibp4el9.apps.googleusercontent.com";
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/opportunities" element={<Opportunities />} />
            <Route path="/opportunities/:id" element={<OpportunityDetail />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/applications" element={<StudentDashboard />} />
            <Route path="/analytics" element={<StudentDashboard />} />
            <Route path="/verification" element={<StudentDashboard />} />

            {/* Employer routes */}
            <Route path="/pipeline" element={<ValidationPipeline />} />
            <Route path="/post" element={<PostOpportunity />} />
            <Route path="/define" element={<DefineRequirements />} />

            {/* Authentication routes */}
            <Route path="/app-login" element={<ApplicantLogin />} />
            <Route path="/auth-error" element={<AuthError />} />

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
