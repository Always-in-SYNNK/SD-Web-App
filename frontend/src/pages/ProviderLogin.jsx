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
  "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";

export default function ProviderLogin() {
  const navigate = useNavigate();

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
          accentColor="text-[#f59e0b]"  // Amber for provider accent
          badgeBgColor="bg-[#f59e0b]/10"  // Subtle amber badge background
          badges={[
            { icon: "verified", label: "SETA ACCREDITED PARTNER" },
            { icon: "corporate_fare", label: "VERIFIED EMPLOYERS" },
          ]}
        />
      }
      formPanel={
        <AuthFormPanel onBack={() => navigate("/")}>
          {/* Error banner 
          {error && (
            <p className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
              {error}
            </p>
          )}
*/}
          {/* Verification success banner */}
          {showVerificationMessage && (
            <section role="status" aria-live="polite" className="p-4 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg text-sm text-center space-y-1">
              <p className="font-semibold">✓ Verification email sent!</p>
              <p>
                Please check <strong>{verificationEmail}</strong> and click the
                verification link.
              </p>
              <p className="text-xs text-orange-600">Link expires in 24 hours.</p>
            </section>
          )}

          {/* Main content — hidden while verification pending */}
          {!showVerificationMessage && (
            <>
              <header className="text-center">
                <h2 className="text-[#f59e0b] text-3xl font-bold mb-3">
                  Provider Access
                </h2>
                <p className="text-slate-500 font-medium">
                  Sign in or create your provider account to manage your talent pipelines.
                </p>
              </header>

              <section className="max-w-md mx-auto w-full mt-8 space-y-8">
                {loading ? (
                  <p className="text-center text-slate-500 py-4">Processing...</p>
                ) : (
                  <ProviderGoogleLoginButton
                    onVerificationRequired={handleVerificationRequired}
                    onError={(msg) => navigate('/auth-error', { state: { loginPage: 'prov-login', message: msg } })}
                    onLoadingChange={setLoading}
                  />
                )}

                <hr className="border-slate-100" />

                <aside className="bg-[#f59e0b]/5 rounded-xl p-6 border border-[#f59e0b]/10">
                  <header className="flex gap-3">
                    <i
                      className="material-symbols-outlined text-[#f59e0b] mt-0.5 shrink-0"
                      aria-hidden="true"
                      style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                    >
                      business
                    </i>
                    <h3 className="text-sm font-bold text-[#f59e0b]">
                      For Providers & Employers
                    </h3>
                  </header>
                  <p className="text-xs leading-relaxed text-slate-600 font-medium mt-2 pl-8">
                    Post learnership opportunities, find verified talent, and
                    manage your recruitment pipelines all in one place. 
                  </p>
                  <p className="text-xs leading-relaxed text-slate-600 font-medium mt-2 pl-8">
                    Please ensure you use your verified organization credentials.
                  </p>
                </aside>

                <p className="text-slate-500 text-sm leading-relaxed text-center px-4">
                  By continuing, GrowthStageSA will automatically register you
                  if you don&apos;t have an account, or sign you in if you do.
                </p>
              </section>
            </>
          )}
        </AuthFormPanel>
      }
    />
  );
}