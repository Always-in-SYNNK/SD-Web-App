import { Sidebar } from "../components/dashboard/Sidebar";
import { ProfileForm } from "../components/studentProfile/profileForm";

export default function CompleteProfile() {
  return (
    <main className="flex min-h-screen bg-[#faf9f8]">
      <Sidebar activePage="/profile" />
      <section className="ml-64 min-h-screen w-full">

        <nav className="sticky top-0 z-50 flex items-center justify-end px-12 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <section className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-full">🔔</button>
            <button className="p-2 hover:bg-gray-100 rounded-full">⚙️</button>
          </section>
        </nav>

        <section className="min-h-screen pb-24 px-8 pt-12">
          <div className="max-w-4xl mx-auto">

            <header className="mb-12 text-center">
              <h1 className="text-4xl lg:text-5xl font-extrabold text-[#1b1c1c] tracking-tight mb-4">
                Architect Your Future.
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed max-w-2xl mx-auto">
                Let's build your professional foundation. Your profile is the stage where your ambition meets opportunity.
              </p>
              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-3 bg-gray-100 px-6 py-3 rounded-full">
                  <span className="text-[#035b9d] font-bold">25%</span>
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="w-1/4 h-full bg-[#035b9d] rounded-full" />
                  </div>
                  <span className="text-gray-400 text-sm uppercase tracking-widest font-semibold">Progress</span>
                </div>
              </div>
            </header>

            <ProfileForm />

          </div>
        </section>
      </section>

      {/* Ambient glow */}
      <div className="fixed bottom-0 right-0 w-64 h-64 opacity-10 pointer-events-none overflow-hidden">
        <div className="w-full h-full bg-[#035b9d] rounded-full blur-[100px]" />
      </div>
    </main>
  );
}