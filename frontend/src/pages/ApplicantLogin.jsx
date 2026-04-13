import { useNavigate } from "react-router-dom";
import AuthLayout        from "../components/auth/AuthLayout";
import AuthHeroPanel     from "../components/auth/AuthHeroPanel";
import AuthFormPanel     from "../components/auth/AuthFormPanel";
import GoogleLoginButton from "../components/auth/GoogleLoginButton";

const HERO_IMAGE_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDxNPyShfIjVGSg0JRX5t6gMdYfWSad3-JBDqPllih_qCrvQI6gj0CkdUZ6FgGjkbWALsM8D8lnpJO1k3L3CKiApnRUHx53SVp-w0qKYzGb0PiezwFvCvQAeJltcACD3F_sFQytmH-BXopRUBDOUUVkz1hGSOOgrpHiHmDCITIhPQiEUhAbAT-czEzzxCJDgArueKQb7uYLuYJEeNx5F4nfdPkhKG36Nyxhajn-jkyO7wFtuj5646YpTAbsvwzASsMdGHvTMJABHVqA";

export default function ApplicantLogin() {
  const navigate = useNavigate();
  return (
    <AuthLayout
      heroPanel={
        <AuthHeroPanel
          headline="Build Your Future,"
          accentLine="One skill at a time."
          backgroundImageUrl={HERO_IMAGE_URL}
          badges={[
            { icon: "verified", label: "SETA Accredited" },
            { icon: "school",   label: "Skills Tracking"  },
          ]}
        />
      }
      formPanel={
        <AuthFormPanel onBack={() => navigate("/")}>

          <div className="text-center mb-10">
            <h2 className="text-blue-950 text-3xl font-bold mb-3">Welcome Back</h2>
            <p className="text-slate-500 font-medium">
              One click to sign in or create your candidate account.
            </p>
          </div>

          <div className="max-w-md mx-auto w-full space-y-8">
            <GoogleLoginButton />

            <div className="relative flex items-center justify-center" role="separator">
              <div className="flex-grow border-t border-slate-100" />
              <span className="flex-shrink mx-4 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold">
                Secure Access
              </span>
              <div className="flex-grow border-t border-slate-100" />
            </div>

            <p className="text-slate-500 text-sm leading-relaxed text-center px-4">
              By continuing, GrowthStageSA will automatically register you if you
              don&apos;t have an account, or sign you in if you do.
            </p>
          </div>

        </AuthFormPanel>
      }
    />
  );
}
