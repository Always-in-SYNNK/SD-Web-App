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
import AdminConsole from "./pages/AdminConsole";
import AdminAccessApplications from "./pages/AdminAccessApplications";
import ApplicantLogin from "./pages/ApplicantLogin";
import ProviderLogin from "./pages/ProviderLogin";
import AuthError from "./pages/AuthError";
import AuthDenied from "./pages/AuthDenied";
import ProtectedRoute from "./routes/protectedRoute";
import ProviderRegistration from "./pages/ProviderRegistration";
import Qualifications from "./pages/Qualifications";
import MyApplications from "./pages/MyApplications";
import CompleteProfile from "./pages/CreateStudentProfile";
import EditProfile from "./pages/EditStudentProfile";
import EmployerApplications from './pages/EmployerApplications';
import ViewStudentProfile from "./pages/ViewStudentProfile";
import Notifications from "./pages/Notifications";
import QualificationDetail from "./pages/QualificationDetail";
import AnalyticsPage from "./pages/AnalyticsPage";
import AdminAnalytics from "./pages/AdminAnalytics";
import AIChatWidget from "./components/chat/AIChatWidget";

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
       
            {/* Authentication routes */}
            <Route path="/app-login" element={<ApplicantLogin />} />
            <Route path="/prov-login" element={<ProviderLogin />} />
            <Route path="/auth-error" element={<AuthError />} />
            <Route path="/unauthorized" element={<AuthDenied />} />
            
            {/* Applicant routes */}
            <Route path="/onboarding" element={
                <ProtectedRoute requiredRole="applicant">
                  <CompleteProfile />
                </ProtectedRoute>
            }/>

            <Route path="/profile/edit" element={
                <ProtectedRoute requiredRole="applicant">
                  <EditProfile />
                </ProtectedRoute>
            }/>
            <Route path="/dashboard" element={ 
              <ProtectedRoute requiredRole="applicant">
                <StudentDashboard />
              </ProtectedRoute>
            } />
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
            <Route path="/qualifications" element={
              <ProtectedRoute requiredRole="applicant">
                <Qualifications />
              </ProtectedRoute>
            } />
            <Route path="/qualifications/:id" element={
              <ProtectedRoute requiredRole="applicant">
                <QualificationDetail />
              </ProtectedRoute>
            } /> 
            <Route path="/applications" element={
              <ProtectedRoute requiredRole="applicant">
                <MyApplications />
              </ProtectedRoute>
            } />
            <Route path="/verification" element={
              <ProtectedRoute requiredRole="applicant">
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile/view" element={
              <ProtectedRoute requiredRole="applicant">
                <ViewStudentProfile />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute requiredRole="applicant">
                <Notifications />
              </ProtectedRoute>
            }/>

            {/* Admin console — shared, sidebar switches on location.state.source */}
            {/* Admin routes — no layout wrapper needed anymore */}
            <Route path="/admin/console" element={
              <ProtectedRoute requiredRole="admin">
                <AdminConsole />
              </ProtectedRoute>
            } />
            <Route path="/admin/applications" element={
              <ProtectedRoute requiredRole="admin">
                <AdminAccessApplications />
              </ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
              <ProtectedRoute requiredRole="admin">
                <AdminAnalytics />
              </ProtectedRoute>
            } />
                     
            {/* Employer routes */}
            <Route path="/opportunity/:opportunityId/applications" element={
              <ProtectedRoute requiredRole="provider">
                <EmployerApplications />
              </ProtectedRoute>
            } />
            
            <Route path="/pipeline" element={
              <ProtectedRoute requiredRole="provider">
                 <ValidationPipeline />
              </ProtectedRoute> 
            } />
            <Route path="/post" element={
              <ProtectedRoute requiredRole="provider">
                <PostOpportunity />
              </ProtectedRoute>
            } />
            <Route path="/opportunities/edit/:id" element={
              <ProtectedRoute requiredRole="provider">
                <PostOpportunity />
              </ProtectedRoute>
            } />
            <Route path="/provider-registration" element={
                <ProviderRegistration />
            } />
            <Route path="/analytics" element={
              <ProtectedRoute requiredRole="provider">
                <AnalyticsPage />
              </ProtectedRoute>
            } />
          </Routes>
          
          {/* AI Chat Widget - appears on every page for logged-in users */}
          <AIChatWidget />
          
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}