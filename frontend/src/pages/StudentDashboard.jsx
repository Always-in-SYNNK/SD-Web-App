import { Sidebar } from "../components/dashboard/Sidebar";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { UploadBanner } from "../components/dashboard/UploadBanner";
import { QualificationList } from "../components/dashboard/QualificationList";
import { OpportunityCard } from "../components/dashboard/OpportunityCard";
import { VerificationCard } from "../components/dashboard/VerificationCard";
import { NotificationDropdown } from "../components/notifications/notificationDropdown";

export default function StudentDashboard() {
  return (
    <main className="flex min-h-screen bg-[#faf9f8]">
      <Sidebar activePage="/dashboard" />
      <section className="ml-64 min-h-screen w-full">

        <nav className="sticky top-0 z-50 flex items-center justify-between px-12 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <section className="flex items-center gap-6 text-sm font-medium">
            <a href="/" className="text-gray-400 hover:text-[#035b9d]">Home</a>
            <a href="/dashboard" className="text-[#035b9d] font-bold border-b-2 border-[#035b9d] pb-0.5">Dashboard</a>
          </section>
          <section className="flex items-center gap-3">
            <NotificationDropdown />
            <button className="p-2 hover:bg-gray-100 rounded-full">❓</button>
            <figure className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#035b9d] font-bold text-xs">
              JD
            </figure>
          </section>
        </nav>

        <section className="p-12">
          <DashboardHeader />
          <UploadBanner />
          <QualificationList />
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <OpportunityCard />
            <VerificationCard />
          </section>
        </section>
      </section>

      <button className="fixed bottom-8 right-8 w-16 h-16 bg-[#035b9d] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-40 text-2xl">
        🛡️
      </button>
    </main>
  );
}