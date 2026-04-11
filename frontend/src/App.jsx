import { useState } from "react";
import Home from "./pages/Home";
import StudentDashboard from "./pages/StudentDashboard";
import Opportunities from "./pages/Opportunities";

export default function App() {
  const [page, setPage] = useState("home");

  if (page === "dashboard") return <StudentDashboard setPage={setPage} />;
  if (page === "opportunities") return <Opportunities setPage={setPage} />;
  return <Home onStudentPortalClick={() => setPage("dashboard")} />;
}