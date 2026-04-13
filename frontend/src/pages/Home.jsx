import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { PortalCard } from "../components/PortalCard";
import { HowItWorks } from "../components/HowItWorks";
//import { useNavigate } from "react-router-dom";

export default function Home() {
  //const navigate = useNavigate();
  return (
    <main className="bg-[#faf9f8] min-h-screen">
      <Navbar />
      <Hero />
      <section className="py-24 px-8">
        <section className="max-w-screen-xl mx-auto">
          <h2 className="text-4xl font-extrabold text-center mb-4">Choose Your Portal</h2>
          <p className="text-center text-gray-500 mb-12">Whether you're building a career or a team, we have a path for you.</p>
          <section className="grid md:grid-cols-2 gap-8">
            <PortalCard
              title="Applicant Portal"
              description="Access accredited training, mentorship, and career opportunities tailored to your growth."
              items={["Industry-recognized Certifications", "Personal Brand Coaching", "Internship Pipeline"]}
              buttonText="Enter Applicant Portal"
              accentColor="border-t-[#035b9d]"
              //onClick={() => navigate("/app-login")}
            />
            <PortalCard
              title="Employer Portal"
              description="Source pre-verified talent and manage compliance effortlessly with our tools."
              items={["Verified Talent Shortlists", "Compliance Dashboards", "Payroll Solutions"]}
              buttonText="Enter Employer Portal"
              accentColor="border-t-yellow-600"
              //onClick={() => navigate("/pipeline")} 
            />{/* provider login */}
          </section>
        </section>
      </section>
      <HowItWorks />
    </main>
  );
}