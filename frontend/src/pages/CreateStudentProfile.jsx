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
          <article className="max-w-4xl mx-auto">

            <header className="mb-12 text-center">
              <h1 className="text-4xl lg:text-5xl font-extrabold text-[#1b1c1c] tracking-tight mb-4">
                Architect Your Future.
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed max-w-2xl mx-auto">
                Let's build your professional foundation. Your profile is the stage where your ambition meets opportunity.
              </p>
            </header>

            <section className="mb-10 grid gap-6 sm:grid-cols-2">
              <article className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <section className="flex items-center justify-between gap-4">
                  <section>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Progress</p>
                    <p className="mt-2 text-3xl font-extrabold text-slate-900">25%</p>
                  </section>
                  <div className="h-3 w-24 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full w-1/4 rounded-full bg-gradient-to-r from-[#035b9d] to-[#3174b7]" />
                  </div>
                </section>
              </article>
            </section>

            <ProfileForm />

          </article>
        </section>
      </section>

      {/* Ambient glow */}
      <aside className="fixed bottom-0 right-0 w-64 h-64 opacity-10 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="w-full h-full bg-[#035b9d] rounded-full blur-[100px]" />
      </aside>
    </main>
  );
}