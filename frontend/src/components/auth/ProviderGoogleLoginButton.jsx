/**
 * ProviderGoogleLoginButton
 * Uses her 3-step auth flow via authService.
 * Intentionally does NOT use useAuth — provider session is managed
 * separately via localStorage and her own backend.
 */

import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import {
  checkProviderUser,
  signInProvider,
  signUpProvider,
} from "../../services/authService";

export default function ProviderGoogleLoginButton({
  onVerificationRequired,
  onError,
  onLoadingChange,
}) {
  const navigate = useNavigate();

  const handleSuccess = async (response) => {
    onLoadingChange(true);
    onError(null);

    try {
      const { exists } = await checkProviderUser(response.credential);

      if (exists) {
        const signinData = await signInProvider(response.credential);

        if (signinData.success) {
          localStorage.setItem("provider_user", JSON.stringify(signinData.user));
          navigate("/pipeline");
        } else {
          onError(signinData.message || "Sign in failed");
        }
      } else {
        const signupData = await signUpProvider(response.credential);

        if (signupData.success || signupData.pending) {
          onVerificationRequired(signupData.email || "your email");
        } else {
          onError(signupData.message || "Sign up failed");
        }
      }
    } catch {
      onError("Network error. Please try again.");
    } finally {
      onLoadingChange(false);
    }
  };

  const handleError = () => {
    onError("Google sign-in was cancelled or failed. Please try again.");
    onLoadingChange(false);
  };

  const triggerLogin = useGoogleLogin({
    onSuccess: handleSuccess,
    onError:   handleError,
  });

  return (
    <button
      type="button"
      onClick={() => triggerLogin()}
      className="w-full flex items-center justify-center gap-4 h-16 px-6 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-sky-500/30 transition-all active:scale-[0.98] shadow-sm"
    >
      <div className="flex items-center justify-center w-6 h-6" aria-hidden="true">
        <svg className="w-6 h-6" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
      </div>
      <span className="text-lg font-bold">Continue with Google</span>
    </button>
  );
}
