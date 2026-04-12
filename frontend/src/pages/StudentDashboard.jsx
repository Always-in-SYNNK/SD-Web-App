import { Sidebar } from "../components/dashboard/Sidebar";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { UploadBanner } from "../components/dashboard/UploadBanner";
import { QualificationsList } from "../components/dashboard/QualificationsList";
import { OpportunityCard } from "../components/dashboard/OpportunityCard";
import { VerificationCard } from "../components/dashboard/VerificationCard";

export default function StudentDashboard() {
  return (
    <main className="flex min-h-screen bg-[#faf9f8]">
      <Sidebar activePage="/dashboard" />
      <main className="ml-64 min-h-screen p-12 w-full">
        <DashboardHeader />
        <UploadBanner />
        <QualificationsList />
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <OpportunityCard />
          <VerificationCard />
        </section>
      </main>
      <button className="fixed bottom-8 right-8 w-16 h-16 bg-[#035b9d] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-40 text-2xl">
        🛡️
      </button>
    </main>
  );
}