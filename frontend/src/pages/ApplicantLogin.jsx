// frontend/src/pages/ApplicantLogin.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import AuthHeroPanel from "../components/auth/AuthHeroPanel";
import AuthFormPanel from "../components/auth/AuthFormPanel";
import GoogleLoginButton from "../components/auth/GoogleLoginButton";

const HERO_IMAGE_URL =
  "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";

export default function ApplicantLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const [loading, setLoading] = useState(false);

  const handleSuccess = (res) => {
    setLoading(false);
    if (res.isNewUser) {
      navigate("/onboarding");
      return;
    }
    const role = res.user?.role;
    if (role === "applicant") {
      navigate(from || "/dashboard");
    } else {
      navigate("/auth-error", {
        state: {
          loginPage: "app-login",
          message: "Account type mismatch. Please use the employer login.",
        },
      });
    }
  };

  return (
    <AuthLayout
      heroPanel={
        <AuthHeroPanel
          headline="Build Your Future,"
          accentLine="One Skill at a Time."
          backgroundImageUrl={HERO_IMAGE_URL}
          badges={[
            { icon: "verified", label: "SETA ACCREDITED" },
            { icon: "school", label: "SKILLS TRACKING" },
          ]}
        />
      }
      formPanel={
        <AuthFormPanel onBack={() => navigate("/")}>
          {/* Errors are routed to the centralized AuthError page */}

          <header className="text-center">
            <h2 className="text-[#004377] text-3xl font-bold mb-3">
              Welcome Back
            </h2>
            <p className="text-slate-500 font-medium">
              Sign in or create your account and apply for opportunities.
            </p>
          </header>

          <section className="max-w-md mx-auto w-full mt-8 space-y-8">
            {loading ? (
              <p className="text-center text-slate-500 py-4">Processing...</p>
            ) : (
              <GoogleLoginButton
                selectedRole="applicant"
                from={from}
                onLoadingChange={setLoading}
                onSuccess={handleSuccess}
              />
            )}

            <hr className="border-slate-100" />

            <aside className="bg-[#004377]/5 rounded-xl p-6 border border-[#004377]/10">
              <header className="flex gap-3">
                <i
                  className="material-symbols-outlined text-[#004377] mt-0.5 shrink-0"
                  aria-hidden="true"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                >
                  school
                </i>
                <h3 className="text-sm font-bold text-[#004377]">
                  For Learners & Job Seekers
                </h3>
              </header>
              <p className="text-xs leading-relaxed text-slate-600 font-medium mt-2 pl-8">
                Find SETA-accredited learnerships, track your applications,
                and connect with top employers across South Africa.
              </p>
            </aside>

            <p className="text-slate-500 text-sm leading-relaxed text-center px-4">
              By continuing, GrowthStageSA will automatically register you if
              you don&apos;t have an account, or sign you in if you do.
            </p>
          </section>
        </AuthFormPanel>
      }
    />
  );
}