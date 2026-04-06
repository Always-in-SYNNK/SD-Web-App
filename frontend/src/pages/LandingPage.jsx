import "../styles/LandingPage.css";
import UserCard from "../components/UserCard";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      
      <div className="card-container">
        <UserCard
          title="STUDENTS & APPLICANTS"
          description="Apply for courses, track applications, and manage your profile."
          buttonText="LOGIN TO STUDENT PORTAL"
          icon="🎓"
          highlight={true}
          onClick={() => navigate("/search")} // 👈 THIS IS THE KEY
        />

        <UserCard
          title="COURSE PROVIDERS"
          description="Post opportunities, manage applicants, and track progress."
          buttonText="LOGIN TO PROVIDER PORTAL"
          icon="📢"
          onClick={() => alert("Provider page coming soon")}
        />
      </div>

      <button className="admin-btn" onClick={() => alert("Admin page coming soon")}>
        SYSTEM ADMIN LOGIN
      </button>

      <footer>
        <p>Contact Support | Privacy Policy</p>
      </footer>

    </div>
  );
};

export default LandingPage;