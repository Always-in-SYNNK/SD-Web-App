import { GoogleLogin } from "@react-oauth/google";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
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
  const { login } = useAuth();

  const handleCredentialResponse = useCallback(async (response) => {
    onLoadingChange(true);
    onError(null);

    try {
      const idToken = response.credential;
      
      if (!idToken) {
        throw new Error("No credential received");
      }

      const { exists } = await checkProviderUser(idToken);

      if (exists) {
        const signinData = await signInProvider(idToken);

        if (signinData.success) {
          // Force role to provider
          const userWithRole = {
            ...signinData.user,
            role: "provider"
          };
          
          // ✅ Get token from response
          const token = signinData.token;
          
          console.log("✅ Login successful - Token:", token ? "Present" : "MISSING");
          console.log("✅ User:", userWithRole);
          
          // ✅ Save EVERYTHING to localStorage
          if (token) {
            localStorage.setItem("token", token);
          }
          localStorage.setItem("user", JSON.stringify(userWithRole));
          localStorage.setItem("role", "provider");
          localStorage.setItem("provider_user", JSON.stringify(userWithRole));
          
          // ✅ Update AuthContext
          login(userWithRole, token);
          
          navigate("/pipeline");
        } else {
          onError(signinData.message || "Sign in failed");
        }
      } else {
        const signupData = await signUpProvider(idToken);

        if (signupData.success || signupData.pending) {
          onVerificationRequired(signupData.email || "your email");
        } else {
          onError(signupData.message || "Sign up failed");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      onError("Network error. Please try again.");
    } finally {
      onLoadingChange(false);
    }
  }, [onLoadingChange, onError, navigate, onVerificationRequired, login]);

  const handleGoogleError = useCallback(() => {
    onError("Google sign-in failed. Please try again.");
  }, [onError]);

  return (
    <section className="w-full flex items-center justify-center">
      <GoogleLogin
        onSuccess={handleCredentialResponse}
        onError={handleGoogleError}
        useOneTap={false}
        theme="outline"
        size="large"
        text="continue_with"
        shape="rectangular"
        logo_alignment="left"
        width="240"
      />
    </section>
  );
}