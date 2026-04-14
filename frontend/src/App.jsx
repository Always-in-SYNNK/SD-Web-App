import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import StudentDashboard from "./pages/StudentDashboard";
import Opportunities from "./pages/Opportunities";
import OpportunityDetail from "./pages/OpportunityDetail";
import ValidationPipeline from "./pages/ValidationPipeline";
import PostOpportunity from "./pages/PostOpportunity";
import DefineRequirements from "./pages/DefineRequirements";
import AdminConsole from "./pages/AdminConsole";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/opportunities" element={<Opportunities />} />
        <Route path="/opportunities/:id" element={<OpportunityDetail />} />
        <Route path="/applications" element={<StudentDashboard />} />
        <Route path="/analytics" element={<StudentDashboard />} />
        <Route path="/verification" element={<StudentDashboard />} />
        <Route path="/admin" element={<AdminConsole />} />

        <Route path="/pipeline" element={<ValidationPipeline />} />
        <Route path="/post" element={<PostOpportunity />} />
        <Route path="/define" element={<DefineRequirements />} />
      </Routes>
    </BrowserRouter>
  );
}