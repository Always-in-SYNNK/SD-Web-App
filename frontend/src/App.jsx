import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import StudentDashboard from "./pages/StudentDashboard";
import Opportunities from "./pages/Opportunities";
import ValidationPipeline from "./pages/ValidationPipeline";
import PostOpportunity from "./pages/PostOpportunity";
import DefineRequirements from "./pages/DefineRequirements";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home page */}
        <Route path="/" element={<Home />} />

        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/opportunities" element={<Opportunities />} />

        {/* Employer Portal */}
        <Route path="/pipeline" element={<ValidationPipeline />} />
        <Route path="/post" element={<PostOpportunity />} />
        <Route path="/define" element={<DefineRequirements />} />
      </Routes>
    </BrowserRouter>
  );
}