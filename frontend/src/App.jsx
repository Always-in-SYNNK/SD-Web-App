import { useState } from "react";
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

        {/* Employer Portal */}
        <Route path="/pipeline" element={<ValidationPipeline />} />
        <Route path="/post" element={<PostOpportunity />} />
        <Route path="/define" element={<DefineRequirements />} />
      </Routes>
    </BrowserRouter>
  );
  const [page, setPage] = useState("home");

  if (page === "dashboard") return <StudentDashboard setPage={setPage} />;
  if (page === "opportunities") return <Opportunities setPage={setPage} />;
  return <Home onStudentPortalClick={() => setPage("dashboard")} />;
}