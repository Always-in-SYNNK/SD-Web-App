/**
 * ProviderLogin
 * Uses your existing AuthLayout + AuthHeroPanel + AuthFormPanel.
 * No extra divs/spans — everything is semantic or uses fragments.
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
          {/* Error banner */}
          {error && (
            <p className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
              {error}
            </p>
          )}

          {/* Verification success banner */}
          {showVerificationMessage && (
            <section className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm text-center space-y-1" role="status">
              <p className="font-semibold">✓ Verification email sent!</p>
              <p>Please check <strong>{verificationEmail}</strong> and click the verification link.</p>
              <p className="text-xs text-green-600">Link expires in 24 hours.</p>
            </section>
          )}

          {/* Main content — hidden while verification pending */}
          {!showVerificationMessage && (
            <>
              <header className="text-center mb-10">
                <h2 className="text-blue-950 text-3xl font-bold mb-3">Employer Access</h2>
                <p className="text-slate-500 font-medium">
                  Sign in or create your employer account to manage your talent pipelines.
                </p>
              </header>

              <section className="max-w-md mx-auto w-full space-y-8">
                {loading ? (
                  <p className="text-center text-slate-500 py-4">Processing...</p>
                ) : (
                  <ProviderGoogleLoginButton
                    onVerificationRequired={handleVerificationRequired}
                    onError={setError}
                    onLoadingChange={setLoading}
                  />
                )}

                <hr className="border-slate-100" />

                <aside className="bg-slate-50 rounded-xl p-6 border border-slate-100 flex gap-4" role="note">
                  <i
                    className="material-symbols-outlined text-sky-600 mt-1 shrink-0"
                    aria-hidden="true"
                    style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                  >
                    info
                  </i>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900">Employer Access</h3>
                    <p className="text-xs leading-relaxed text-slate-500 font-medium">
                      If you are an employer looking to post opportunities, please ensure you
                      use your verified organization credentials.
                    </p>
                  </div>
                </aside>

                <p className="text-slate-500 text-sm leading-relaxed text-center px-4">
                  By continuing, GrowthStageSA will automatically register you if you
                  don&apos;t have an account, or sign you in if you do.
                </p>
              </section>
            </>
          )}
        </AuthFormPanel>
      }
    />
  );
}