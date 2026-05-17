import { useAuth } from "../context/useAuth";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import { EditProviderProfileForm } from "../components/employer/EditProviderProfileForm";

export default function EditProviderProfile() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="ml-64 flex flex-col min-h-screen w-full min-w-0">
        <Topbar user={user} />

        <section className="pb-24 px-8 pt-12">
          <div className="max-w-4xl mx-auto">

            <header className="mb-12">
              <small className="text-sm font-semibold tracking-wider text-[#035b9d] uppercase">
                Provider Profile
              </small>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-[#1b1c1c] tracking-tight mb-4 mt-1">
                Edit Profile
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed">
                Keep your organisation details up to date so applicants can find the right fit.
              </p>
            </header>

            <EditProviderProfileForm />
          </div>
        </section>
      </div>
    </div>
  );
}
