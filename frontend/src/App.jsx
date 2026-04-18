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
import AuthDenied from "./pages/AuthDenied";
import ProtectedRoute from "./routes/protectedRoute";
import ProviderRegistration from "./pages/ProviderRegistration";
import Qualifications from "./pages/Qualifications";
import CompleteProfile from "./pages/CreateStudentProfile";
import EditProfile from "./pages/EditStudentProfile";

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

            {/*bypassing authentication  - not working, going straight to dashboard*/}
            <Route path="/dev-dashboard" element={<StudentDashboard />} />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute requiredRole="applicant">
                  <CompleteProfile />
                </ProtectedRoute>
            }/>

            <Route
              path="/profile/edit"
              element={
                <ProtectedRoute requiredRole="applicant">
                  <EditProfile />
                </ProtectedRoute>
            }/>


            {/* Authentication routes */}
            <Route path="/app-login" element={<ApplicantLogin />} />
            <Route path="/prov-login" element={<ProviderLogin />} />
            <Route path="/auth-error" element={<AuthError />} />
            <Route path="/unauthorized" element={<AuthDenied />} />
            <Route path ="/qualifications" element={<Qualifications/>}/>

            {/* Applicant (protected) */}
            <Route path="/opportunities" element={
              <ProtectedRoute requiredRole="applicant">
                <Opportunities />
              </ProtectedRoute>
            } />
            <Route path="/opportunities/:id" element={
              <ProtectedRoute requiredRole="applicant">
                <OpportunityDetail />
              </ProtectedRoute>
            } />    
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

          {/* DEV ONLY — floating login panel. Remove before deploying */}
          <TestLogin />
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}