import "../styles/LandingPage.css";
import UserCard from "../components/UserCard";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <section className="landing-container">
      
      <section className="card-container">
        <UserCard
          title="STUDENTS & APPLICANTS"
          description="Apply for courses, track applications, and manage your profile."
          buttonText="LOGIN TO STUDENT PORTAL"
          icon="🎓"
          highlight={true}
          onClick={() => navigate("/search")}
        />

        <UserCard
          title="COURSE PROVIDERS"
          description="Post opportunities, manage applicants, and track progress."
          buttonText="LOGIN TO PROVIDER PORTAL"
          icon="📢"
          onClick={() => alert("Provider page coming soon")}
        />
      </section>

      <button className="admin-btn" onClick={() => alert("Admin page coming soon")}>
        SYSTEM ADMIN LOGIN
      </button>

      <footer>
        <p>Contact Support | Privacy Policy</p>
      </footer>

    </section>
  );
};

export default LandingPage;