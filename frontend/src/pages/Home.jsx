//SD-Web-App/frontend/src/pages/Home.jsx
// frontend/src/pages/Home.jsx
import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { PortalCard } from "../components/PortalCard";
import { HowItWorks } from "../components/HowItWorks";

export default function Home() {
  return (
    <main className="bg-[#faf9f8] min-h-screen">
      <Navbar />
      <Hero />
      
      {/* What We Offer Section */}
      <section className="py-24 px-8">
        <section className="max-w-screen-xl mx-auto">
          <h2 className="text-4xl font-extrabold text-center mb-4">Choose Your Path</h2>
          <p className="text-center text-gray-500 mb-12">
            Whether you're starting your career or building your team, we have the right solution for you.
          </p>
          <section className="grid md:grid-cols-2 gap-8">
            <PortalCard
              title="Applicant Portal"
              description="Access accredited learnerships, internships, and apprenticeship opportunities tailored to your skills and goals."
              items={[
                "SETA-accredited programmes",
                "Free applicant profile",
                "Track your applications",
                "Deadline reminders"
              ]}
              buttonText="Enter Applicant Portal"
              accentColor="border-t-[#035b9d]"
            />
            <PortalCard
              title="Employer Portal"
              description="Post learnership opportunities and find verified, motivated talent ready to grow with your organisation."
              items={[
                "Post learnerships & internships",
                "Application management dashboard",
                "Shortlist candidates",
                "Analytics & reporting"
              ]}
              buttonText="Enter Employer Portal"
              accentColor="border-t-[#f59e0b]"
            />
          </section>
        </section>
      </section>
      
      <HowItWorks />
    </main>
  );
}