import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";

import Home from "./pages/Home";
import StudentDashboard from "./pages/StudentDashboard";
import Opportunities from "./pages/Opportunities";
import OpportunityDetail from "./pages/OpportunityDetail";
//import ValidationPipeline from "./pages/ValidationPipeline";
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

            {/* Authentication routes */}
            <Route path="/app-login" element={<ApplicantLogin />} />
            <Route path="/auth-error" element={<AuthError />} />
            <Route path="/unauthorized" element={<h1>Unauthorized</h1>} />

            <Route path="/opportunities" element={<Opportunities />} />
            <Route path="/opportunities/:id" element={<OpportunityDetail />} />

            {/* Applicant routes */}
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


            {/* Employer routes 
            <Route path="/pipeline" element={
              <ProtectedRoute requiredRole="provider">
                <ValidationPipeline />
              </ProtectedRoute>
            } />*/}
            <Route path="/post" element={<ProtectedRoute requiredRole="provider">
                <PostOpportunity />
              </ProtectedRoute>
            } />
            <Route path="/define" element={
              <ProtectedRoute requiredRole="provider">
                <DefineRequirements />
              </ProtectedRoute>
            } />

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
