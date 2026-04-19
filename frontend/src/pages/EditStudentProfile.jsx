import { Sidebar } from "../components/dashboard/Sidebar";
import { EditProfileForm } from "../components/studentProfile/editProfileForm";

export default function EditProfile() {
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
            <header className="mb-12">
              <h1 className="text-4xl lg:text-5xl font-extrabold text-[#1b1c1c] tracking-tight mb-4">
                Edit Profile
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed">
                Keep your profile up to date to stay visible to the right opportunities.
              </p>
            </header>

            <EditProfileForm />
          </div>
        </section>
      </section>

      <div className="fixed bottom-0 right-0 w-64 h-64 opacity-10 pointer-events-none overflow-hidden">
        <div className="w-full h-full bg-[#035b9d] rounded-full blur-[100px]" />
      </div>
    </main>
  );
}