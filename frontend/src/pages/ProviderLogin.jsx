/**
 * ProviderLogin
 * Your existing layout with her auth states wired in around the new button.
 * useNavigate kept since this is your routing convention.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout                from "../components/auth/AuthLayout";
import AuthHeroPanel             from "../components/auth/AuthHeroPanel";
import AuthFormPanel             from "../components/auth/AuthFormPanel";
import ProviderGoogleLoginButton from "../components/auth/ProviderGoogleLoginButton";

const HERO_IMAGE_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDxNPyShfIjVGSg0JRX5t6gMdYfWSad3-JBDqPllih_qCrvQI6gj0CkdUZ6FgGjkbWALsM8D8lnpJO1k3L3CKiApnRUHx53SVp-w0qKYzGb0PiezwFvCvQAeJltcACD3F_sFQytmH-BXopRUBDOUUVkz1hGSOOgrpHiHmDCITIhPQiEUhAbAT-czEzzxCJDgArueKQb7uYLuYJEeNx5F4nfdPkhKG36Nyxhajn-jkyO7wFtuj5646YpTAbsvwzASsMdGHvTMJABHVqA";

export default function ProviderLogin() {
  const navigate = useNavigate();

  // Auth states from her flow — drive the UI below
  const [error,                   setError]                   = useState(null);
  const [loading,                 setLoading]                 = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [verificationEmail,       setVerificationEmail]       = useState("");

  const handleVerificationRequired = (email) => {
    setVerificationEmail(email);
    setShowVerificationMessage(true);
  };

  return (
    <AuthLayout
      heroPanel={
        <AuthHeroPanel
          headline="Source the Next Generation"
          accentLine="of SA Talent."
          backgroundImageUrl={HERO_IMAGE_URL}
          badges={[
            { icon: "verified", label: "SETA ACCREDITED PARTNER" },
          ]}
        />
      }
      formPanel={
        <AuthFormPanel onBack={() => navigate("/")}>

          <div className="text-center mb-10">
            <h2 className="text-blue-950 text-3xl font-bold mb-3">Welcome Back</h2>
            <p className="text-slate-500 font-medium">
              Sign in or create your employer account to manage your talent pipelines.
            </p>
          </div>

          <div className="max-w-md mx-auto w-full space-y-8">

            {/* Error banner */}
            {error && (
              <p className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
                {error}
              </p>
            )}

            {/* Verification email sent banner */}
            {showVerificationMessage && (
              <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm text-center space-y-1">
                <p className="font-semibold">✓ Verification email sent!</p>
                <p>Please check <strong>{verificationEmail}</strong> and click the verification link.</p>
                <p className="text-xs text-green-600">Link expires in 24 hours.</p>
              </div>
            )}

            {/* Button — hidden once verification is pending or while loading */}
            {!showVerificationMessage && (
              loading ? (
                <p className="text-center text-slate-500 py-4">Processing...</p>
              ) : (
                <ProviderGoogleLoginButton
                  onVerificationRequired={handleVerificationRequired}
                  onError={setError}
                  onLoadingChange={setLoading}
                />
              )
            )}

            <div className="relative flex items-center justify-center" role="separator">
              <div className="flex-grow border-t border-slate-100" />
              <span className="flex-shrink mx-4 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold">
                Trusted Employer Network
              </span>
              <div className="flex-grow border-t border-slate-100" />
            </div>

            {/* Employer info callout */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 flex gap-4">
              <span
                className="material-symbols-outlined text-sky-600 mt-1 shrink-0"
                aria-hidden="true"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                info
              </span>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Employer Access</h3>
                <p className="text-xs leading-relaxed text-slate-500 font-medium">
                  If you are an employer looking to post opportunities, please ensure you
                  use your verified organization credentials.
                </p>
              </div>
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
